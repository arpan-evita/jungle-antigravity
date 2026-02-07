import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Building2, Percent, Info, Pencil, CreditCard, Wallet, Landmark } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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

interface PaymentSettings {
  id: string;
  provider: string;
  is_enabled: boolean;
  config: Record<string, string>;
}

export default function SettingsPage() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [resortName, setResortName] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<PaymentSettings | null>(null);
  const [tempConfig, setTempConfig] = useState<Record<string, string>>({});

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

  const { data: paymentSettings, isLoading: paymentsLoading, error: paymentsError } = useQuery({
    queryKey: ["admin", "paymentSettings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("payment_settings").select("*");
      if (error) {
        console.error("Error fetching payment settings:", error);
        throw error;
      }
      return data as PaymentSettings[];
    },
  });

  const initializePaymentsMutation = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      const providers = [
        { provider: "razorpay", config: { key_id: "", key_secret: "" } },
        { provider: "stripe", config: { publishable_key: "", secret_key: "" } },
        { provider: "paypal", config: { client_id: "", client_secret: "" } },
        { provider: "phonepe", config: { merchant_id: "", salt_key: "", salt_index: "" } },
      ];

      for (const p of providers) {
        await supabase.from("payment_settings").upsert({
          ...p,
          updated_by: userId
        }, { onConflict: 'provider' });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "paymentSettings"] });
      toast({
        title: "Payment settings initialized",
        description: "Default providers have been added.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Initialization Error",
        description: error.message || "Failed to initialize payment settings",
      });
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

  const updatePaymentMutation = useMutation({
    mutationFn: async ({ id, is_enabled, config }: Partial<PaymentSettings> & { id: string }) => {
      const updateData: any = {};
      if (is_enabled !== undefined) updateData.is_enabled = is_enabled;
      if (config !== undefined) updateData.config = config;
      updateData.updated_by = (await supabase.auth.getUser()).data.user?.id;

      const { error } = await supabase
        .from("payment_settings")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "paymentSettings"] });
      setPaymentDialogOpen(false);
      toast({
        title: "Payment settings updated",
        description: "Configuration has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update payment settings",
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

  const handleConfigurePayment = (provider: PaymentSettings) => {
    setSelectedProvider(provider);
    setTempConfig(provider.config || {});
    setPaymentDialogOpen(true);
  };

  const activeTax = taxes?.find((t) => t.is_active);

  const getProviderLabel = (provider: string) => {
    switch (provider) {
      case "razorpay": return "Razorpay";
      case "stripe": return "Stripe";
      case "paypal": return "PayPal";
      case "phonepe": return "PhonePe";
      default: return provider;
    }
  };

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

        {/* Payment Integration */}
        <Card className="border-0 shadow-sm md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[hsl(var(--gold))]" />
                  Payment Integration
                </CardTitle>
                <CardDescription>Connect and configure your payment partners</CardDescription>
              </div>
              {!paymentsLoading && (!paymentSettings || paymentSettings.length === 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => initializePaymentsMutation.mutate()}
                  disabled={initializePaymentsMutation.isPending}
                >
                  {initializePaymentsMutation.isPending ? "Initializing..." : "Initialize Providers"}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {paymentsError ? (
              <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
                <Info className="h-4 w-4" />
                <p>Error loading payment settings: {paymentsError instanceof Error ? paymentsError.message : "Access denied (Check RLS policies)"}</p>
              </div>
            ) : paymentsLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
              </div>
            ) : !paymentSettings || paymentSettings.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-lg">
                <p className="text-sm text-muted-foreground">No payment providers configured yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Click the button above to initialize default providers.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {paymentSettings.map((payment) => (
                  <div
                    key={payment.provider}
                    className="p-4 rounded-lg border border-border bg-card/50 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {payment.provider === "razorpay" && <Wallet className="h-5 w-5 text-blue-500" />}
                        {payment.provider === "stripe" && <CreditCard className="h-5 w-5 text-indigo-500" />}
                        {payment.provider === "paypal" && <Info className="h-5 w-5 text-blue-600" />}
                        {payment.provider === "phonepe" && <Landmark className="h-5 w-5 text-purple-600" />}
                        <span className="font-medium">{getProviderLabel(payment.provider)}</span>
                      </div>
                      <Switch
                        checked={payment.is_enabled}
                        onCheckedChange={(checked) =>
                          updatePaymentMutation.mutate({ id: payment.id, is_enabled: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <Badge variant={payment.is_enabled ? "secondary" : "outline"} className={payment.is_enabled ? "bg-green-100 text-green-700 hover:bg-green-100 border-0" : ""}>
                        {payment.is_enabled ? "Connected" : "Disconnected"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleConfigurePayment(payment)}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

      {/* Configure Payment Provider Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure {getProviderLabel(selectedProvider?.provider || "")}</DialogTitle>
            <DialogDescription>
              Enter your API credentials for {getProviderLabel(selectedProvider?.provider || "")}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {Object.keys(tempConfig).map((key) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="capitalize">
                  {key.replace(/_/g, " ")}
                </Label>
                <Input
                  id={key}
                  type="password"
                  value={tempConfig[key]}
                  onChange={(e) => setTempConfig({ ...tempConfig, [key]: e.target.value })}
                  placeholder={`Enter ${key.replace(/_/g, " ")}`}
                />
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                updatePaymentMutation.mutate({
                  id: selectedProvider!.id,
                  config: tempConfig
                })
              }
              disabled={updatePaymentMutation.isPending}
            >
              {updatePaymentMutation.isPending ? "Saving..." : "Save Configuration"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
