-- Create payment_settings table
create table if not exists public.payment_settings (
  id uuid default gen_random_uuid() primary key,
  provider text not null unique, -- 'razorpay', 'stripe', 'paypal', 'phonepe'
  is_enabled boolean default false not null,
  config jsonb default '{}'::jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_by uuid references auth.users(id)
);

-- Add RLS policies
alter table public.payment_settings enable row level security;

-- Only super admins can view/manage payment settings
create policy "Only super admins can manage payment settings"
  on public.payment_settings
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'super_admin'
    )
  )
  with check (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'super_admin'
    )
  );

-- Insert default rows for each provider
insert into public.payment_settings (provider, is_enabled, config)
values 
  ('razorpay', false, '{"key_id": "", "key_secret": ""}'::jsonb),
  ('stripe', false, '{"publishable_key": "", "secret_key": ""}'::jsonb),
  ('paypal', false, '{"client_id": "", "client_secret": ""}'::jsonb),
  ('phonepe', false, '{"merchant_id": "", "salt_key": "", "salt_index": ""}'::jsonb)
on conflict (provider) do nothing;

-- Create updated_at trigger for payment_settings
create trigger set_updated_at_payment_settings
  before update on public.payment_settings
  for each row
  execute procedure public.handle_updated_at();
