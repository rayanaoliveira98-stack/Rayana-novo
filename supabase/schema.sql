-- Run this in Supabase → SQL Editor

-- ─── Partner leads (businesses registering on the landing page) ───────────────
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

alter table partner_leads enable row level security;

create policy "Public can insert leads"
  on partner_leads for insert to anon with check (true);

create policy "Auth users can read leads"
  on partner_leads for select to authenticated using (true);

create policy "Auth users can update leads"
  on partner_leads for update to authenticated using (true) with check (true);


-- ─── Family inquiries (families contacting a business via the search page) ────
create table if not exists family_inquiries (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),
  business_id   text not null,
  business_name text not null,
  activity      text not null,
  parent_name   text not null,
  email         text not null,
  phone         text,
  message       text,
  children_age  text,
  status        text not null default 'new'
    check (status in ('new', 'contacted', 'closed'))
);

alter table family_inquiries enable row level security;

create policy "Public can insert inquiries"
  on family_inquiries for insert to anon with check (true);

create policy "Auth users can read inquiries"
  on family_inquiries for select to authenticated using (true);

create policy "Auth users can update inquiries"
  on family_inquiries for update to authenticated using (true) with check (true);
