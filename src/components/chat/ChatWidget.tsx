import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { BookingForm } from './BookingForm';

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const { messages, isLoading, sendMessage, setMessages } = useChat();
    const [inputValue, setInputValue] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!inputValue.trim()) return;
        sendMessage(inputValue);
        setInputValue('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleBookingSubmit = (data: any) => {
        // Add a local system message to confirm receipt
        setMessages(prev => [...prev, {
            role: 'assistant',
            content: `Thank you, ${data.name}! We have received your booking request for ${data.guests} guests from ${data.checkIn} to ${data.checkOut}. Our team will contact you at ${data.phone} shortly to confirm.`
        }]);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="mb-4 w-[350px] sm:w-[380px] h-[550px] bg-background border border-border/50 rounded-2xl shadow-luxury flex flex-col overflow-hidden pointer-events-auto"
                    >
                        {/* Header */}
                        <div className="p-4 bg-forest text-ivory flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-gold" />
                                </div>
                                <div>
                                    <h3 className="font-serif font-medium text-sm">Jungle Assistant</h3>
                                    <p className="text-[10px] text-ivory/70 uppercase tracking-wider">Always here to help</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-ivory hover:bg-white/10 hover:text-white"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="flex-1 p-4 bg-cream/30">
                            <div className="space-y-4">
                                {messages.map((msg, idx) => {
                                    // Check if this is a booking form trigger
                                    const isBookingTrigger = msg.role === 'assistant' && msg.content.includes("[SHOW_BOOKING_FORM]");

                                    if (isBookingTrigger) {
                                        return (
                                            <div key={idx} className="flex w-full mb-2 justify-start">
                                                <div className="w-full max-w-[90%]">
                                                    <div className="bg-white border border-border/50 shadow-sm rounded-2xl rounded-tl-none p-1 text-foreground">
                                                        <BookingForm onSubmit={handleBookingSubmit} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "flex w-full mb-2",
                                                msg.role === 'user' ? "justify-end" : "justify-start"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                                                    msg.role === 'user'
                                                        ? "bg-forest text-ivory rounded-tr-none"
                                                        : "bg-white border border-border/50 shadow-sm rounded-tl-none text-foreground prose-chat"
                                                )}
                                            >
                                                {msg.role === 'assistant' ? (
                                                    <ReactMarkdown
                                                        components={{
                                                            a: ({ node, ...props }) => (
                                                                <a {...props} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold-light underline underline-offset-4 decoration-gold/30 hover:decoration-gold transition-all" />
                                                            )
                                                        }}
                                                    >
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                ) : (
                                                    msg.content
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {isLoading && (
                                    <div className="flex justify-start mb-2">
                                        <div className="bg-white border border-border/50 shadow-sm rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-forest/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-1.5 h-1.5 bg-forest/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-1.5 h-1.5 bg-forest/40 rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        </ScrollArea>

                        {/* Input */}
                        <div className="p-3 bg-background border-t border-border/50 shrink-0">
                            <div className="relative flex items-center">
                                <Input
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Ask about bookings or safaris..."
                                    className="pr-12 bg-muted/30 border-border/50 focus-visible:ring-forest/20 rounded-xl"
                                />
                                <Button
                                    size="icon"
                                    className="absolute right-1 w-8 h-8 rounded-lg bg-forest hover:bg-forest-light text-ivory"
                                    onClick={handleSend}
                                    disabled={isLoading || !inputValue.trim()}
                                >
                                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                </Button>
                            </div>
                            <div className="flex gap-2 mt-2 overflow-x-auto pb-1 px-1 scrollbar-none">
                                {/* Quick Actions */}
                                <button onClick={() => sendMessage("I want to book a stay")} className="whitespace-nowrap text-[10px] px-2.5 py-1 bg-forest/5 hover:bg-forest/10 text-forest rounded-full border border-forest/10 transition-colors">
                                    Book a Stay
                                </button>
                                <button onClick={() => sendMessage("Tell me about safaris")} className="whitespace-nowrap text-[10px] px-2.5 py-1 bg-forest/5 hover:bg-forest/10 text-forest rounded-full border border-forest/10 transition-colors">
                                    Safari Info
                                </button>
                                <button onClick={() => sendMessage("Wedding packages")} className="whitespace-nowrap text-[10px] px-2.5 py-1 bg-forest/5 hover:bg-forest/10 text-forest rounded-full border border-forest/10 transition-colors">
                                    Weddings
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 rounded-full bg-forest text-ivory shadow-luxury flex items-center justify-center pointer-events-auto border-2 border-gold/50 relative overflow-hidden group"
            >
                <span className="absolute inset-0 bg-gold/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-full"></span>
                {isOpen ? <X className="w-6 h-6 relative z-10" /> : <MessageCircle className="w-6 h-6 relative z-10" />}

                {/* Notification Dot */}
                {!isOpen && messages.length > 1 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 border-2 border-background rounded-full"></span>
                )}
            </motion.button>
        </div>
    );
}
