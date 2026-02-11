
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailPayload {
    type: 'enquiry' | 'booking'
    data: any
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const payload: EmailPayload = await req.json()
        const { type, data } = payload

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Fetch destination email from resort_settings
        const { data: settings } = await supabaseClient
            .from('resort_settings')
            .select('email')
            .single()

        const toEmail = settings?.email || 'reservation@jungleheritage.com'

        let subject = ''
        let html = ''

        if (type === 'enquiry') {
            const isJobApp = data.category === 'job_application'
            subject = isJobApp ? `New Job Application: ${data.name}` : `New Enquiry: ${data.subject}`
            html = `
        <h1>New ${isJobApp ? 'Job Application' : 'Enquiry'}</h1>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || 'N/A'}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
        <p><strong>Message:</strong></p>
        <div style="white-space: pre-wrap; background: #f4f4f4; padding: 15px; border-radius: 5px;">
          ${data.message}
        </div>
      `
        } else if (type === 'booking') {
            subject = `New Booking: ${data.booking_reference}`
            html = `
        <h1>New Booking Confirmed</h1>
        <p><strong>Reference:</strong> ${data.booking_reference}</p>
        <p><strong>Guest Name:</strong> ${data.guest_name}</p>
        <p><strong>Check-in:</strong> ${data.check_in_date}</p>
        <p><strong>Check-out:</strong> ${data.check_out_date}</p>
        <p><strong>Guests:</strong> ${data.num_adults} Adults, ${data.num_children} Children</p>
        <p><strong>Total Amount:</strong> ₹${data.grand_total}</p>
        <p><strong>Status:</strong> ${data.status}</p>
      `
        }

        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: 'Jungle Heritage Resort <onboarding@resend.dev>', // Change to verified domain later
                to: [toEmail],
                subject: subject,
                html: html,
            }),
        })

        const resData = await res.json()

        return new Response(JSON.stringify(resData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
