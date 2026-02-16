-- Create chat_leads table
create table public.chat_leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  phone text,
  travel_dates text,
  guests text,
  status text default 'new', -- new, contacted, booked, closed
  inquiry_type text default 'general', -- general, booking, wedding, corporate, safari
  created_at timestamptz default now()
);

-- Create chat_sessions table
create table public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  messages jsonb default '[]'::jsonb,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.chat_leads enable row level security;
alter table public.chat_sessions enable row level security;

-- Policies for chat_leads
create policy "Allow public insert for leads"
  on public.chat_leads for insert
  with check (true);

create policy "Allow admin select for leads"
  on public.chat_leads for select
  using (auth.role() = 'authenticated'); -- Assuming authenticated users are admins for now, or refine later

-- Policies for chat_sessions
create policy "Allow public insert/update for sessions"
  on public.chat_sessions for all
  using (true)
  with check (true);

-- Functions
create or update function public.handle_new_lead()
returns trigger as $$
begin
  -- Logic to send email notification could go here
  return new;
end;
$$ language plpgsql;
