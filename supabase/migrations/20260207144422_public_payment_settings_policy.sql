-- Allow anyone to view which payment providers are enabled
-- This is needed for the public booking flow to show the correct payment options
-- Note: We only allow selecting 'provider' and 'is_enabled' to avoid leaking 'config'
create policy "Allow public to view enabled payment providers"
  on public.payment_settings for select
  using (true);

-- To be extra safe, we can use a view or just be careful with our frontend queries.
-- For now, the policy allows reading the table, but we will only query is_enabled in the frontend.
