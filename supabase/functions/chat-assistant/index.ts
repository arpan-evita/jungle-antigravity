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
        const apiKey = Deno.env.get("GEMINI_API_KEY");
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

        // Diagnostic Step: Return the key presence and a simple test
        if (!apiKey) {
            return new Response(JSON.stringify({ error: "Configuration Error: GEMINI_API_KEY is missing." }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
        }

        // Direct fetch to list models (The most reliable way to debug)
        const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const listResp = await fetch(listUrl);
        const listData = await listResp.json();

        // Log the available models to the client (for debugging purposes)
        if (listData.models) {
            const modelNames = listData.models.map((m: any) => m.name);
            console.log("AVAILABLE MODELS:", modelNames);

            // Try to find a valid chat model
            const validModel = modelNames.find((n: string) => n.includes("gemini") && n.includes("generateContent"));

            if (!validModel) {
                return new Response(JSON.stringify({
                    error: `No suitable chat models found. Available: ${modelNames.join(", ")}`
                }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
            }

            // Now try to use that valid model
            // Extract just the name, e.g., "models/gemini-pro" -> "gemini-pro"
            const cleanName = validModel.replace("models/", "");

            // Construct the call
            const genUrl = `https://generativelanguage.googleapis.com/v1beta/models/${cleanName}:generateContent?key=${apiKey}`;
            const msgContent = body.messages[body.messages.length - 1].content;

            const genResp = await fetch(genUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: msgContent }] }]
                })
            });

            const genData = await genResp.json();

            if (genData.error) {
                return new Response(JSON.stringify({ error: `Model ${cleanName} failed: ${genData.error.message}` }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
            }

            const text = genData.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";

            // DB Save (simplified for debug)
            const supabase = createClient(supabaseUrl, supabaseKey);
            if (body.sessionId) {
                await supabase.from("chat_sessions").upsert({
                    id: body.sessionId,
                    user_id: body.userId,
                    messages: [...body.messages, { role: "assistant", content: text }],
                    updated_at: new Date().toISOString()
                });
            }

            return new Response(JSON.stringify({ response: text, model: cleanName, debug_models: modelNames }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ error: `List Models failed: ${JSON.stringify(listData)}` }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: `Server Error: ${error.message}` }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
    }
});
