
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import crypto from "node:crypto";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { orderCreationId, razorpayPaymentId, razorpayOrderId, razorpaySignature, bookingId } = await req.json()

        console.log('Verifying payment for booking:', bookingId);

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
        const keySecret = config.key_secret

        if (!keySecret) {
            throw new Error("Razorpay secret key is not configured in settings.")
        }

        // Verify signature
        const shasum = crypto.createHmac('sha256', keySecret);
        shasum.update(`${orderCreationId}|${razorpayPaymentId}`);
        const digest = shasum.digest('hex');

        if (digest !== razorpaySignature) {
            throw new Error("Transaction not legit!");
        }

        // Update booking status in Supabase
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { error } = await supabaseClient
            .from('bookings')
            .update({
                payment_status: 'paid',
                payment_id: razorpayPaymentId,
                payment_provider: 'razorpay',
                // Update booking status to confirmed if strictly paid
                status: 'confirmed'
            })
            .eq('id', bookingId)

        if (error) throw error;

        return new Response(
            JSON.stringify({ message: "Payment verified successfully", success: true }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )

    } catch (error) {
        console.error('Payment verification failed:', error);
        return new Response(
            JSON.stringify({ error: error.message, success: false }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            }
        )
    }
})
