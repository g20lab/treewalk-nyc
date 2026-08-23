#!/usr/bin/env python3
"""Print a stable nearby count from the local NYC gameboard."""

from __future__ import annotations

import argparse
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "data" / "nyc-municipal.sqlite"
DEFAULT_LAT = 40.7137
DEFAULT_LNG = -73.9575
LAT_RADIUS = 0.012
LNG_RADIUS = 0.016


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--lat", type=float, default=DEFAULT_LAT)
    parser.add_argument("--lng", type=float, default=DEFAULT_LNG)
    args = parser.parse_args()

    if not DB_PATH.exists():
        raise SystemExit(
            f"No gameboard yet. Copy nyc-municipal.sqlite into {DB_PATH.parent} "
            "or run ingest_nyc.py. Missing " + str(DB_PATH)
        )

    north, south = args.lat + LAT_RADIUS, args.lat - LAT_RADIUS
    east, west = args.lng + LNG_RADIUS, args.lng - LNG_RADIUS
    db = sqlite3.connect(DB_PATH)
    total = db.execute("select count(*) from municipal_trees").fetchone()[0]
    nearby = db.execute(
        """
        select count(*) from municipal_trees
        where lat between ? and ? and lng between ? and ?
        """,
        (south, north, west, east),
    ).fetchone()[0]
    snapshot = db.execute(
        "select value from gameboard_meta where key = 'snapshot_at'"
    ).fetchone()
    db.close()
    print(f"snapshot {snapshot[0] if snapshot else 'unknown'}")
    print(f"citywide {total:,}")
    print(f"nearby   {nearby:,}  ({args.lat}, {args.lng})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
