import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { RoomCategory, MealPlanPrice, Season, Package, TaxConfig, RoomStatus, MealPlan, SeasonType, PackageType } from "@/types/booking";

export function useRoomCategories() {
  return useQuery({
    queryKey: ['room-categories'],
    queryFn: async (): Promise<RoomCategory[]> => {
      const { data, error } = await supabase
        .from('room_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return (data || []).map(room => ({
        id: room.id,
        name: room.name,
        slug: room.slug,
        description: room.description,
        max_adults: room.max_adults,
        max_children: room.max_children,
        base_occupancy: room.base_occupancy,
        base_price_per_night: Number(room.base_price_per_night),
        extra_adult_price: Number(room.extra_adult_price),
        extra_child_price: Number(room.extra_child_price),
        total_rooms: room.total_rooms,
        amenities: Array.isArray(room.amenities) ? room.amenities.map(String) : [],
        images: Array.isArray(room.images) ? room.images.map(String) : [],
        is_active: room.is_active,
        display_order: room.display_order ?? 0,
        created_at: room.created_at,
        updated_at: room.updated_at,
      }));
    },
  });
}

export function useMealPlanPrices() {
  return useQuery({
    queryKey: ['meal-plan-prices'],
    queryFn: async (): Promise<MealPlanPrice[]> => {
      const { data, error } = await supabase
        .from('meal_plan_prices')
        .select('*')
        .eq('is_active', true)
        .order('adult_price');

      if (error) throw error;
      return (data || []).map(mp => ({
        id: mp.id,
        meal_plan: mp.meal_plan as MealPlan,
        name: mp.name,
        description: mp.description,
        adult_price: Number(mp.adult_price),
        child_price: Number(mp.child_price),
        is_active: mp.is_active,
      }));
    },
  });
}

export function useSeasons() {
  return useQuery({
    queryKey: ['seasons'],
    queryFn: async (): Promise<Season[]> => {
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return (data || []).map(s => ({
        id: s.id,
        name: s.name,
        season_type: s.season_type as SeasonType,
        start_date: s.start_date,
        end_date: s.end_date,
        price_multiplier: Number(s.price_multiplier),
        is_active: s.is_active,
      }));
    },
  });
}

export function usePackages() {
  return useQuery({
    queryKey: ['packages'],
    queryFn: async (): Promise<Package[]> => {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return (data || []).map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        slug: pkg.slug,
        package_type: pkg.package_type as PackageType,
        description: pkg.description,
        short_description: pkg.short_description,
        duration_nights: pkg.duration_nights,
        inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions.map(String) : [],
        exclusions: Array.isArray(pkg.exclusions) ? pkg.exclusions.map(String) : [],
        is_fixed_price: pkg.is_fixed_price,
        fixed_price: pkg.fixed_price ? Number(pkg.fixed_price) : null,
        per_night_price: pkg.per_night_price ? Number(pkg.per_night_price) : null,
        applicable_room_ids: Array.isArray(pkg.applicable_room_ids) ? pkg.applicable_room_ids : [],
        valid_from: pkg.valid_from,
        valid_until: pkg.valid_until,
        min_guests: pkg.min_guests ?? 1,
        max_guests: pkg.max_guests,
        images: Array.isArray(pkg.images) ? pkg.images.map(String) : [],
        is_active: pkg.is_active,
        is_featured: pkg.is_featured,
        display_order: pkg.display_order ?? 0,
      }));
    },
  });
}

export function useTaxConfig() {
  return useQuery({
    queryKey: ['tax-config'],
    queryFn: async (): Promise<TaxConfig[]> => {
      const { data, error } = await supabase
        .from('tax_config')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;
      return (data || []).map(t => ({
        id: t.id,
        name: t.name,
        percentage: Number(t.percentage),
        is_active: t.is_active,
      }));
    },
  });
}

export function useCheckAvailability(
  roomCategoryId: string | undefined,
  checkInDate: Date | undefined,
  checkOutDate: Date | undefined
) {
  return useQuery({
    queryKey: ['availability', roomCategoryId, checkInDate?.toISOString(), checkOutDate?.toISOString()],
    queryFn: async (): Promise<number> => {
      if (!roomCategoryId || !checkInDate || !checkOutDate) return 0;

      // Use the new get_available_rooms function
      const { data, error } = await supabase
        .rpc('get_available_rooms', {
          _room_category_id: roomCategoryId,
          _check_in: checkInDate.toISOString().split('T')[0],
          _check_out: checkOutDate.toISOString().split('T')[0],
        });

      if (error) {
        console.error('Availability check error:', error);
        return 0;
      }

      // Returns an array of available rooms, so return the count
      return Array.isArray(data) ? data.length : 0;
    },
    enabled: !!roomCategoryId && !!checkInDate && !!checkOutDate,
  });
}

export function useSeasonMultiplier(date: Date | undefined) {
  return useQuery({
    queryKey: ['season-multiplier', date?.toISOString()],
    queryFn: async (): Promise<number> => {
      if (!date) return 1;

      const { data, error } = await supabase
        .rpc('get_season_multiplier', {
          p_date: date.toISOString().split('T')[0],
        });

      if (error) throw error;
      return Number(data) || 1;
    },
    enabled: !!date,
  });
}

export function usePaymentSettings() {
  return useQuery({
    queryKey: ['payment-settings-public'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payment_settings')
        .select('provider, is_enabled, config')
        .eq('is_enabled', true);

      if (error) throw error;
      return data;
    },
  });
}
