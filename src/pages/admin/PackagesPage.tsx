import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, ToggleLeft, ToggleRight, IndianRupee, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface PackageData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  inclusions: string[] | null;
  price_modifier: number;
  is_percentage: boolean;
  is_active: boolean;
  display_order: number;
}

interface PackageFormData {
  name: string;
  slug: string;
  description: string;
  inclusions: string;
  price_modifier: number;
  is_percentage: boolean;
  is_active: boolean;
}

const defaultFormData: PackageFormData = {
  name: "",
  slug: "",
  description: "",
  inclusions: "",
  price_modifier: 0,
  is_percentage: false,
  is_active: true,
};

export default function PackagesPage() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<PackageData | null>(null);
  const [formData, setFormData] = useState<PackageFormData>(defaultFormData);

  const { data: packages, isLoading } = useQuery({
    queryKey: ["admin", "packages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("packages")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data as PackageData[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: { name: string; slug: string; description: string; inclusions: string[]; price_modifier: number; is_percentage: boolean; is_active: boolean; id?: string }) => {
      const payload = {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        inclusions: data.inclusions,
        price_modifier: data.price_modifier,
        is_percentage: data.is_percentage,
        is_active: data.is_active,
      };

      if (data.id) {
        const { error } = await supabase.from("packages").update(payload).eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("packages").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "packages"] });
      setDialogOpen(false);
      setEditingPackage(null);
      setFormData(defaultFormData);
      toast({ title: "Package saved successfully" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("packages").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "packages"] });
      toast({ title: "Status updated" });
    },
  });

  const handleEdit = (pkg: PackageData) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name,
      slug: pkg.slug,
      description: pkg.description || "",
      inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions.join("\n") : "",
      price_modifier: pkg.price_modifier,
      is_percentage: pkg.is_percentage,
      is_active: pkg.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inclusionsArray = formData.inclusions
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    saveMutation.mutate({ ...formData, inclusions: inclusionsArray, id: editingPackage?.id });
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-medium">Packages</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage resort packages and experiences</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEditingPackage(null);
            setFormData(defaultFormData);
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Package
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPackage ? "Edit Package" : "Add New Package"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Package Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        slug: editingPackage ? formData.slug : generateSlug(e.target.value)
                      });
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Package description..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="inclusions">Inclusions (one per line)</Label>
                <Textarea
                  id="inclusions"
                  value={formData.inclusions}
                  onChange={(e) => setFormData({ ...formData, inclusions: e.target.value })}
                  rows={4}
                  placeholder="Welcome drink&#10;Breakfast included&#10;Guided nature walk..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price_modifier">Price Modifier</Label>
                  <Input
                    id="price_modifier"
                    type="number"
                    value={formData.price_modifier}
                    onChange={(e) => setFormData({ ...formData, price_modifier: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch
                    checked={formData.is_percentage}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_percentage: checked })}
                  />
                  <Label>Is Percentage</Label>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Saving..." : "Save Package"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Package Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-center">Price Modifier</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}><Skeleton className="h-4 w-full" /></TableCell>
                  ))}
                </TableRow>
              ))
            ) : packages?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  No packages found. Add your first package.
                </TableCell>
              </TableRow>
            ) : (
              packages?.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{pkg.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{pkg.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground line-clamp-2 max-w-xs">
                      {pkg.description || "—"}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      {pkg.is_percentage ? (
                        <>
                          <span>{pkg.price_modifier}</span>
                          <Percent className="h-3.5 w-3.5" />
                        </>
                      ) : (
                        <>
                          <IndianRupee className="h-3.5 w-3.5" />
                          <span>{Number(pkg.price_modifier).toLocaleString("en-IN")}</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={pkg.is_active ? "default" : "secondary"}>
                      {pkg.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(pkg)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleStatusMutation.mutate({ id: pkg.id, is_active: !pkg.is_active })}
                      >
                        {pkg.is_active ? (
                          <ToggleRight className="h-4 w-4 text-primary" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
