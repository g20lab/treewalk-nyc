(() => {
  "use strict";

  // NYC municipal trees come from TreeWalk's snapshot.
  // Local: /api/nyc-trees from gameboard/serve.py
  // Hosted: static tiles at /gameboard/tiles/
  // This file does not call NYC Open Data.

  const LAT_RADIUS = 0.012;
  const LNG_RADIUS = 0.016;
  let tileManifest = null;

  function normalizeRow(row) {
    return {
      id: row.id || `nyc-${row.parks_objectid}`,
      lat: row.lat,
      lng: row.lng,
      speciesCommon: row.speciesCommon || row.species_common || null,
      speciesScientific: row.speciesScientific || row.species_scientific || null,
      dbh: row.dbh == null ? null : +row.dbh,
      health: row.health || null,
      address: null,
      region: null,
      city: "nyc"
    };
  }

  async function fromLocalApi(lat, lng) {
    const res = await fetch(`/api/nyc-trees?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`);
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) ? data.map(normalizeRow) : null;
  }

  async function loadManifest() {
    if (tileManifest) return tileManifest;
    const res = await fetch("/gameboard/tiles/manifest.json");
    if (!res.ok) return null;
    tileManifest = await res.json();
    return tileManifest;
  }

  async function fromTiles(lat, lng) {
    const manifest = await loadManifest();
    if (!manifest || !manifest.cell) return null;
    const cell = manifest.cell;
    const south = lat - LAT_RADIUS, north = lat + LAT_RADIUS;
    const west = lng - LNG_RADIUS, east = lng + LNG_RADIUS;
    const i0 = Math.floor(south / cell), i1 = Math.floor(north / cell);
    const j0 = Math.floor(west / cell), j1 = Math.floor(east / cell);
    const fetches = [];
    for (let i = i0; i <= i1; i++) {
      for (let j = j0; j <= j1; j++) {
        fetches.push(fetch(`/gameboard/tiles/${i}_${j}.json`).then(res => res.ok ? res.json() : []));
      }
    }
    const tiles = await Promise.all(fetches);
    const trees = [];
    tiles.forEach(list => {
      (list || []).forEach(row => {
        const treeLat = row[1], treeLng = row[2];
        if (treeLat < south || treeLat > north || treeLng < west || treeLng > east) return;
        const speciesIdx = row[3];
        const healthIdx = row[5];
        trees.push(normalizeRow({
          id: `nyc-${row[0]}`,
          lat: treeLat,
          lng: treeLng,
          speciesCommon: speciesIdx == null ? null : manifest.species[speciesIdx],
          speciesScientific: speciesIdx == null ? null : (manifest.scientific && manifest.scientific[String(speciesIdx)]) || null,
          dbh: row[4],
          health: healthIdx == null ? null : manifest.health[healthIdx]
        }));
      });
    });
    return trees;
  }

  async function fetchNyc(lat, lng) {
    const local = await fromLocalApi(lat, lng);
    if (local && local.length) return local;
    const tiles = await fromTiles(lat, lng);
    if (tiles) return tiles;
    throw new Error("NYC gameboard unavailable.");
  }

  window.TREEWALK_GAMEBOARD = { fetchNyc, LAT_RADIUS, LNG_RADIUS };
})();
