import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { BookingFormData, PriceBreakdown, Booking, MealPlan, BookingStatus } from "@/types/booking";
import { toast } from "@/hooks/use-toast";

interface CreateBookingParams {
  formData: BookingFormData;
  priceBreakdown: PriceBreakdown;
}

// Generate a temporary reference that will be replaced by the trigger
function generateTempReference(): string {
  return 'TEMP' + Date.now().toString(36).toUpperCase();
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formData, priceBreakdown }: CreateBookingParams): Promise<Booking> => {
      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser();

      const status: BookingStatus = formData.isEnquiryOnly ? 'new_enquiry' : 'quote_sent';

      // The trigger will replace this with a proper reference
      const tempReference = generateTempReference();

      // First, find an available room if this is a confirmed booking
      let assignedRoomId: string | null = null;

      if (!formData.isEnquiryOnly && formData.roomCategoryId) {
        // Get available rooms for the selected dates
        const { data: availableRooms, error: availError } = await supabase.rpc('get_available_rooms', {
          _room_category_id: formData.roomCategoryId,
          _check_in: formData.checkInDate!.toISOString().split('T')[0],
          _check_out: formData.checkOutDate!.toISOString().split('T')[0],
        });

        if (availError) {
          console.error('Error checking availability:', availError);
          throw new Error('Could not check room availability. Please try again.');
        }

        if (!availableRooms || availableRooms.length === 0) {
          throw new Error('No rooms available for the selected dates. Please choose different dates.');
        }

        // Assign the first available room
        assignedRoomId = availableRooms[0].room_id;
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          booking_reference: tempReference, // Will be overwritten by trigger
          user_id: user?.id || null,
          guest_name: formData.guestName.trim(),
          guest_email: formData.guestEmail.trim().toLowerCase(),
          guest_phone: formData.guestPhone.trim(),
          guest_country: formData.guestCity.trim() || null,
          special_requests: formData.specialRequests.trim() || null,
          room_category_id: formData.roomCategoryId,
          room_id: assignedRoomId,
          package_id: formData.packageId || null,
          check_in_date: formData.checkInDate!.toISOString().split('T')[0],
          check_out_date: formData.checkOutDate!.toISOString().split('T')[0],
          num_adults: formData.numAdults,
          num_children: formData.numChildren,
          base_price: priceBreakdown.roomTotal,
          extras: priceBreakdown.mealPlanTotal + priceBreakdown.packageTotal,
          taxes: priceBreakdown.taxes,
          discount: 0,
          grand_total: priceBreakdown.grandTotal,
          status: status,
          is_enquiry_only: formData.isEnquiryOnly,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from booking insert');

      // If booking is confirmed (not just enquiry) and we have a room, block the dates
      if (!formData.isEnquiryOnly && assignedRoomId) {
        // Use the database function to block dates
        const { error: blockError } = await supabase.rpc('block_dates_for_booking', {
          _room_id: assignedRoomId,
          _booking_id: data.id,
          _check_in: formData.checkInDate!.toISOString().split('T')[0],
          _check_out: formData.checkOutDate!.toISOString().split('T')[0],
        });

        if (blockError) {
          console.error('Error blocking dates:', blockError);
          // Don't throw - booking was created, just log the error
        }
      }

      // Map the response to our Booking type
      const booking: Booking = {
        id: data.id,
        booking_reference: data.booking_reference,
        user_id: data.user_id,
        guest_name: data.guest_name,
        guest_email: data.guest_email,
        guest_phone: data.guest_phone,
        guest_country: data.guest_country,
        special_requests: data.special_requests,
        room_category_id: data.room_category_id,
        package_id: data.package_id,
        check_in_date: data.check_in_date,
        check_out_date: data.check_out_date,
        num_adults: data.num_adults,
        num_children: data.num_children,
        num_rooms: data.num_rooms,
        base_price: Number(data.base_price) || 0,
        taxes: Number(data.taxes) || 0,
        extras: Number(data.extras) || 0,
        discount: Number(data.discount) || 0,
        grand_total: Number(data.grand_total) || 0,
        status: data.status as BookingStatus,
        is_enquiry_only: data.is_enquiry_only,
        internal_notes: data.internal_notes,
        assigned_room_numbers: data.assigned_room_numbers,
        source: data.source,
        payment_status: data.payment_status,
        payment_method: data.payment_method,
        payment_reference: data.payment_reference,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      // Send email notification with the final booking data
      try {
        await supabase.functions.invoke('send-notification-email', {
          body: {
            type: 'booking',
            data: data
          }
        });
      } catch (err) {
        console.error('Failed to send booking notification email:', err);
      }

      return booking;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });

      toast({
        title: data.is_enquiry_only ? "Enquiry Submitted!" : "Booking Confirmed!",
        description: `Your reference number is ${data.booking_reference}. We'll be in touch soon.`,
      });
    },
    onError: (error) => {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: "Something went wrong. Please try again or contact us directly.",
        variant: "destructive",
      });
    },
  });
}
