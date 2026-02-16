import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Calendar, User, Phone, Mail } from "lucide-react";

interface BookingFormProps {
    onSubmit: (data: any) => void;
    isLoading?: boolean;
}

export function BookingForm({ onSubmit, isLoading: externalLoading }: BookingFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        checkIn: '',
        checkOut: '',
        guests: '2'
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.phone || !formData.checkIn || !formData.checkOut) {
            toast.error("Please fill in all required fields");
            return;
        }

        setLoading(true);
        try {
            // 1. Save to Supabase
            const { error } = await supabase.from('chat_leads').insert({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                dates: `${formData.checkIn} to ${formData.checkOut}`,
                guests: formData.guests,
                inquiry_type: 'booking',
                status: 'new'
            });

            if (error) throw error;

            toast.success("Booking request sent successfully!");
            onSubmit(formData);

        } catch (error: any) {
            console.error("Booking Error:", error);
            toast.error(error.message || "Failed to submit booking request");
        } finally {
            setLoading(false);
        }
    };

    const isSubmitting = loading || externalLoading;

    return (
        <form onSubmit={handleSubmit} className="space-y-3 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-gold/20 shadow-sm animate-fade-in">
            <h4 className="text-sm font-semibold text-primary mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gold" />
                Quick Booking Request
            </h4>

            <div className="space-y-2">
                <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white/80 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-white/80 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Phone className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full pl-9 pr-3 py-2 text-sm bg-white/80 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="text-xs text-muted-foreground ml-1">Check-in</label>
                        <input
                            type="date"
                            name="checkIn"
                            value={formData.checkIn}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-sm bg-white/80 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                            required
                        />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground ml-1">Check-out</label>
                        <input
                            type="date"
                            name="checkOut"
                            value={formData.checkOut}
                            onChange={handleChange}
                            className="w-full px-3 py-2 text-sm bg-white/80 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs text-muted-foreground ml-1">Guests</label>
                    <select
                        name="guests"
                        value={formData.guests}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm bg-white/80 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-gold"
                    >
                        <option value="1">1 Guest</option>
                        <option value="2">2 Guests</option>
                        <option value="3">3 Guests</option>
                        <option value="4">4 Guests</option>
                        <option value="5+">5+ Guests</option>
                    </select>
                </div>
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 bg-primary text-primary-foreground py-2 text-sm font-medium rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Request Availability"}
            </button>
            <p className="text-[10px] text-center text-muted-foreground mt-1">
                We'll contact you shortly to confirm dates.
            </p>
        </form>
    );
}
