-- HAID Watch — Phase 1 schema
-- Run this in the Supabase SQL editor after creating your project.

create extension if not exists "uuid-ossp";

-- Nigeria's administrative hierarchy: State -> LGA -> Ward -> Polling Unit
create table if not exists states (
  id serial primary key,
  name text unique not null
);

create table if not exists lgas (
  id serial primary key,
  state_id int references states(id) not null,
  name text not null,
  unique (state_id, name)
);

create table if not exists wards (
  id serial primary key,
  lga_id int references lgas(id) not null,
  name text not null,
  unique (lga_id, name)
);

create table if not exists polling_units (
  id serial primary key,
  ward_id int references wards(id) not null,
  name text not null,
  code text,
  unique (ward_id, name)
);

-- Incident categories (extensible)
create type incident_category as enum (
  'election_incident',
  'security_concern',
  'community_disturbance',
  'voter_intimidation',
  'public_safety'
);

create type incident_status as enum (
  'pending_review',
  'published',
  'flagged',
  'rejected'
);

create table if not exists incidents (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz default now(),
  title text not null,
  description text not null,
  category incident_category not null,
  status incident_status not null default 'pending_review',

  -- location
  state_id int references states(id),
  lga_id int references lgas(id),
  ward_id int references wards(id),
  polling_unit_id int references polling_units(id),
  latitude double precision,
  longitude double precision,

  -- reporter
  is_anonymous boolean default true,
  reporter_contact text, -- optional, only stored if user chooses to share, never shown publicly

  -- moderation
  flag_count int default 0,
  moderation_notes text
);

create table if not exists incident_media (
  id uuid primary key default uuid_generate_v4(),
  incident_id uuid references incidents(id) on delete cascade,
  storage_path text not null,
  media_type text not null check (media_type in ('photo', 'video')),
  created_at timestamptz default now()
);

-- Row Level Security
alter table incidents enable row level security;
alter table incident_media enable row level security;

-- Public can read only published incidents
create policy "public read published incidents"
  on incidents for select
  using (status = 'published');

-- Anyone (anon key) can submit a new incident, goes in as pending_review
create policy "anyone can submit incident"
  on incidents for insert
  with check (status = 'pending_review');

-- Media follows the same read rule via incident_id join (handled in app layer for simplicity in Phase 1)
create policy "public read media for published incidents"
  on incident_media for select
  using (
    exists (
      select 1 from incidents
      where incidents.id = incident_media.incident_id
      and incidents.status = 'published'
    )
  );

create policy "anyone can attach media on submit"
  on incident_media for insert
  with check (true);

-- Moderator updates (status changes, flagging) should go through a service-role key
-- (server-side only, never exposed to the browser) — no public policy needed for update/delete.
