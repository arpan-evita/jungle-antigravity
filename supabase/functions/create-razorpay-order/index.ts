
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Razorpay from "https://esm.sh/razorpay@2.9.2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { amount, currency = 'INR', receipt } = await req.json()

        // Initialize Supabase Client with service role to bypass RLS for getting config
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Fetch Razorpay credentials from database
        const { data: razorpayData, error: razorpayError } = await supabaseClient
            .from('payment_settings')
            .select('config')
            .eq('provider', 'razorpay')
            .single()

        if (razorpayError || !razorpayData) {
            throw new Error(`Razorpay configuration not found: ${razorpayError?.message}`)
        }

        const config = razorpayData.config as any
        const keyId = config.key_id
        const keySecret = config.key_secret

        if (!keyId || !keySecret) {
            throw new Error("Razorpay API keys are not configured in settings.")
        }

        // Initialize Razorpay
        const instance = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });

        const options = {
            amount: Math.round(amount * 100), // amount in the smallest currency unit (paise)
            currency,
            receipt,
            payment_capture: 1
        };

        console.log('Creating Razorpay order:', options);
        const order = await instance.orders.create(options);
        console.log('Order created:', order);

        return new Response(
            JSON.stringify(order),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        console.error('Error creating order:', error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
