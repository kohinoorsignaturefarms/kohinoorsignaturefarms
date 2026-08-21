-- Kohinoor Signature Farms Supabase Table Setup
-- Copy and run in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ifhjqtysuyhgpqjwxudf/sql

create table if not exists public.ksf_store (
  key text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.ksf_store enable row level security;

-- Policy: Allow read & write access for website and admin panel
create policy "Allow full access to ksf_store"
  on public.ksf_store
  for all
  using (true)
  with check (true);
