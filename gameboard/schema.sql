-- TreeWalk municipal gameboard (SQLite).
-- Parks inventory only. Neighbor-added trees stay in Supabase `trees`.

create table if not exists municipal_trees (
  parks_objectid integer primary key,
  lat real not null,
  lng real not null,
  species_common text,
  species_scientific text,
  dbh real,
  health text,
  city text not null default 'nyc',
  source text not null default 'nyc-forestry-tree-points',
  snapshot_at text not null
);

create index if not exists municipal_trees_lat_lng
  on municipal_trees (lat, lng);

create table if not exists gameboard_meta (
  key text primary key,
  value text not null
);
