(() => {
  "use strict";

  // Every city adapter must resolve to this shape. UI code (app.js) only ever
  // reads these normalized fields — it never touches a city's raw API response.
  function normalize(raw) {
    return Object.assign({
      id: null, lat: null, lng: null,
      speciesCommon: null, speciesScientific: null,
      dbh: null, health: null, address: null, region: null,
      city: null
    }, raw);
  }

  const titleCase = s => String(s || "").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

  const NYC = {
    id: "nyc",
    name: "New York City",
    short: "NYC",
    fallback: { lat: 40.7137, lng: -73.9575 },
    bounds: { latMin: 40.49, latMax: 40.92, lngMin: -74.26, lngMax: -73.68 },
    async fetchTrees(lat, lng) {
      // NYC Parks "Forestry Tree Points" (ForMS 2.0) — the live, continuously
      // maintained tree inventory, as of 2026-08-13 replacing the one-time
      // 2015 Street Tree Census (uvpi-gqnh) this used to query. That dataset
      // was an 11-year-old snapshot; whole blocks surveyed as sparse in 2015,
      // or planted/removed since, showed up as empty on the map. This dataset
      // is a Socrata geospatial Point column ("location"), so we use
      // within_box() instead of plain lat/lng BETWEEN, and filter
      // tpstructure='Full' to keep only standing living trees (it also
      // contains retired/removed records and stumps, kept for history).
      //
      // Radius/limit widened 2026-08-14 (was 0.006/0.008, limit 1000) after
      // gero compared this against the old v0.1 prototype's map, which
      // looked like it had "so many more trees." It didn't — that prototype
      // queried the stale 2015 census (uvpi-gqnh) across whatever the whole
      // visible map viewport happened to be, up to 1800 results. This is
      // still the better, continuously-updated hn5i-inap dataset — just
      // widened to show a comparably full picture per walk-reload.
      const latRadius = 0.012, lngRadius = 0.016;
      const north = lat + latRadius, south = lat - latRadius;
      const west = lng - lngRadius, east = lng + lngRadius;
      const where = `within_box(location, ${north}, ${west}, ${south}, ${east}) AND tpstructure='Full'`;
      const fields = "objectid,genusspecies,dbh,tpcondition,location";
      const res = await fetch(`https://data.cityofnewyork.us/resource/hn5i-inap.json?$select=${encodeURIComponent(fields)}&$where=${encodeURIComponent(where)}&$limit=1800`);
      if (!res.ok) throw new Error("NYC tree data unavailable");
      const data = await res.json();
      // genusspecies comes as "Scientific name - Common name"; genus-only or
      // unidentified records show up as e.g. "Acer - maple" or
      // "Unknown - Unknown" — treat "Unknown" as no species rather than
      // showing the literal word.
      const clean = s => {
        const v = String(s || "").trim();
        return v && v.toLowerCase() !== "unknown" ? v : null;
      };
      return data.filter(t => t.location && Array.isArray(t.location.coordinates)).map(t => {
        const [scientific, common] = String(t.genusspecies || "").split(" - ");
        return normalize({
          id: `nyc-${t.objectid}`, lat: t.location.coordinates[1], lng: t.location.coordinates[0],
          speciesCommon: clean(common) ? titleCase(common) : null, speciesScientific: clean(scientific),
          dbh: t.dbh ? +t.dbh : null, health: t.tpcondition || null,
          address: null, region: null, city: "nyc"
        });
      });
    }
  };

  const PHILLY = {
    id: "philly",
    name: "Philadelphia",
    short: "Philly",
    fallback: { lat: 39.9526, lng: -75.1652 },
    bounds: { latMin: 39.86, latMax: 40.14, lngMin: -75.28, lngMax: -74.96 },
    async fetchTrees(lat, lng) {
      // Philadelphia Parks & Rec tree inventory (OpenDataPhilly), served as an
      // ArcGIS FeatureServer. loc_x/loc_y are plain WGS84 degrees, so the same
      // bounding-box shape as the NYC adapter works — this is the whole point
      // of the adapter pattern: same query strategy, different field names.
      const latRadius = 0.006, lngRadius = 0.008;
      const where = `loc_y BETWEEN ${lat - latRadius} AND ${lat + latRadius} AND loc_x BETWEEN ${lng - lngRadius} AND ${lng + lngRadius}`;
      const url = `https://services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/ppr_tree_inventory_2025/FeatureServer/0/query?f=json&outFields=objectid,tree_name,tree_dbh,loc_x,loc_y&where=${encodeURIComponent(where)}&resultRecordCount=500`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Philadelphia tree data unavailable");
      const json = await res.json();
      const features = json.features || [];
      return features.filter(f => f.attributes && f.attributes.loc_x && f.attributes.loc_y).map(f => {
        const a = f.attributes;
        const [scientific, common] = String(a.tree_name || "").split(" - ");
        return normalize({
          id: `philly-${a.objectid}`, lat: a.loc_y, lng: a.loc_x,
          speciesCommon: common ? titleCase(common) : null,
          speciesScientific: scientific ? titleCase(scientific) : null,
          dbh: a.tree_dbh || null, health: null, address: null, region: "Philadelphia", city: "philly"
        });
      });
    }
  };

  const ADAPTERS = [NYC, PHILLY];

  // Pick the adapter whose bounding box contains this point; NYC is the default
  // home base if nothing matches (open ocean, testing, etc).
  function cityFor(lat, lng) {
    return ADAPTERS.find(c => lat >= c.bounds.latMin && lat <= c.bounds.latMax && lng >= c.bounds.lngMin && lng <= c.bounds.lngMax) || NYC;
  }

  function byId(id) { return ADAPTERS.find(c => c.id === id) || NYC; }

  window.TREEWALK_CITIES = { ADAPTERS, cityFor, byId, NYC, PHILLY };
})();
