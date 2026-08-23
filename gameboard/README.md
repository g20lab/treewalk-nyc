# NYC gameboard

TreeWalk owns a snapshot of living NYC street and landscaped-park trees.
The phone does not query NYC Open Data. Open Data is an ingest source only.

Source: [Forestry Tree Points](https://data.cityofnewyork.us/Environment/Forestry-Tree-Points/hn5i-inap) (`hn5i-inap`), `tpstructure = Full`.
Attribution: NYC Department of Parks and Recreation. This is not the official [NYC Tree Map](https://tree-map.nycgovparks.org/).

The snapshot file is not in git. It is about 131 MB.

## Local map

```
# once: put nyc-municipal.sqlite in gameboard/data/
# or refresh it:
python3 gameboard/ingest_nyc.py

python3 gameboard/serve.py
```

Open `http://localhost:8080`. Nearby trees come from `/api/nyc-trees`.

`python3 -m http.server` will not load NYC trees. Use `serve.py`.

## Publish for the live site

1. Run `gameboard/supabase.sql` in the Supabase SQL editor.
2. Publish the snapshot:

```
SUPABASE_URL=https://YOUR-PROJECT.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
python3 gameboard/push_supabase.py
```

The service role key stays on your machine. The browser keeps using the existing publishable key.

## Weekly refresh

```
python3 gameboard/ingest_nyc.py
python3 gameboard/push_supabase.py
```

Ingest upserts by Parks `objectid`. It does not touch neighbor-added trees in `trees`.
