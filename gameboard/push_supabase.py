#!/usr/bin/env python3
"""Publish the local NYC snapshot to Supabase municipal_trees.

Run gameboard/supabase.sql in the Supabase SQL editor first, then:

  SUPABASE_URL=https://YOUR-PROJECT.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
  python3 gameboard/push_supabase.py

Never commit the service role key. The browser only needs the existing
publishable key, which can read this table after the public-read policy.
"""

from __future__ import annotations

import json
import os
import sqlite3
import sys
import urllib.error
import urllib.request
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "data" / "nyc-municipal.sqlite"
BATCH = 500


def main() -> int:
    url = os.environ.get("SUPABASE_URL", "").rstrip("/")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
    if not url or not key:
        raise SystemExit("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY")
    if not DB_PATH.exists():
        raise SystemExit(f"Missing snapshot {DB_PATH}")

    db = sqlite3.connect(DB_PATH)
    rows = db.execute(
        """
        select parks_objectid, lat, lng, species_common, species_scientific,
               dbh, health, city, source, snapshot_at
        from municipal_trees
        """
    ).fetchall()
    db.close()

    endpoint = f"{url}/rest/v1/municipal_trees"
    sent = 0
    for i in range(0, len(rows), BATCH):
        chunk = []
        for row in rows[i : i + BATCH]:
            chunk.append(
                {
                    "parks_objectid": row[0],
                    "lat": row[1],
                    "lng": row[2],
                    "species_common": row[3],
                    "species_scientific": row[4],
                    "dbh": row[5],
                    "health": row[6],
                    "city": row[7],
                    "source": row[8],
                    "snapshot_at": row[9],
                }
            )
        payload = json.dumps(chunk).encode("utf-8")
        req = urllib.request.Request(
            f"{endpoint}?on_conflict=parks_objectid",
            data=payload,
            method="POST",
            headers={
                "apikey": key,
                "Authorization": f"Bearer {key}",
                "Content-Type": "application/json",
                "Prefer": "resolution=merge-duplicates,return=minimal",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=120):
                pass
        except urllib.error.HTTPError as err:
            raise SystemExit(f"Supabase rejected a batch: {err.read().decode()[:400]}") from err
        sent += len(chunk)
        print(f"Published {sent:,} / {len(rows):,}", flush=True)

    print(f"Done. {len(rows):,} municipal trees are on Supabase.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
