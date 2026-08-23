#!/usr/bin/env python3
"""Download every living NYC Parks tree into a local SQLite gameboard.

Source: Forestry Tree Points (hn5i-inap) on NYC Open Data.
Filter: tpstructure = Full (standing living trees only).
This is a scheduled ingest job. The app must never call this API.
"""

from __future__ import annotations

import json
import sqlite3
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

DATASET = "hn5i-inap"
SOURCE = "nyc-forestry-tree-points"
BASE = f"https://data.cityofnewyork.us/resource/{DATASET}.json"
PAGE = 20_000
FIELDS = "objectid,genusspecies,dbh,tpcondition,location"
ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
DB_PATH = DATA_DIR / "nyc-municipal.sqlite"
SCHEMA_PATH = ROOT / "schema.sql"


def clean(value: str | None) -> str | None:
    text = (value or "").strip()
    if not text or text.lower() == "unknown":
        return None
    return text


def title_case(value: str) -> str:
    return value.lower().title()


def parse_row(raw: dict, snapshot_at: str) -> tuple | None:
    location = raw.get("location") or {}
    coords = location.get("coordinates")
    if not isinstance(coords, list) or len(coords) < 2:
        return None
    lng, lat = float(coords[0]), float(coords[1])
    scientific, _, common = str(raw.get("genusspecies") or "").partition(" - ")
    dbh = raw.get("dbh")
    return (
        int(raw["objectid"]),
        lat,
        lng,
        title_case(common) if clean(common) else None,
        clean(scientific),
        float(dbh) if dbh not in (None, "") else None,
        clean(raw.get("tpcondition")),
        "nyc",
        SOURCE,
        snapshot_at,
    )


def fetch_page(after_id: int) -> list[dict]:
    where = f"tpstructure='Full' AND objectid > {after_id}"
    query = urllib.parse.urlencode(
        {
            "$select": FIELDS,
            "$where": where,
            "$order": "objectid",
            "$limit": PAGE,
        }
    )
    req = urllib.request.Request(
        f"{BASE}?{query}",
        headers={"Accept": "application/json", "User-Agent": "TreeWalk-gameboard-ingest/0.1"},
    )
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=120) as res:
                return json.loads(res.read().decode("utf-8"))
        except urllib.error.HTTPError as err:
            if err.code in (429, 500, 502, 503, 504) and attempt < 5:
                time.sleep(2 ** attempt)
                continue
            raise
        except (TimeoutError, urllib.error.URLError):
            if attempt < 5:
                time.sleep(2 ** attempt)
                continue
            raise
    return []


def main() -> int:
    DATA_DIR.mkdir(exist_ok=True)
    snapshot_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    db = sqlite3.connect(DB_PATH)
    db.execute("PRAGMA journal_mode=WAL")
    db.executescript(SCHEMA_PATH.read_text())

    existing = db.execute("select count(*) from municipal_trees").fetchone()[0]
    after_id = 0
    if existing:
        after_id = db.execute("select max(parks_objectid) from municipal_trees").fetchone()[0] or 0
        print(f"Resuming after parks_objectid {after_id} ({existing:,} rows already stored)")
    else:
        print("Starting a fresh municipal snapshot")

    inserted = 0
    while True:
        page = fetch_page(after_id)
        if not page:
            break
        rows = [parsed for raw in page if (parsed := parse_row(raw, snapshot_at))]
        db.executemany(
            """
            insert or replace into municipal_trees (
              parks_objectid, lat, lng, species_common, species_scientific,
              dbh, health, city, source, snapshot_at
            ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            rows,
        )
        db.commit()
        inserted += len(rows)
        after_id = int(page[-1]["objectid"])
        total = existing + inserted
        print(f"Stored {total:,} living trees (last id {after_id})", flush=True)
        if len(page) < PAGE:
            break

    total = db.execute("select count(*) from municipal_trees").fetchone()[0]
    min_id, max_id = db.execute(
        "select min(parks_objectid), max(parks_objectid) from municipal_trees"
    ).fetchone()
    meta = {
        "source": SOURCE,
        "dataset": DATASET,
        "dataset_url": "https://data.cityofnewyork.us/Environment/Forestry-Tree-Points/hn5i-inap",
        "filter": "tpstructure='Full'",
        "city": "nyc",
        "count": total,
        "parks_objectid_min": min_id,
        "parks_objectid_max": max_id,
        "snapshot_at": snapshot_at,
        "attribution": "NYC Department of Parks and Recreation, Forestry Tree Points",
    }
    for key, value in meta.items():
        db.execute(
            "insert or replace into gameboard_meta(key, value) values (?, ?)",
            (key, json.dumps(value)),
        )
    db.commit()
    (DATA_DIR / "snapshot.json").write_text(json.dumps(meta, indent=2) + "\n")
    db.close()
    print(f"Gameboard ready: {total:,} living trees -> {DB_PATH}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
