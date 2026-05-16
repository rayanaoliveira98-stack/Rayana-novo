-- Run this in Supabase → SQL Editor

create table if not exists partner_leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  city        text,
  category    text,
  email       text not null,
  phone       text,
  status      text not null default 'new'
    check (status in ('new', 'contacted', 'onboarded', 'rejected'))
);

-- Allow anonymous INSERT (public landing page form)
alter table partner_leads enable row level security;

create policy "Public can insert leads"
  on partner_leads for insert
  to anon
  with check (true);

-- Only authenticated users (you, via Supabase dashboard) can read
create policy "Auth users can read leads"
  on partner_leads for select
  to authenticated
  using (true);

create policy "Auth users can update leads"
  on partner_leads for update
  to authenticated
  using (true)
  with check (true);
