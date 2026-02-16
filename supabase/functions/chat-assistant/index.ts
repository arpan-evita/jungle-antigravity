import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to call Gemini REST API directly
async function callGemini(model: string, apiVersion: string, apiKey: string, messages: any[], systemPrompt: string) {
    const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${apiKey}`;

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
            { model: "gemini-pro", version: "v1beta" },
            { model: "gemini-pro", version: "v1" }
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

        // Data Extraction
        let leadData = {};
        try {
            const lastMsg = messages[messages.length - 1].content;
            if (lastMsg) {
                const extMessages = [{ role: 'user', content: `Analyze: "${lastMsg}". Return valid JSON only: { "name": null, "email": null, "phone": null, "dates": null, "guests": null, "type": "booking"|"general"|"safari"|"wedding" }. Return {} if empty.` }];
                try {
                    const extText = await callGemini("gemini-1.5-flash", "v1beta", apiKey, extMessages, "You are a JSON extractor.");
                    const cleanJson = extText.replace(/```json/g, '').replace(/```/g, '').trim();
                    leadData = JSON.parse(cleanJson);
                } catch (extErr) {
                    // Silent fail on extraction
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
