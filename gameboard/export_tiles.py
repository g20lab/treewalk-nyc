#!/usr/bin/env python3
"""Export the municipal snapshot as compact static tiles the phone can fetch.

Tiles are small JSON files under gameboard/tiles/. The live site can serve
them with no Open Data API and no extra secret key.
"""

from __future__ import annotations

import json
import math
import sqlite3
from collections import defaultdict
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "data" / "nyc-municipal.sqlite"
TILE_DIR = Path(__file__).resolve().parent / "tiles"
CELL = 0.02


def cell_for(lat: float, lng: float) -> tuple[int, int]:
    return (math.floor(lat / CELL), math.floor(lng / CELL))


def main() -> int:
    if not DB_PATH.exists():
        raise SystemExit(f"Missing snapshot {DB_PATH}")

    db = sqlite3.connect(DB_PATH)
    rows = db.execute(
        """
        select parks_objectid, lat, lng, species_common, species_scientific, dbh, health
        from municipal_trees
        """
    ).fetchall()
    db.close()

    species = []
    species_index = {}
    health = []
    health_index = {}
    buckets: dict[tuple[int, int], list] = defaultdict(list)

    def intern(table: list, index: dict, value):
        if value is None:
            return None
        if value not in index:
            index[value] = len(table)
            table.append(value)
        return index[value]

    for objectid, lat, lng, common, scientific, dbh, condition in rows:
        si = intern(species, species_index, common)
        hi = intern(health, health_index, condition)
        buckets[cell_for(lat, lng)].append(
            [
                int(objectid),
                round(lat, 6),
                round(lng, 6),
                si,
                None if dbh is None else round(float(dbh), 1),
                hi,
            ]
        )

    if TILE_DIR.exists():
        for old in TILE_DIR.glob("*.json"):
            old.unlink()
    TILE_DIR.mkdir(exist_ok=True)

    manifest = {
        "cell": CELL,
        "count": len(rows),
        "tiles": len(buckets),
        "species": species,
        "health": health,
        "scientific": {},
        "attribution": "NYC Department of Parks and Recreation, Forestry Tree Points",
        "note": "Not the official NYC Tree Map.",
    }

    # Keep scientific names in the manifest keyed by common-name index when unique enough.
    # A second pass is too heavy; the adapter can live without latin on first paint.
    for name, idx in species_index.items():
        manifest["scientific"][str(idx)] = None

    db = sqlite3.connect(DB_PATH)
    for common, scientific in db.execute(
        "select species_common, min(species_scientific) from municipal_trees group by species_common"
    ):
        if common in species_index:
            manifest["scientific"][str(species_index[common])] = scientific
    db.close()

    (TILE_DIR / "manifest.json").write_text(json.dumps(manifest, separators=(",", ":")) + "\n")
    for (i, j), trees in buckets.items():
        (TILE_DIR / f"{i}_{j}.json").write_text(json.dumps(trees, separators=(",", ":")) + "\n")

    size = sum(p.stat().st_size for p in TILE_DIR.glob("*.json"))
    print(f"Wrote {len(buckets)} tiles + manifest, {len(rows):,} trees, {size / 1_000_000:.1f} MB -> {TILE_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
