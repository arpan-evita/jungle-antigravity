-- Create blogs table
create table if not exists public.blogs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  slug text unique not null,
  excerpt text,
  content jsonb not null,
  featured_image text,
  category text,
  author_id uuid references auth.users(id),
  is_published boolean default false not null,
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.blogs enable row level security;

-- Public can view published blogs
create policy "Anyone can view published blogs"
  on public.blogs
  for select
  using (is_published = true);

-- Admins can manage all blogs
create policy "Admins can manage all blogs"
  on public.blogs
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Add trigger for updated_at
create trigger update_blogs_updated_at
  before update on public.blogs
  for each row
  execute function public.update_updated_at_column();

-- Function to generate slug from title (optional, but helpful)
-- For now, we'll handle this on the frontend or via a simple trigger if needed.
