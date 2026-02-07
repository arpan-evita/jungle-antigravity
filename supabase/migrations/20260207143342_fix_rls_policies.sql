-- Drop the restrictive policy
drop policy if exists "Only super admins can manage payment settings" on public.payment_settings;

-- Create a more inclusive policy using the is_admin function
create policy "Admins can manage payment settings"
  on public.payment_settings
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Also update resort_settings policies to be more inclusive if they aren't already
drop policy if exists "Only admins can update resort settings" on public.resort_settings;
drop policy if exists "Only admins can insert resort settings" on public.resort_settings;

create policy "Admins can update resort settings"
  on public.resort_settings for update
  using (public.is_admin(auth.uid()));

create policy "Admins can insert resort settings"
  on public.resort_settings for insert
  with check (public.is_admin(auth.uid()));
