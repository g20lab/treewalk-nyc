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
      // NYC is TreeWalk's own municipal snapshot — see gameboard/.
      // Do not query NYC Open Data from the phone. That API pages, throttles,
      // and returns a different slice of a dense block on every walk.
      if (!window.TREEWALK_GAMEBOARD || !window.TREEWALK_GAMEBOARD.fetchNyc) {
        throw new Error("NYC gameboard client is missing");
      }
      return window.TREEWALK_GAMEBOARD.fetchNyc(lat, lng);
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
