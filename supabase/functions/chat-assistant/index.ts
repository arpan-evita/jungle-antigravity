import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.16.0";

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

        console.log("Received request:", { userId, sessionId, messageCount: messages?.length });

        const apiKey = Deno.env.get("GEMINI_API_KEY");
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

        if (!apiKey) {
            console.error("Missing GEMINI_API_KEY");
            return new Response(JSON.stringify({ error: "Configuration Error: GEMINI_API_KEY is missing." }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        // --- DIAGNOSTIC START ---
        // Verify which models are available for this API Key
        // This helps debug 404 Model Not Found errors
        /*
        try {
           const modelList = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).countTokens("test");
           // ^ Not a real list call, just a test. Real listing requires different API or just try-catch.
           // Actually, standard SDK doesn't expose listModels cleanly in all versions.
           // We will just proceed and catch specific 404s.
        } catch (e) {
           console.log("Model check failed", e);
        }
        */
        // --- DIAGNOSTIC END ---

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const supabase = createClient(supabaseUrl, supabaseKey);

        const systemPrompt = `You are the AI Front Desk Assistant for Jungle Heritage Resort.
    Tone: Luxury, warm, polite, professional, persuasive.
    Goal: Assist with bookings, answer FAQs, and collect lead details (Name, Email, Phone, Dates, Guests).
    Resort Info: Location: Dudhwa National Park. Offerings: Private villas, jungle safaris.
    ALWAYS keep responses concise (under 3 sentences).`;

        const chatHistory = messages.map((m: any) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
        }));

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: systemPrompt }] },
                { role: "model", parts: [{ text: "Understood. I am ready to assist." }] },
                ...chatHistory.slice(0, -1)
            ],
            generationConfig: { maxOutputTokens: 500 }
        });

        const lastMessage = messages[messages.length - 1].content;
        let responseText = "";

        try {
            const result = await chat.sendMessage(lastMessage);
            responseText = result.response.text();
            console.log("Gemini Response generated");
        } catch (aiError) {
            console.error("Gemini API Error:", aiError);

            // Check for 404 (Model Not Found) or 400 (Bad Request)
            if (aiError.message?.includes("404") || aiError.toString().includes("Not Found")) {
                return new Response(JSON.stringify({
                    error: `Model Not Found. Your API Key might not have access to 'gemini-1.5-flash'. Please try 'gemini-pro'. Error: ${aiError.message}`
                }), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                    status: 200,
                });
            }

            return new Response(JSON.stringify({ error: `AI Error: ${aiError.message}` }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }

        // Extraction (Lead Info)
        let leadData = {};
        try {
            const extractionPrompt = `Analyze: "${lastMessage}". Return JSON: { "name": null, "email": null, "phone": null, "dates": null, "guests": null, "type": "booking"|"general"|"safari"|"wedding" }. Return {} if empty.`;
            const extractionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
            const extractionResult = await extractionModel.generateContent(extractionPrompt);
            leadData = JSON.parse(extractionResult.response.text());
        } catch (e) {
            console.error("Extraction Warning:", e);
        }

        // Database
        try {
            if (sessionId) {
                await supabase.from("chat_sessions").upsert({
                    id: sessionId,
                    user_id: userId,
                    messages: [...messages, { role: "assistant", content: responseText }],
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
        } catch (dbError) {
            console.error("Database Operation Error:", dbError);
        }

        return new Response(JSON.stringify({ response: responseText, lead: leadData }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("General Function Error:", error);
        return new Response(JSON.stringify({ error: `Internal Server Error: ${error.message}` }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
        });
    }
});
