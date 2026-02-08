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
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const authHeader = req.headers.get("Authorization")!;

        const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
            global: { headers: { Authorization: authHeader } },
        });

        // Verify the user is an admin
        const { data: { user }, error: userError } = await userClient.auth.getUser();
        if (userError || !user) throw new Error("Unauthorized");

        const { data: isAdmin } = await userClient.rpc("is_admin", { _user_id: user.id });
        if (!isAdmin) throw new Error("Forbidden - Admin access required");

        // Parse request
        const { email, password, fullName, role = "staff" } = await req.json();

        const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { persistSession: false },
        });

        // Create user
        const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
            email,
            password,
            user_metadata: { full_name: fullName },
            email_confirm: true,
        });

        if (createError) throw createError;

        // Assign Role
        const { error: roleError } = await adminClient
            .from("user_roles")
            .insert({
                user_id: newUser.user.id,
                role: role,
            });

        if (roleError) {
            return new Response(JSON.stringify({
                user: newUser.user,
                warning: "User created but role assignment failed: " + roleError.message
            }), {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        return new Response(JSON.stringify({ user: newUser.user, message: "Staff created successfully" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
