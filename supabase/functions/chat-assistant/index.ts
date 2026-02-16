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

        const supabase = createClient(supabaseUrl, supabaseKey);

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

        // Prefer 1.5-flash as it is the most quota-friendly for free tier.
        // Filter out 'latest' models which often have stricter quotas or are experimental/paid.
        let selectedModel = chatModels.find((m: any) => m.name.includes("gemini-1.5-flash")) ||
            chatModels.find((m: any) => m.name.includes("gemini-1.5-pro") && !m.name.includes("latest")) ||
            chatModels.find((m: any) => m.name.includes("gemini-pro") && !m.name.includes("latest")) ||
            chatModels[0];

        // The name comes back as "models/gemini-pro", we need just "gemini-pro" for some endpoints, 
        // but v1beta usually accepts "models/..." or just names. Let's use the full name as returned by the list API to be safe, 
        // OR strip it if the generate endpoint requires it.
        // The generate endpoint: models/{modelId}:generateContent
        const modelId = selectedModel.name.replace("models/", "");

        console.log(`Auto-selected model: ${modelId}`);

        // --- RAG STEP: Context Retrieval ---
        let contextText = "";
        const userMessage = messages[messages.length - 1]?.content || "";

        try {
            const embedUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${apiKey}`;
            const embedResp = await fetch(embedUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "models/gemini-embedding-001",
                    content: { parts: [{ text: userMessage }] }
                })
            });

            if (embedResp.ok) {
                const embedData = await embedResp.json();
                const embedding = embedData.embedding.values;

                const { data: chunks, error: matchError } = await supabase.rpc('match_documents', {
                    query_embedding: embedding,
                    match_threshold: 0.5,
                    match_count: 5
                });

                if (!matchError && chunks) {
                    contextText = chunks.map((c: any) => c.content).join("\n\n");
                }
            }
        } catch (ragError) {
            console.error("RAG Context Error:", ragError);
        }

        // STEP 2: GENERATE CONTENT
        const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

        const systemPrompt = `You are the AI Front Desk Assistant for Jungle Heritage Resort.
        Tone: Luxury, warm, polite, professional, persuasive.
        Goal: Assist with bookings, answer FAQs using PROVIDED CONTEXT, and collect lead details.
        
        CRITICAL INSTRUCTIONS:
        1. If user wants to book/reserve, reply ONLY with: "[SHOW_BOOKING_FORM]"
        2. USE DIRECT LINKS: When the context contains a specific link for a blog, experience, or package (e.g., /blog/some-title or /experiences/some-name), share that EXACT link using markdown.
        3. BE PROACTIVE: If asked for "blogs" or "experiences", share the titles and direct links of the latest items found in the context. If no specific items are found, point them to the general /blog or /experiences page.
        
        KNOWLEDGE CONTEXT:
        ${contextText || "No context found. Welcome the guest and provide general help."}
        
        Resort Info: Location: Dudhwa National Park near Kishanpur Gate.
        Contact: +91 9250225752.
        Concise responses (under 4 sentences).`;

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
