import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; // Added Button import
import { format } from "date-fns";
import { Loader2, Mail, Phone, Calendar, MessageSquare } from "lucide-react";
import { toast } from "sonner"; // Added toast import

interface ChatLead {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    travel_dates: string | null;
    guests: string | null;
    status: string;
    inquiry_type: string;
    created_at: string;
}

export default function ChatLeads() {
    const [leads, setLeads] = useState<ChatLead[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const { data, error } = await supabase
                .from('chat_leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLeads(data || []);
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => { // Added Status Update Function
        try {
            const { error } = await supabase
                .from('chat_leads')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            setLeads(leads.map(lead =>
                lead.id === id ? { ...lead, status: newStatus } : lead
            ));
            toast.success("Lead status updated");
        } catch (error) {
            console.error("Error updating status:", error);
            toast.error("Failed to update status");
        }
    };


    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-forest" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-serif font-medium text-forest-deep">Chat Leads</h1>
                <div className="flex gap-2">
                    <Badge variant="outline" className="bg-forest/5 text-forest border-forest/20">
                        Total: {leads.length}
                    </Badge>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Inquiries from AI Assistant</CardTitle>
                </CardHeader>
                <CardContent>
                    {leads.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground">
                            No leads captured yet.
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead>Details</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leads.map((lead) => (
                                    <TableRow key={lead.id}>
                                        <TableCell className="whitespace-nowrap">
                                            {format(new Date(lead.created_at), 'MMM d, yyyy')}
                                            <div className="text-xs text-muted-foreground">
                                                {format(new Date(lead.created_at), 'h:mm a')}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {lead.name || 'Anonymous'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 text-sm">
                                                {lead.email && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Mail className="w-3 h-3 text-muted-foreground" />
                                                        {lead.email}
                                                    </div>
                                                )}
                                                {lead.phone && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Phone className="w-3 h-3 text-muted-foreground" />
                                                        {lead.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1 text-xs">
                                                {lead.travel_dates && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3 h-3 text-muted-foreground" />
                                                        <span className="font-medium">Dates:</span> {lead.travel_dates}
                                                    </div>
                                                )}
                                                {lead.guests && (
                                                    <span className="text-muted-foreground">Guests: {lead.guests}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="capitalize">
                                                {lead.inquiry_type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={lead.status === 'new' ? 'default' : 'outline'}
                                                className={
                                                    lead.status === 'new' ? 'bg-gold hover:bg-gold/90' :
                                                        lead.status === 'contacted' ? 'bg-forest/10 text-forest border-forest/20' : ''
                                                }
                                            >
                                                {lead.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {lead.status === 'new' && (
                                                <Button size="sm" variant="ghost" onClick={() => updateStatus(lead.id, 'contacted')}>
                                                    Mark Contacted
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
