import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { toast } from "sonner";

export interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function useChat() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Welcome to Jungle Heritage Resort 🌿. How may I assist you today?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState<string | null>(null);

    useEffect(() => {
        let storedSessionId = localStorage.getItem('chat_session_id');
        if (!storedSessionId) {
            storedSessionId = uuidv4();
            localStorage.setItem('chat_session_id', storedSessionId);
        }
        setSessionId(storedSessionId);
    }, []);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim()) return;

        const newMessage: Message = { role: 'user', content };
        setMessages(prev => [...prev, newMessage]);
        setIsLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke('chat-assistant', {
                body: {
                    messages: [...messages, newMessage],
                    sessionId: sessionId,
                    userId: (await supabase.auth.getUser()).data.user?.id
                }
            });

            if (error) {
                console.error('Supabase Invoke Error:', error);
                throw error;
            }

            // Check for functional error returned in 200 OK response
            if (data?.error) {
                console.error('Edge Function Error:', data.error);
                toast.error(`Chat Error: ${data.error}`);
                // Optionally remove the user's message or show error state
                return;
            }

            if (data?.response) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
            }
        } catch (error) {
            console.error('Chat execution error:', error);
            toast.error("Failed to connect to assistant. Please check internet or try again.");
        } finally {
            setIsLoading(false);
        }
    }, [messages, sessionId]);

    return {
        messages,
        isLoading,
        sendMessage,
        setMessages
    };
}
