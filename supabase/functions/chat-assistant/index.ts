import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.12.0";

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
                status: 200, // Return 200 to allow client to read error
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. Generate AI Response
        const systemPrompt = `You are the AI Front Desk Assistant for Jungle Heritage Resort.
    Tone: Luxury, warm, polite, professional, persuasive.
    Goal: Assist with bookings, answer FAQs, and collect lead details (Name, Email, Phone, Dates, Guests).
    
    Resort Info:
    - Location: Dudhwa National Park.
    - Offerings: Private villas, jungle safaris, nature walks, simplified luxury.
    - Policy: Unmarried couples welcome.
    
    If the user expresses interest in booking, ask for their travel dates and number of guests.
    If they provide details, confirm them and suggest our "Premium Villa" or "Jungle Cottage".
    If asked about price, give a range but say exact rates depend on dates.
    
    ALWAYS keep responses concise (under 3 sentences unless detailed info is requested).
    `;

        const chatHistory = messages.map((m: any) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: m.content }],
        }));

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }]
                },
                {
                    role: "model",
                    parts: [{ text: "Understood. I am ready to assist guests of Jungle Heritage Resort." }]
                },
                ...chatHistory.slice(0, -1) // All except last
            ],
            generationConfig: {
                maxOutputTokens: 500,
            }
        });

        const lastMessage = messages[messages.length - 1].content;
        let responseText = "";

        try {
            const result = await chat.sendMessage(lastMessage);
            responseText = result.response.text();
            console.log("Gemini Response generated");
        } catch (aiError) {
            console.error("Gemini API Error:", aiError);
            return new Response(JSON.stringify({ error: `AI Error: ${aiError.message}` }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 200,
            });
        }

        // 2. Extract Lead Info (Lightweight parallel call)
        let leadData = {};
        try {
            const extractionPrompt = `Analyze this message: "${lastMessage}". Does it contain Name, Email, Phone, Dates, or Guest Count? Return JSON: { "name": string|null, "email": string|null, "phone": string|null, "dates": string|null, "guests": string|null, "type": "booking"|"general"|"safari"|"wedding" }. Return {} if nothing found.`;
            const extractionModel = genAI.getGenerativeModel({ model: "gemini-pro" });
            const extractionResult = await extractionModel.generateContent(extractionPrompt);
            const extractionText = extractionResult.response.text();
            leadData = JSON.parse(extractionText);
        } catch (e) {
            console.error("Extraction Warning:", e);
            // Non-critical, continue
        }

        // 3. Save to Database
        try {
            if (sessionId) {
                const updatedMessages = [...messages, { role: "assistant", content: responseText }];
                const { error: sessionError } = await supabase.from("chat_sessions").upsert({
                    id: sessionId,
                    user_id: userId,
                    messages: updatedMessages,
                    updated_at: new Date().toISOString()
                });
                if (sessionError) console.error("Session Save Error:", sessionError);
            }

            if (leadData && Object.values(leadData).some(v => v)) {
                const { error: leadError } = await supabase.from("chat_leads").insert({
                    ...leadData,
                    status: 'new',
                    inquiry_type: leadData.type || 'general'
                });
                if (leadError) console.error("Lead Save Error:", leadError);
            }
        } catch (dbError) {
            console.error("Database Operation Error:", dbError);
            // Don't fail request if DB fails, still return response to user
        }

        return new Response(JSON.stringify({ response: responseText, lead: leadData }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("General Function Error:", error);
        return new Response(JSON.stringify({ error: `Internal Server Error: ${error.message}` }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200, // Return 200 to allow client to display error
        });
    }
});
