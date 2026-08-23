(() => {
  "use strict";

  // NYC municipal trees are served from TreeWalk's own gameboard.
  // Local: /api/nyc-trees from gameboard/serve.py
  // Hosted: Supabase municipal_trees
  // This file does not call NYC Open Data.

  const LAT_RADIUS = 0.012;
  const LNG_RADIUS = 0.016;

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
    if (!res.ok) throw new Error("Local NYC gameboard unavailable");
    const data = await res.json();
    return Array.isArray(data) ? data.map(normalizeRow) : null;
  }

  async function fromSupabase(lat, lng) {
    const config = window.TREEWALK_CLOUD;
    if (!config || !config.url || !config.publishableKey || !window.supabase) return null;
    const client = window.supabase.createClient(config.url, config.publishableKey);
    const { data, error } = await client
      .from("municipal_trees")
      .select("parks_objectid,lat,lng,species_common,species_scientific,dbh,health")
      .gte("lat", lat - LAT_RADIUS).lte("lat", lat + LAT_RADIUS)
      .gte("lng", lng - LNG_RADIUS).lte("lng", lng + LNG_RADIUS);
    if (error) throw new Error(error.message || "Hosted NYC gameboard unavailable");
    return (data || []).map(normalizeRow);
  }

  async function fetchNyc(lat, lng) {
    try {
      const local = await fromLocalApi(lat, lng);
      if (local) return local;
    } catch (err) {
      if (err && err.message === "Local NYC gameboard unavailable") throw err;
    }
    const hosted = await fromSupabase(lat, lng);
    if (hosted && hosted.length) return hosted;
    if (hosted && hosted.length === 0) return hosted;
    throw new Error("NYC gameboard unavailable. Run python3 gameboard/serve.py, or publish the municipal snapshot to Supabase.");
  }

  window.TREEWALK_GAMEBOARD = { fetchNyc, LAT_RADIUS, LNG_RADIUS };
})();
