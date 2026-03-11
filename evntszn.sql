create extension if not exists "pgcrypto";

-- ORGANIZERS
create table if not exists public.organizers (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid,
  name text not null,
  created_at timestamptz default now()
);

-- EVENTS
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid references public.organizers(id) on delete cascade,
  title text not null,
  slug text unique not null,
  starts_at timestamptz not null,
  venue_name text,
  venue_address text,
  price_cents int not null,
  currency text default 'usd',
  capacity int not null,
  published boolean default false,
  staff_pin text not null,
  created_at timestamptz default now()
);

create index if not exists events_slug_idx on public.events(slug);

-- TICKETS
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  public_id text not null unique,
  buyer_email text not null,
  buyer_name text,
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  status text not null default 'paid', -- paid | void | refunded
  checked_in_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists tickets_event_id_idx on public.tickets(event_id);
create index if not exists tickets_checked_in_idx on public.tickets(event_id, checked_in_at);

-- LIVE EVENT STATS
create or replace view public.event_stats as
select
  e.id as event_id,
  count(t.id) filter (where t.status='paid') as tickets_sold,
  count(t.id) filter (where t.checked_in_at is not null and t.status='paid') as checked_in
from public.events e
left join public.tickets t on t.event_id = e.id
group by e.id;
