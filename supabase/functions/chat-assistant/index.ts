import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { messages, userId, sessionId } = await req.json();
        const apiKey = Deno.env.get("GEMINI_API_KEY");
        const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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

        // Prepend system prompt to history or use systemInstruction if supported by SDK version
        // For safety, we'll just prepend it to the first message or rely on the model's ability to handle it.
        // Deno SDK might be slightly different, but let's try standard chat.

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
        const result = await chat.sendMessage(lastMessage);
        const responseText = result.response.text();

        // 2. Extract Lead Info (Lightweight parallel call)
        // We only check if the last message potentially contains lead info
        const extractionPrompt = `Analyze this message: "${lastMessage}". Does it contain Name, Email, Phone, Dates, or Guest Count? Return JSON: { "name": string|null, "email": string|null, "phone": string|null, "dates": string|null, "guests": string|null, "type": "booking"|"general"|"safari"|"wedding" }. Return {} if nothing found.`;

        // We won't block the response on this, but for simplicity in this script we await it.
        // In a production edge function, we might want to fire-and-forget or use a separate queue, 
        // but Deno edge functions kill bg processes early. We must await.
        const extractionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig: { responseMimeType: "application/json" } });
        const extractionResult = await extractionModel.generateContent(extractionPrompt);
        const extractionText = extractionResult.response.text();

        let leadData = {};
        try {
            leadData = JSON.parse(extractionText);
        } catch (e) {
            console.error("Failed to parse extraction JSON", e);
        }

        // 3. Save to Database
        // Update Session
        const updatedMessages = [...messages, { role: "assistant", content: responseText }];

        if (sessionId) {
            await supabase.from("chat_sessions").upsert({
                id: sessionId,
                user_id: userId,
                messages: updatedMessages,
                updated_at: new Date().toISOString()
            });
        }

        // Update Lead if data found
        if (leadData && Object.values(leadData).some(v => v)) {
            // Simple dedupe by email or create new
            // For now, just insert/update based on session? 
            // Let's just create a new lead entry or update if we can link it.
            // Since we don't have a lead_id in session yet, we'll just insert for now.
            // Improving: real app would link session to lead.
            await supabase.from("chat_leads").insert({
                ...leadData,
                status: 'new',
                inquiry_type: leadData.type || 'general'
            });
        }

        return new Response(JSON.stringify({ response: responseText, lead: leadData }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
        });
    }
});
