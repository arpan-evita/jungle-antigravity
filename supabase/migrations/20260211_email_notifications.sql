
-- Ensure resort settings has the correct email
UPDATE public.resort_settings 
SET email = 'reservation@jungleheritage.com'
WHERE id IN (SELECT id FROM public.resort_settings LIMIT 1);

-- Function to trigger email notification
CREATE OR REPLACE FUNCTION public.trigger_email_notification()
RETURNS TRIGGER AS $$
DECLARE
  payload jsonb;
  target_type text;
BEGIN
  IF (TG_TABLE_NAME = 'enquiries') THEN
    target_type := 'enquiry';
    payload := jsonb_build_object(
      'type', target_type,
      'data', to_jsonb(NEW)
    );
  ELSIF (TG_TABLE_NAME = 'bookings') THEN
    -- Only notify for new bookings that are not just enquiries (enquiries go through the enquiries table usually, 
    -- but confirmed bookings go straight to bookings table)
    -- Actually, let's notify for all new bookings.
    target_type := 'booking';
    payload := jsonb_build_object(
      'type', target_type,
      'data', to_jsonb(NEW)
    );
  END IF;

  -- Call the Edge Function
  -- Note: You need to set up the vault or hardcode the URL if not using standard Supabase hooks
  -- However, Supabase Webhooks are better for this. 
  -- We'll create the function but it's recommended to use the Supabase Dashboard Webhooks UI for Edge Functions.
  -- But since we want it automated, we'll use pg_net if available or just define the trigger for documentation.
  
  -- For this project, we'll suggest the user to enable Webhooks in the dashboard linked to this function.
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
