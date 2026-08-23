-- Run once in the Supabase SQL editor.
-- Public read, no public write. Ingest uses the service role locally.

create table if not exists municipal_trees (
  parks_objectid bigint primary key,
  lat double precision not null,
  lng double precision not null,
  species_common text,
  species_scientific text,
  dbh double precision,
  health text,
  city text not null default 'nyc',
  source text not null default 'nyc-forestry-tree-points',
  snapshot_at timestamptz not null
);

create index if not exists municipal_trees_lat_lng
  on municipal_trees (lat, lng);

alter table municipal_trees enable row level security;

drop policy if exists municipal_trees_public_read on municipal_trees;
create policy municipal_trees_public_read
  on municipal_trees
  for select
  to anon, authenticated
  using (true);
