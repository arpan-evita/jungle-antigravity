-- Function to handle booking status changes
CREATE OR REPLACE FUNCTION public.handle_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If status changes to 'cancelled' or 'no_show', remove blocked dates
    IF (NEW.status IN ('cancelled', 'no_show')) THEN
        DELETE FROM public.blocked_dates
        WHERE booking_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for status changes
DROP TRIGGER IF EXISTS on_booking_status_change ON public.bookings;
CREATE TRIGGER on_booking_status_change
    AFTER UPDATE OF status ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_booking_status_change();

-- Cleanup existing cancelled bookings that might still have blocked dates
DELETE FROM public.blocked_dates
WHERE booking_id IN (
    SELECT id FROM public.bookings 
    WHERE status IN ('cancelled', 'no_show')
);
