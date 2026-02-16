import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to call Gemini REST API directly
async function callGemini(model: string, apiVersion: string, apiKey: string, messages: any[], systemPrompt: string) {
    const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`;

    // Construct contents in the format expected by the API
    // Gemini API v1/v1beta expects: { contents: [ { parts: [ { text: "..." } ], role: "user"|"model" } ], systemInstruction: ... }
    // Note: systemInstruction is only for v1beta/gemini-1.5 models usually. gemini-pro (v1) might treat it differently or need it in prompt.
    // To be safe/universal, we'll prepend system prompt to the first message if it's gemini-pro, or use systemInstruction for 1.5.

    let contents = messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }]
    }));

    let requestBody: any = {
        contents: contents,
        generationConfig: {
            maxOutputTokens: 500,
        }
    };

    // Add System Prompt
    if (model.includes("1.5")) {
        // Use systemInstruction for 1.5 models
        requestBody.systemInstruction = {
            parts: [{ text: systemPrompt }]
        };
    } else {
        // For gemini-pro (v1), usually best to prepend to history
        // But to keep it simple, we'll just prepend to the contents list as a user message if it's the first turn, or generally just add it.
        // Actually best practice for simple chat is just to make it the first 'user' part.
        const existingFirst = contents[0];
        if (existingFirst && existingFirst.role === 'user') {
            existingFirst.parts[0].text = `${systemPrompt}\n\n${existingFirst.parts[0].text}`;
        } else {
            contents.unshift({ role: 'user', parts: [{ text: systemPrompt }] });
        }
    }

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API ${model} (${apiVersion}) failed: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    // Safety check for response structure
    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
        throw new Error("No content generated");
    }

    return data.candidates[0].content.parts[0].text;
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const body = await req.json();
        const { messages, userId, sessionId } = body;
        const apiKey = Deno.env.get("GEMINI_API_KEY");
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

        if (!apiKey) {
            return new Response(JSON.stringify({ error: "Configuration Error: GEMINI_API_KEY is missing." }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);

        const systemPrompt = `You are the AI Front Desk Assistant for Jungle Heritage Resort.
        Tone: Luxury, warm, polite, professional, persuasive.
        Goal: Assist with bookings, answer FAQs, and collect lead details (Name, Email, Phone, Dates, Guests).
        Resort Info: Location: Dudhwa National Park. Offerings: Private villas, jungle safaris.
        ALWAYS keep responses concise (under 3 sentences).`;

        let responseText = "";
        let usedModel = "";
        let lastError = null;

        // Strategy: Try Flash (v1beta) -> Pro (v1beta) -> Pro (v1)
        const strategies = [
            { model: "gemini-1.5-flash", version: "v1beta" },
            { model: "gemini-1.5-pro", version: "v1beta" },
            { model: "gemini-pro", version: "v1beta" }, // Standard Gemini Pro
            { model: "gemini-pro", version: "v1" }      // Old stable v1
        ];

        for (const strategy of strategies) {
            try {
                console.log(`Attempting ${strategy.model} via ${strategy.version}...`);
                responseText = await callGemini(strategy.model, strategy.version, apiKey, messages, systemPrompt);
                usedModel = `${strategy.model}-${strategy.version}`;
                console.log("Success!");
                break;
            } catch (e) {
                console.warn(`Failed: ${e.message}`);
                lastError = e;
            }
        }

        if (!responseText) {
            return new Response(JSON.stringify({ error: `All models failed. Last error: ${lastError?.message}` }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200
            });
        }

        // Data Extraction (Simple Regex/JSON via same method)
        let leadData = {};
        try {
            // Simplified extraction prompt for next turn
            const lastMsg = messages[messages.length - 1].content;
            if (lastMsg) {
                // We reuse the function but simple prompt
                // For extraction, just use flash or pro, whichever worked or default to flash
                // Need to wrap it as a message
                const extMessages = [{ role: 'user', content: `Analyze: "${lastMsg}". Return valid JSON only: { "name": null, "email": null, "phone": null, "dates": null, "guests": null, "type": "booking"|"general"|"safari"|"wedding" }. Return {} if empty.` }];

                // Try extraction with Flash first as it's cheapest/fastest
                try {
                    const extText = await callGemini("gemini-1.5-flash", "v1beta", apiKey, extMessages, "You are a JSON extractor.");
                    // Clean up markdown code blocks if present
                    const cleanJson = extText.replace(/```json/g, '').replace(/```/g, '').trim();
                    leadData = JSON.parse(cleanJson);
                } catch (extErr) {
                    // Fallback to the model that worked for chat
                    const extText = await callGemini(strategies[2].model, strategies[2].version, apiKey, extMessages, "You are a JSON extractor.");
                    const cleanJson = extText.replace(/```json/g, '').replace(/```/g, '').trim();
                    leadData = JSON.parse(cleanJson);
                }
            }
        } catch (e) {
            console.error("Extraction ignored:", e);
        }

        // DB save
        try {
            if (sessionId) {
                await supabase.from("chat_sessions").upsert({
                    id: sessionId,
                    user_id: userId,
                    messages: [...messages, { role: "assistant", content: responseText }],
                    metadata: { used_model: usedModel },
                    updated_at: new Date().toISOString()
                });
            }
            if (leadData && Object.values(leadData).some(v => v)) {
                await supabase.from("chat_leads").insert({
                    ...leadData,
                    status: 'new',
                    inquiry_type: leadData.type || 'general'
                });
            }
        } catch (dbError) { console.error("DB Error", dbError); }

        return new Response(JSON.stringify({ response: responseText, lead: leadData, model: usedModel }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: `Server Error: ${error.message}` }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }
});
