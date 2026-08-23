#!/usr/bin/env python3
"""Serve TreeWalk and the NYC gameboard from the same origin.

  python3 gameboard/serve.py

Then open http://localhost:8080. Nearby NYC trees come from the local
snapshot. This process does not call NYC Open Data.
"""

from __future__ import annotations

import json
import sqlite3
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = Path(__file__).resolve().parent / "data" / "nyc-municipal.sqlite"
LAT_RADIUS = 0.012
LNG_RADIUS = 0.016
PORT = 8080


def nearby_trees(lat: float, lng: float) -> list[dict]:
    if not DB_PATH.exists():
        raise FileNotFoundError(
            f"Missing {DB_PATH}. Place the municipal snapshot there or run ingest_nyc.py."
        )
    north, south = lat + LAT_RADIUS, lat - LAT_RADIUS
    east, west = lng + LNG_RADIUS, lng - LNG_RADIUS
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    rows = db.execute(
        """
        select parks_objectid, lat, lng, species_common, species_scientific, dbh, health
        from municipal_trees
        where lat between ? and ? and lng between ? and ?
        """,
        (south, north, west, east),
    ).fetchall()
    db.close()
    return [
        {
            "id": f"nyc-{row['parks_objectid']}",
            "lat": row["lat"],
            "lng": row["lng"],
            "speciesCommon": row["species_common"],
            "speciesScientific": row["species_scientific"],
            "dbh": row["dbh"],
            "health": row["health"],
            "address": None,
            "region": None,
            "city": "nyc",
        }
        for row in rows
    ]


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/nyc-trees":
            return self.handle_nyc_trees(parsed)
        return super().do_GET()

    def handle_nyc_trees(self, parsed):
        query = parse_qs(parsed.query)
        try:
            lat = float(query["lat"][0])
            lng = float(query["lng"][0])
        except (KeyError, IndexError, ValueError):
            return self.json_response(400, {"error": "lat and lng are required"})
        try:
            trees = nearby_trees(lat, lng)
        except FileNotFoundError as err:
            return self.json_response(503, {"error": str(err)})
        return self.json_response(200, trees)

    def json_response(self, status: int, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        if args and str(args[0]).startswith("GET /api/"):
            super().log_message(format, *args)


if __name__ == "__main__":
    if not DB_PATH.exists():
        raise SystemExit(
            f"Missing municipal snapshot at {DB_PATH}\n"
            "Copy nyc-municipal.sqlite into gameboard/data/ or run:\n"
            "  python3 gameboard/ingest_nyc.py"
        )
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"TreeWalk + NYC gameboard  http://localhost:{PORT}")
    print(f"Snapshot  {DB_PATH}")
    server.serve_forever()
