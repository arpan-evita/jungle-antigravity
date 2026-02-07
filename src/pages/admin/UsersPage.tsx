import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Users, Plus, Trash2, Shield, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/hooks/admin/useAdminAuth";
import type { AppRole } from "@/types/booking";

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser, isSuperAdmin } = useAdminAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [email, setEmail] = useState("");

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  const { data: userRoles, isLoading } = useQuery({
    queryKey: ["admin", "userRoles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as UserRole[];
    },
    enabled: isSuperAdmin,
  });

  const addStaffMutation = useMutation({
    mutationFn: async () => {
      // Get the current session to pass the access token
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("No active session");
      }

      const { data, error } = await supabase.functions.invoke("create-user", {
        body: {
          email,
          password,
          fullName,
          role: "staff",
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "userRoles"] });
      setDialogOpen(false);
      setEmail("");
      setPassword("");
      setFullName("");
      toast({
        title: "Staff account created",
        description: "The new staff member has been added successfully."
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create staff account"
      });
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "userRoles"] });
      toast({ title: "Role removed" });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message
      });
    },
  });

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Shield className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <h2 className="text-lg font-medium">Access Restricted</h2>
        <p className="text-sm text-muted-foreground">
          Only super admins can manage staff accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-medium">Staff Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage admin and staff access
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setEmail("");
            setPassword("");
            setFullName("");
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Staff
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Staff Member</DialogTitle>
              <DialogDescription>
                Create a new account for a staff member. They will be able to log in with these credentials.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addStaffMutation.mutate();
              }}
              className="space-y-4 py-4"
            >
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={addStaffMutation.isPending}>
                  {addStaffMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Staff
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-serif flex items-center gap-2">
            <Users className="h-5 w-5 text-[hsl(var(--gold))]" />
            User Roles
          </CardTitle>
          <CardDescription>
            All users with admin or staff access
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : userRoles?.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No staff members configured
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>User ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userRoles?.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-mono text-xs">
                      {role.user_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <Badge variant={role.role === "super_admin" ? "default" : "secondary"}>
                        {role.role === "super_admin" ? "Super Admin" : "Staff"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(role.created_at), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-center">
                      {role.user_id !== currentUser?.id && role.role !== "super_admin" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove Access</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will remove staff access for this user. They will no longer be able to access the admin dashboard.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => removeRoleMutation.mutate(role.id)}>
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm border-l-4 border-l-amber-500">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Security Note</p>
              <p className="text-sm text-muted-foreground mt-1">
                Super Admin roles can only be assigned directly in the database for security reasons.
                Staff members have limited access and cannot modify pricing or delete data.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
