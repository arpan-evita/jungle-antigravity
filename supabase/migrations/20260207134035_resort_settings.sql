-- Create resort_settings table
create table if not exists public.resort_settings (
  id uuid default gen_random_uuid() primary key,
  resort_name text not null,
  location text not null,
  phone text not null,
  email text not null,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_by uuid references auth.users(id)
);

-- Add RLS policies
alter table public.resort_settings enable row level security;

-- Allow anyone to read resort settings (for public display)
create policy "Resort settings are viewable by everyone"
  on public.resort_settings for select
  using (true);

-- Only admins can update resort settings
create policy "Only admins can update resort settings"
  on public.resort_settings for update
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role in ('admin', 'super_admin')
    )
  );

-- Only admins can insert resort settings
create policy "Only admins can insert resort settings"
  on public.resort_settings for insert
  with check (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role in ('admin', 'super_admin')
    )
  );

-- Insert default resort settings
insert into public.resort_settings (resort_name, location, phone, email, address)
values (
  'Aranya Forest Resort',
  'Maharashtra, India',
  '+91 98765 43210',
  'contact@aranyaresort.com',
  null
);

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at
  before update on public.resort_settings
  for each row
  execute procedure public.handle_updated_at();
