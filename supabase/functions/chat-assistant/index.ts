import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const body = await req.json();
        const { messages, userId, sessionId } = body;
        const apiKey = (Deno.env.get("GEMINI_API_KEY") ?? "").trim();
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

        if (!apiKey) {
            return new Response(JSON.stringify({ error: "Configuration Error: GEMINI_API_KEY is missing." }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
        }

        // STEP 1: DYNAMICALLY LIST MODELS
        // We cannot guess. We must ask Google what models this key can see.
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const listResp = await fetch(listUrl);

        if (!listResp.ok) {
            const errText = await listResp.text();
            return new Response(JSON.stringify({ error: `List Models Failed: ${listResp.status} - ${errText}` }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
        }

        const listData = await listResp.json();
        const models = listData.models || [];

        // Filter for generation models
        const chatModels = models.filter((m: any) =>
            m.supportedGenerationMethods &&
            m.supportedGenerationMethods.includes("generateContent") &&
            m.name.includes("gemini")
        );

        if (chatModels.length === 0) {
            return new Response(JSON.stringify({
                error: `No chat models found for this key. Available models: ${models.map((m: any) => m.name).join(", ")}`
            }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
        }

        // Prefer 1.5-flash, then 1.5-pro, then pro, then anything else
        // Sort/Find logic
        let selectedModel = chatModels.find((m: any) => m.name.includes("gemini-1.5-flash")) ||
            chatModels.find((m: any) => m.name.includes("gemini-1.5-pro")) ||
            chatModels.find((m: any) => m.name.includes("gemini-pro")) ||
            chatModels[0];

        // The name comes back as "models/gemini-pro", we need just "gemini-pro" for some endpoints, 
        // but v1beta usually accepts "models/..." or just names. Let's use the full name as returned by the list API to be safe, 
        // OR strip it if the generate endpoint requires it.
        // The generate endpoint: models/{modelId}:generateContent
        const modelId = selectedModel.name.replace("models/", "");

        console.log(`Auto-selected model: ${modelId}`);

        // STEP 2: GENERATE CONTENT
        const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

        const systemPrompt = `You are the AI Front Desk Assistant for Jungle Heritage Resort.
        Tone: Luxury, warm, polite, professional, persuasive.
        Goal: Assist with bookings, answer FAQs, and collect lead details (Name, Email, Phone, Dates, Guests).
        Resort Info: Location: Dudhwa National Park. Offerings: Private villas, jungle safaris.
        ALWAYS keep responses concise (under 3 sentences unless detailed info is requested).`;

        const contents = messages.map((m: any) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }]
        }));

        // Add system prompt to first user message to be safe
        if (contents.length > 0 && contents[0].role === "user") {
            contents[0].parts[0].text = `${systemPrompt}\n\n${contents[0].parts[0].text}`;
        } else {
            contents.unshift({ role: "user", parts: [{ text: systemPrompt }] });
        }

        const genResp = await fetch(genUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: contents,
                generationConfig: { maxOutputTokens: 500 }
            })
        });

        if (!genResp.ok) {
            const errText = await genResp.text();
            return new Response(JSON.stringify({ error: `Generation Failed with model ${modelId}: ${genResp.status} - ${errText}` }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
        }

        const genData = await genResp.json();
        const responseText = genData.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";

        // SAVE TO DB
        const supabase = createClient(supabaseUrl, supabaseKey);
        try {
            if (sessionId) {
                await supabase.from("chat_sessions").upsert({
                    id: sessionId,
                    user_id: userId,
                    messages: [...messages, { role: "assistant", content: responseText }],
                    metadata: { used_model: modelId },
                    updated_at: new Date().toISOString()
                });
            }
        } catch (dbError) { console.error("DB Error", dbError); }

        return new Response(JSON.stringify({ response: responseText, model: modelId }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: `Server Error: ${error.message}` }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }
});
