import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Building2, Percent, Info, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ResortSettings {
  id: string;
  resort_name: string;
  location: string;
  phone: string;
  email: string;
  address?: string;
}

export default function SettingsPage() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [resortName, setResortName] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: resortSettings, isLoading: resortLoading } = useQuery({
    queryKey: ["admin", "resortSettings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("resort_settings")
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return data as ResortSettings;
    },
  });

  const { data: taxes, isLoading: taxesLoading } = useQuery({
    queryKey: ["admin", "taxes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tax_config").select("*");
      if (error) throw error;
      return data;
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("resort_settings")
        .update({
          resort_name: resortName,
          location,
          phone,
          email,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("id", resortSettings?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "resortSettings"] });
      setEditDialogOpen(false);
      toast({
        title: "Settings updated",
        description: "Resort information has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update settings",
      });
    },
  });

  const handleEditClick = () => {
    if (resortSettings) {
      setResortName(resortSettings.resort_name);
      setLocation(resortSettings.location);
      setPhone(resortSettings.phone);
      setEmail(resortSettings.email);
      setEditDialogOpen(true);
    }
  };

  const activeTax = taxes?.find((t) => t.is_active);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-medium">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          System configuration and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Resort Info */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-[hsl(var(--gold))]" />
                  Resort Information
                </CardTitle>
                <CardDescription>Basic resort details</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditClick}
                disabled={resortLoading}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {resortLoading ? (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : resortSettings ? (
              <>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Resort Name</p>
                  <p className="font-medium">{resortSettings.resort_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Location</p>
                  <p className="font-medium">{resortSettings.location}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Contact</p>
                  <p className="font-medium">{resortSettings.phone}</p>
                  <p className="text-sm text-muted-foreground">{resortSettings.email}</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No resort information available</p>
            )}
          </CardContent>
        </Card>

        {/* Tax Settings */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-serif flex items-center gap-2">
              <Percent className="h-5 w-5 text-[hsl(var(--gold))]" />
              Tax Configuration
            </CardTitle>
            <CardDescription>Active tax rates applied to bookings</CardDescription>
          </CardHeader>
          <CardContent>
            {taxesLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : activeTax ? (
              <div className="p-4 rounded-lg bg-muted/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{activeTax.name}</p>
                    <p className="text-2xl font-bold text-[hsl(var(--gold))]">
                      {activeTax.percentage}%
                    </p>
                  </div>
                  <Badge>Active</Badge>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No active tax configured</p>
            )}
            <p className="text-xs text-muted-foreground mt-3">
              Configure taxes in the Pricing section
            </p>
          </CardContent>
        </Card>

        {/* Future Features */}
        <Card className="border-0 shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-serif flex items-center gap-2">
              <Info className="h-5 w-5 text-[hsl(var(--gold))]" />
              Coming Soon
            </CardTitle>
            <CardDescription>Features planned for future updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "Email Notifications", desc: "Automated booking emails" },
                { title: "WhatsApp Integration", desc: "Send updates via WhatsApp" },
                { title: "Payment Tracking", desc: "Track payments and deposits" },
                { title: "Invoice Generation", desc: "Auto-generate GST invoices" },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="p-4 rounded-lg border border-dashed border-border"
                >
                  <p className="font-medium text-sm">{feature.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Resort Settings Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Resort Information</DialogTitle>
            <DialogDescription>
              Update the basic information about your resort.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="resort-name">Resort Name</Label>
              <Input
                id="resort-name"
                value={resortName}
                onChange={(e) => setResortName(e.target.value)}
                placeholder="Enter resort name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => updateSettingsMutation.mutate()}
              disabled={updateSettingsMutation.isPending}
            >
              {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
