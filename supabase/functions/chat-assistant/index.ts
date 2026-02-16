import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.16.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODELS_TO_TRY = ["gemini-1.5-flash", "gemini-pro", "gemini-1.5-pro"];

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
            return new Response(JSON.stringify({ error: "Configuration Error: GEMINI_API_KEY is missing." }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
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

        const lastMessage = messages[messages.length - 1].content;
        let responseText = "";
        let usedModel = "";
        let aiError = null;

        // 1. Try Models Sequentially
        for (const modelName of MODELS_TO_TRY) {
            try {
                console.log(`Attempting to use model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });

                const chat = model.startChat({
                    history: [
                        { role: "user", parts: [{ text: systemPrompt }] },
                        { role: "model", parts: [{ text: "Understood. I am ready to assist." }] },
                        ...chatHistory.slice(0, -1)
                    ],
                    generationConfig: { maxOutputTokens: 500 }
                });

                const result = await chat.sendMessage(lastMessage);
                responseText = result.response.text();
                usedModel = modelName;
                console.log(`Success with model: ${modelName}`);
                break; // Exit loop on success
            } catch (error) {
                console.warn(`Failed with model ${modelName}:`, error.message);
                aiError = error;
                // Continue to next model
            }
        }

        if (!responseText) {
            return new Response(JSON.stringify({
                error: `All AI models failed. Last error: ${aiError?.message}`
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }

        // 2. Extract Lead Info (Using the working model)
        let leadData = {};
        try {
            const extractionPrompt = `Analyze: "${lastMessage}". Return JSON: { "name": null, "email": null, "phone": null, "dates": null, "guests": null, "type": "booking"|"general"|"safari"|"wedding" }. Return {} if empty.`;
            const extractionModel = genAI.getGenerativeModel({ model: usedModel, generationConfig: { responseMimeType: "application/json" } });
            const extractionResult = await extractionModel.generateContent(extractionPrompt);
            leadData = JSON.parse(extractionResult.response.text());
        } catch (e) {
            console.error("Extraction Warning:", e);
        }

        // 3. Save to Database
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
        } catch (dbError) {
            console.error("Database Operation Error:", dbError);
        }

        return new Response(JSON.stringify({ response: responseText, lead: leadData, model: usedModel }), {
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
