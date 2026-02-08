import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        console.log("=== CREATE USER FUNCTION STARTED ===");

        // Get the authorization header
        const authHeader = req.headers.get("Authorization");
        console.log("Auth header present:", !!authHeader);

        if (!authHeader) {
            console.error("ERROR: No authorization header");
            return new Response(JSON.stringify({ error: "No authorization header" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Create Supabase client with the user's token to verify they're an admin
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

        console.log("Supabase URL:", supabaseUrl);
        console.log("Service key present:", !!supabaseServiceKey);

        const userClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: authHeader } },
        });

        // Verify the user is authenticated and is an admin
        console.log("Getting user...");
        const { data: { user }, error: userError } = await userClient.auth.getUser();

        if (userError) {
            console.error("ERROR getting user:", userError.message);
            return new Response(JSON.stringify({ error: "Unauthorized: " + userError.message }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (!user) {
            console.error("ERROR: No user found");
            return new Response(JSON.stringify({ error: "Unauthorized: No user" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        console.log("User ID:", user.id);

        // Check if user is an admin using the is_admin function
        console.log("Checking admin status...");
        const { data: isAdmin, error: roleError } = await userClient.rpc("is_admin", {
            _user_id: user.id,
        });

        console.log("is_admin result:", isAdmin);
        console.log("is_admin error:", roleError);

        if (roleError) {
            console.error("ERROR checking admin:", roleError.message);
            return new Response(JSON.stringify({ error: "Error checking permissions: " + roleError.message }), {
                status: 403,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        if (!isAdmin) {
            console.error("ERROR: User is not admin");
            return new Response(JSON.stringify({ error: "Forbidden - Admin access required" }), {
                status: 403,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        console.log("Admin check passed, parsing request body...");

        // Parse request body
        const { email, fullName, role } = await req.json();

        console.log("Request data:", { email, fullName, role: role || "staff" });

        if (!email || !fullName) {
            console.error("ERROR: Missing required fields");
            return new Response(JSON.stringify({ error: "Email and name are required" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // Use service role client to invite the user
        const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { persistSession: false },
        });

        console.log("Inviting user with admin client...");

        // Invite the user
        const { data: newUser, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
            email,
            {
                data: { full_name: fullName },
                // You can optionally specify a redirect URL here
                // redirectTo: `${req.headers.get("origin")}/admin/auth/callback`,
            }
        );

        if (inviteError) {
            console.error("ERROR inviting user:", inviteError.message);
            return new Response(JSON.stringify({ error: inviteError.message }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        console.log("User created successfully, ID:", newUser.user?.id);

        // Assign the role
        if (newUser.user) {
            console.log("Assigning role...");
            const { error: roleAssignmentError } = await adminClient
                .from("user_roles")
                .insert({
                    user_id: newUser.user.id,
                    role: role || "staff",
                });

            if (roleAssignmentError) {
                console.error("ERROR assigning role:", roleAssignmentError.message);
                return new Response(JSON.stringify({
                    user: newUser.user,
                    warning: "User created but role assignment failed: " + roleAssignmentError.message
                }), {
                    status: 200,
                    headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
            }

            console.log("Role assigned successfully");
        }

        console.log("=== CREATE USER (INVITATION) FUNCTION COMPLETED SUCCESSFULLY ===");

        return new Response(
            JSON.stringify({
                user: newUser.user,
                message: "Invitation sent successfully",
            }),
            {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
        );
    } catch (error) {
        console.error("UNEXPECTED ERROR:", error);
        return new Response(JSON.stringify({ error: "Internal server error: " + error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
