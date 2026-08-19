(() => {
  "use strict";

  // Captured synchronously, before the Supabase client (below) gets a
  // chance to parse/strip the URL — this is the one reliable signal that
  // this page load is a password-reset redirect, independent of which
  // auth-state-change event name the client ends up firing (that varies
  // by flow type / library version, so it isn't trustworthy on its own).
  const RECOVERY_REDIRECT = /type=recovery/.test(window.location.hash || "") || /type=recovery/.test(window.location.search || "");
  let recoveryHandled = false;

  const PHOTOS = [
    { title: "Tree and street setting", desc: "Include the tree, bed, sidewalk, and nearby building." },
    { title: "Whole tree", desc: "Photograph the trunk through as much of the canopy as possible." },
    { title: "Complete tree bed", desc: "Show the soil, plants, guard, and full edge of the bed." },
    { title: "Bark", desc: "Take one close, well-lit identifying view." },
    { title: "Leaves", desc: "Photograph attached leaves when safely reachable." },
    { title: "Care and living details", desc: "Capture flowers, mulch, litter, damage, wildlife, or anything distinctive." }
  ];
  // The one account with founder-level permissions server-side (auto-verified
  // trees, delete-any-tree). This client-side constant is only used to drive
  // UI — the actual protection is enforced by Supabase RLS policies keyed off
  // auth.email(), which this cannot spoof.
  const FOUNDER_EMAIL = "gsustaeta@gmail.com";
  const DB_NAME = "treewalk-cloud-v03";
  const STORE = "pendingTrees";
  const config = window.TREEWALK_CLOUD;
  const client = config && window.supabase ? window.supabase.createClient(config.url, config.publishableKey) : null;
  let session = null;
  let photos = Array(6).fill(null);
  let editingId = null;
  let contextTree = null;
  let requiredPhotos = 6;
  let challengeCallback = null;

  document.body.insertAdjacentHTML("beforeend", `
    <section class="capture-flow" id="captureFlow" hidden aria-label="TreeWalk NYC field record">
      <button class="cf-close" id="cfClose" aria-label="Close">×</button>
      <div class="cf-tabs">
        <button class="cf-tab active" data-cf-tab="capture">Capture</button>
        <button class="cf-tab" data-cf-tab="records">My trees</button>
        <button class="cf-tab" data-cf-tab="account">Account</button>
      </div>
      <p class="cf-status" id="cfStatus">Checking cloud connection…</p>
      <div data-cf-view="capture">
        <p class="cf-eyebrow" id="cfEyebrow">TREEWALK NYC FIELD RECORD</p>
        <h1 class="cf-title" id="cfTitle">Document this tree</h1>
        <div class="cf-progress"><i id="cfProgressBar"></i></div>
        <p class="cf-progress-label"><span id="cfProgressCount">0</span> of <span id="cfProgressTotal">6</span> photo<span id="cfProgressPlural">s</span></p>
        <div id="cfRows"></div>
        <div class="cf-fields">
          <label class="cf-field"><span>Species, if known</span><input id="cfSpecies" placeholder="Leave blank if unknown"></label>
          <label class="cf-field"><span>Address or location note</span><input id="cfAddress" placeholder="Example: across from 120 Grand Street"></label>
          <label class="cf-field"><span>Observations</span><textarea id="cfNotes" placeholder="What did you notice?"></textarea></label>
        </div>
        <div class="cf-actions">
          <button class="secondary" id="cfSaveLater">Save for later</button>
          <button class="primary" id="cfComplete" disabled>Complete all 6 photos</button>
        </div>
        <p class="prototype-note">TreeWalk records GPS only when you save. If offline, everything stays on this device until it can sync. Photos are saved locally first.</p>
      </div>
      <div data-cf-view="records" hidden><div id="cfRecords"></div></div>
      <div data-cf-view="account" hidden>
        <div id="cfSignedOut">
          <label class="cf-field"><span>Email</span><input id="cfEmail" type="email" autocomplete="email"></label>
          <label class="cf-field"><span>Password</span><input id="cfPassword" type="password" minlength="6" autocomplete="current-password"></label>
          <div class="cf-actions"><button class="primary" id="cfSignIn">Sign in</button><button class="secondary" id="cfSignUp">Create account</button></div>
          <button type="button" class="text-button" id="cfForgotPassword">Forgot password?</button>
          <p class="prototype-note">Email confirmation is enabled. After creating an account, check your email before signing in.</p>
        </div>
        <div id="cfResetPassword" hidden>
          <p class="prototype-note">Enter a new password. This finishes resetting your account.</p>
          <label class="cf-field"><span>New password</span><input id="cfNewPassword" type="password" minlength="6" autocomplete="new-password"></label>
          <div class="cf-actions"><button class="primary" id="cfSetNewPassword">Set new password</button></div>
        </div>
        <div id="cfSignedIn" hidden>
          <p id="cfIdentity"></p>
          <label class="cf-field"><span>How should your name show up when you get involved with a tree bed?</span>
            <input id="cfDisplayName" placeholder="e.g. Maya">
          </label>
          <div class="sponsor-type-row" id="cfDisplayModeRow">
            <button type="button" class="sponsor-type-btn" data-mode="first_name">Maya</button>
            <button type="button" class="sponsor-type-btn" data-mode="first_last_initial">Maya R.</button>
            <button type="button" class="sponsor-type-btn" data-mode="handle">Custom handle</button>
            <button type="button" class="sponsor-type-btn" data-mode="private">Don't show my name</button>
          </div>
          <button class="secondary" id="cfSaveProfile">Save name preference</button>
          <p id="cfCaptainStatus" class="prototype-note"></p>
          <button class="secondary" id="cfSignOut">Sign out</button>
        </div>
      </div>
    </section>
    <section class="photo-viewer" id="photoViewer" hidden aria-hidden="true" aria-label="Tree photos">
      <button class="pv-close" id="pvClose" aria-label="Close photos">×</button>
      <div class="pv-grid" id="pvGrid"></div>
    </section>`);

  const $ = id => document.getElementById(id);
  const sheet = $("captureFlow");
  const setStatus = (text, error = false) => { $("cfStatus").textContent = text; $("cfStatus").classList.toggle("error", error); };

  let activeRows = PHOTOS;
  function renderRows(list) {
    activeRows = list;
    $("cfRows").innerHTML = list.map((p, i) => `
      <div class="cf-row" id="cfRow${i}">
        <div class="cf-num" id="cfNum${i}">${i + 1}</div>
        <div class="cf-row-body"><b>${p.title}</b><span>${p.desc}</span></div>
        <label class="cf-take">Add photo<input type="file" accept="image/*" data-photo="${i}" hidden></label>
      </div>`).join("");
  }
  renderRows(PHOTOS);

  // Phone cameras hand over 2-6MB originals. Uncompressed, that's 20-35MB
  // for one tree's six required photos — slow to upload, and slow enough to
  // view later (especially the first load, over cell data) that it can look
  // like the photo viewer is just broken. Resizing to a sane max dimension
  // before it ever touches IndexedDB fixes both, permanently, for every
  // photo documented from here on. Falls back to the original file if
  // compression fails for any reason (some HEIC edge cases, older browsers)
  // rather than blocking the capture.
  async function compressPhoto(file, maxDim = 1600, quality = 0.82) {
    try {
      const bitmap = await createImageBitmap(file);
      const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
      const w = Math.round(bitmap.width * scale), h = Math.round(bitmap.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
      return blob && blob.size < file.size ? blob : file;
    } catch (error) {
      return file;
    }
  }

  $("cfRows").addEventListener("change", async event => {
    const input = event.target.closest("[data-photo]");
    if (!input || !input.files[0]) return;
    const i = +input.dataset.photo;
    photos[i] = await compressPhoto(input.files[0]);
    $(`cfRow${i}`).classList.add("done");
    $(`cfNum${i}`).innerHTML = `<img alt="${activeRows[i].title}">`;
    $(`cfNum${i}`).querySelector("img").src = URL.createObjectURL(photos[i]);
    updateProgress();
  });

  function updateProgress() {
    const done = photos.filter(Boolean).length;
    $("cfProgressBar").style.width = `${(done / requiredPhotos) * 100}%`;
    $("cfProgressCount").textContent = done;
    $("cfProgressTotal").textContent = requiredPhotos;
    $("cfProgressPlural").textContent = requiredPhotos === 1 ? "" : "s";
    $("cfComplete").disabled = done < requiredPhotos;
    $("cfComplete").textContent = requiredPhotos === 1 ? "Verify with this photo" : `Complete all ${requiredPhotos} photos`;
  }

  $("welcome-account-button")?.addEventListener("click", () => { open(null); showTab("account"); refreshAll(); });
  $("topbar-account-button")?.addEventListener("click", () => { open(null); showTab("account"); refreshAll(); });
  $("add-tree-button")?.addEventListener("click", () => { if (window.addMissingTree) window.addMissingTree(); else { open(null); refreshAll(); } });
  $("document-tree-button")?.addEventListener("click", () => { open(typeof state !== "undefined" ? state.selected : null); refreshAll(); });
  $("cfClose").addEventListener("click", close);
  document.querySelectorAll("[data-cf-tab]").forEach(button => button.addEventListener("click", () => showTab(button.dataset.cfTab)));
  $("cfComplete").addEventListener("click", saveCapture);
  $("cfSaveLater").addEventListener("click", saveCapture);
  $("cfSignIn").addEventListener("click", () => authenticate("signin"));
  $("cfSignUp").addEventListener("click", () => authenticate("signup"));
  $("cfForgotPassword").addEventListener("click", requestPasswordReset);
  $("cfSetNewPassword").addEventListener("click", setNewPassword);
  $("cfSignOut").addEventListener("click", async () => { await client.auth.signOut(); });
  window.addEventListener("online", () => syncPending());
  $("pvClose").addEventListener("click", closePhotoViewer);
  // Deliberately no tap-outside-to-close: while photos are still loading
  // (they can be several MB each, especially anything documented before
  // compressPhoto() existed) the modal is mostly empty dark space, and a
  // stray tap there while waiting was closing the whole thing — reading as
  // "my photos are gone" when they were just still loading. The × is the
  // only way out now.
  // Delegated so newly-rendered rows (loadRecords() rewrites #cfRecords on
  // every refresh) don't need their own listeners re-attached each time.
  $("cfRecords").addEventListener("click", e => {
    const viewBtn = e.target.closest("[data-view-photos]");
    if (viewBtn) { openPhotoViewer(viewBtn.dataset.viewPhotos); return; }
    const redoBtn = e.target.closest("[data-redocument]");
    if (redoBtn) { redocumentRecord(redoBtn.dataset.redocument); return; }
    const hideBtn = e.target.closest("[data-hide-record]");
    if (hideBtn) { hideRecordFromList(hideBtn.dataset.hideRecord, hideBtn.dataset.recordLabel); return; }
    if (e.target.closest("#cfAddTreeFromList")) { open(null); return; }
  });

  function open(tree, opts = null) {
    // open() always means "show the capture form" — without this, opening
    // it while the My Trees tab was last active (e.g. from "+ Document a
    // new tree" or "Add more photos") would leave the records list on
    // screen instead of the camera form underneath it. Callers that want a
    // different tab (Account, records) switch again right after this.
    showTab("capture");
    contextTree = tree || null;
    editingId = (opts && opts.editingId) || null;
    requiredPhotos = (opts && opts.requiredPhotos) || 6;
    challengeCallback = (opts && opts.onComplete) || null;
    photos = Array(requiredPhotos).fill(null);
    renderRows((opts && opts.rows) || PHOTOS);
    if (opts && opts.challengeLabel) {
      $("cfEyebrow").textContent = "VERIFY TODAY'S FIND";
      $("cfTitle").textContent = opts.challengeLabel;
    } else if (editingId) {
      $("cfEyebrow").textContent = "ADDING TO A TREE YOU'VE ALREADY DOCUMENTED";
      $("cfTitle").textContent = `Add more photos to this ${(contextTree && contextTree.speciesCommon) || "tree"}`;
    } else if (contextTree) {
      $("cfEyebrow").textContent = "DOCUMENTING A MAPPED TREE";
      $("cfTitle").textContent = `Document this ${contextTree.speciesCommon || "tree"}`;
    } else {
      $("cfEyebrow").textContent = "TREEWALK NYC FIELD RECORD";
      $("cfTitle").textContent = "Document this tree";
    }
    $("cfSpecies").value = contextTree ? (contextTree.speciesCommon || "") : "";
    $("cfAddress").value = contextTree ? (contextTree.address || "") : "";
    $("cfSaveLater").hidden = requiredPhotos === 1;
    updateProgress();
    sheet.hidden = false; requestAnimationFrame(() => sheet.classList.add("open"));
  }
  function close() { sheet.classList.remove("open"); setTimeout(() => { sheet.hidden = true; }, 280); }

  // Entry point for the Field Notebook's "Save my logbook" CTA — no-account
  // play never calls this, so it never touches Supabase at all.
  window.openAccountTab = () => { open(null); showTab("account"); };

  // Entry point for the daily-challenge "Found it! ✓" button. A found-it tap
  // no longer completes the challenge by itself — it opens a one-photo
  // verification capture. The challenge only actually completes (seeds
  // awarded, cooldown marked) once that photo is saved with a real
  // location, in onComplete. This is the verification step: documentation,
  // not a tap, is what proves an observation happened.
  window.openChallengeCapture = (tree, { label, onComplete } = {}) => {
    open(tree || null, {
      requiredPhotos: 1,
      rows: [{ title: label || "Photo evidence", desc: "This photo verifies your find and geotags it to this spot." }],
      challengeLabel: `Verify: ${label || "today's find"}`,
      onComplete
    });
  };

  init();

  async function init() {
    if (!client) { setStatus("Cloud configuration is unavailable.", true); return; }
    // Registered before the initial getSession() call below so a
    // PASSWORD_RECOVERY event fired from a reset-email link (processed by
    // the Supabase client as soon as it's created) is never missed.
    client.auth.onAuthStateChange((event, newSession) => {
      session = newSession;
      if (!recoveryHandled && (event === "PASSWORD_RECOVERY" || (RECOVERY_REDIRECT && session))) { enterRecoveryMode(); return; }
      renderAuth();
      if (session) { syncPending(); migrateLocalObservations(); migrateLocalTrees(); loadProfile(); refreshSharedTrees(); } else { window.TREEWALK_PROFILE = null; }
    });
    const { data } = await client.auth.getSession();
    session = data.session;
    // Guards against a race with the listener above: if the recovery event
    // already put us into the reset-password view, this later getSession()
    // resolution must NOT call the normal renderAuth() path, which would
    // hide that view again and silently drop the user back on signed-in
    // (or signed-out) UI without ever letting them set a new password.
    if (!recoveryHandled && RECOVERY_REDIRECT && session) { enterRecoveryMode(); return; }
    if (recoveryHandled) return;
    renderAuth();
    if (session) loadProfile();
    if (session) { syncPending(); migrateLocalObservations(); migrateLocalTrees(); refreshSharedTrees(); } else setStatus("Photos can be saved offline. Sign in to sync them across devices.");
  }

  // Forces past the welcome/mode-picker overlay (which otherwise sits on
  // top of everything until the person taps into the map) and opens
  // straight to the "set new password" screen, so clicking the emailed
  // reset link always lands somewhere useful instead of the plain landing
  // page.
  function enterRecoveryMode() {
    recoveryHandled = true;
    if (typeof window.start === "function") window.start(false);
    else { $("welcome")?.classList.add("hidden"); document.body.classList.remove("onboarding"); }
    open(null);
    showTab("account");
    showPasswordReset();
  }

  // Forgot-password flow. Supabase emails a link back to SITE_URL with a
  // recovery token in the URL hash; the client auto-detects it and fires
  // PASSWORD_RECOVERY above, which swaps in the "set new password" view.
  const SITE_URL = "https://superb-starship-196cd2.netlify.app/";
  async function requestPasswordReset() {
    if (!client) return;
    const email = $("cfEmail").value.trim();
    if (!email) { setStatus("Enter your email above, then tap Forgot password.", true); return; }
    setStatus("Sending a password reset email…");
    const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: SITE_URL });
    if (error) setStatus(error.message, true);
    else setStatus("Check your email for a reset link, then come back and open Account.");
  }
  function showPasswordReset() {
    $("cfSignedOut").hidden = true;
    $("cfSignedIn").hidden = true;
    $("cfResetPassword").hidden = false;
    setStatus("Enter a new password to finish resetting your account.");
  }
  async function setNewPassword() {
    if (!client) return;
    const password = $("cfNewPassword").value;
    if (password.length < 6) { setStatus("Password must be at least six characters.", true); return; }
    setStatus("Setting new password…");
    const { error } = await client.auth.updateUser({ password });
    if (error) { setStatus(error.message, true); return; }
    $("cfNewPassword").value = "";
    $("cfResetPassword").hidden = true;
    setStatus("Password updated — you're signed in. Syncing saved trees…");
    renderAuth();
    syncPending(); migrateLocalObservations(); migrateLocalTrees(); loadProfile(); refreshSharedTrees();
    goToNotebookAfterSignIn();
  }

  // Force an immediate re-fetch of the shared community-tree layer (rather
  // than waiting for the next 200m walk-triggered reload) right after
  // signing in, so newly-unlocked shared trees show up without delay.
  function refreshSharedTrees() {
    if (typeof state === "undefined" || !state.user || typeof loadTrees !== "function") return;
    state.lastLoaded = null;
    loadTrees(state.user.lat, state.user.lng);
  }

  // Care Captain status and display-name preference. is_care_captain can
  // only ever be set by an admin (see 10-profiles-care-captain-migration.sql
  // — column-level UPDATE is revoked from the authenticated role), so this
  // read is the only thing the client can ever do with it.
  async function loadProfile() {
    if (!client || !session) return;
    const { data, error } = await client.from("profiles").select("display_name,display_mode,is_care_captain").eq("id", session.user.id).single();
    if (error || !data) return;
    window.TREEWALK_PROFILE = { displayName: data.display_name || "", displayMode: data.display_mode || "first_name", isCareCaptain: !!data.is_care_captain, isFounder: session.user.email === FOUNDER_EMAIL };
    if ($("cfDisplayName")) $("cfDisplayName").value = window.TREEWALK_PROFILE.displayName;
    selectedDisplayMode = window.TREEWALK_PROFILE.displayMode;
    setDisplayModeButton(window.TREEWALK_PROFILE.displayMode);
    if ($("cfSaveProfile")) { $("cfSaveProfile").disabled = false; $("cfSaveProfile").textContent = "Save name preference"; }
    if ($("cfCaptainStatus")) $("cfCaptainStatus").textContent = window.TREEWALK_PROFILE.isCareCaptain
      ? "✓ Verified Tree Care Captain — you can start funding campaigns on tree beds."
      : "Not yet a verified Tree Care Captain. Attend a stewardship event and the training to unlock starting funding campaigns.";
    window.dispatchEvent(new CustomEvent("treewalk-profile-loaded", { detail: window.TREEWALK_PROFILE }));
  }
  function setDisplayModeButton(mode) {
    const row = $("cfDisplayModeRow");
    if (!row) return;
    row.querySelectorAll("[data-mode]").forEach(b => b.classList.toggle("active", b.dataset.mode === mode));
  }
  let selectedDisplayMode = "first_name";
  $("cfDisplayModeRow")?.addEventListener("click", event => {
    const btn = event.target.closest("[data-mode]");
    if (!btn) return;
    selectedDisplayMode = btn.dataset.mode;
    setDisplayModeButton(selectedDisplayMode);
  });
  $("cfSaveProfile")?.addEventListener("click", async () => {
    if (!client || !session) return;
    const button = $("cfSaveProfile");
    if (button.disabled) return;
    button.disabled = true;
    button.textContent = "Saving…";
    const name = $("cfDisplayName").value.trim();
    const mode = selectedDisplayMode;
    const { error } = await client.from("profiles").update({ display_name: name, display_mode: mode }).eq("id", session.user.id);
    if (error) {
      setStatus(error.message, true);
      button.textContent = "Couldn't save — tap to retry";
      button.disabled = false;
      return;
    }
    window.TREEWALK_PROFILE = { ...(window.TREEWALK_PROFILE || {}), displayName: name, displayMode: mode };
    setStatus("Saved your name preference.");
    button.textContent = "Saved ✓";
    window.dispatchEvent(new CustomEvent("treewalk-profile-loaded", { detail: window.TREEWALK_PROFILE }));
    goToNotebookAfterSignIn();
  });

  // Push the device's local observation log (nytree-observations, written by
  // app.js's gamified challenge/notice-chip loop) up to Supabase once an
  // account exists. Idempotent via client_id, so re-running is always safe.
  const OBS_SYNCED_KEY = "nytree-observations-synced";
  function syncedObservationIds() { return new Set(JSON.parse(localStorage.getItem(OBS_SYNCED_KEY) || "[]")); }
  function markObservationsSynced(ids) {
    const set = syncedObservationIds();
    ids.forEach(id => set.add(id));
    localStorage.setItem(OBS_SYNCED_KEY, JSON.stringify([...set]));
  }
  function observationRow(o) {
    return {
      contributor_id: session.user.id,
      client_id: o.id,
      type: o.type,
      tree_source: o.treeSource || "none",
      tree_external_id: o.treeId || null,
      latitude: o.lat ?? null,
      longitude: o.lng ?? null,
      observed_at: new Date(o.timestamp).toISOString()
    };
  }
  async function migrateLocalObservations() {
    if (!client || !session) return;
    const local = JSON.parse(localStorage.getItem("nytree-observations") || "[]");
    const synced = syncedObservationIds();
    const pending = local.filter(o => !synced.has(o.id));
    if (!pending.length) return;
    const done = [];
    for (const o of pending) {
      const { error } = await client.from("observations").upsert(observationRow(o), { onConflict: "contributor_id,client_id" });
      if (!error) done.push(o.id);
    }
    if (done.length) markObservationsSynced(done);
  }
  async function pushObservation(record) {
    if (!client || !session) return;
    const { error } = await client.from("observations").upsert(observationRow(record), { onConflict: "contributor_id,client_id" });
    if (!error) markObservationsSynced([record.id]);
  }
  window.addEventListener("treewalk-observation", event => pushObservation(event.detail));

  // Community-planted trees. This is the shared "game board" layer: any
  // tree a signed-in user plants (via +Add a missing tree) or documents
  // gets upserted here, and the existing RLS policy already lets every
  // signed-in user read every row — so fetchSharedTrees() below is what
  // pulls other people's planted trees onto your own map. Idempotent via
  // client_id, so re-running (or migrating the same local tree twice) is
  // always safe.
  function treeRow(tree) {
    return {
      contributor_id: session.user.id,
      client_id: tree.id,
      latitude: tree.lat,
      longitude: tree.lng,
      species_common: tree.speciesCommon || null,
      address: tree.address || null,
      location_type: tree.locationType || "street",
      place_name: tree.placeName || null
    };
  }
  async function pushPlantedTree(tree) {
    if (!client || !session) return;
    // Selecting id + verification_status back tells the UI whether this tree
    // auto-verified (founder/Care Captain) or needs a second neighbor to
    // confirm it — that decision is made server-side by a DB trigger and
    // never trusted from the client.
    const { data, error } = await client.from("trees").upsert(treeRow(tree), { onConflict: "contributor_id,client_id" }).select("id,verification_status").single();
    if (error) { console.warn("Could not sync planted tree:", error.message); return; }
    if (data) window.dispatchEvent(new CustomEvent("treewalk-tree-verification-status", { detail: { id: tree.id, dbId: data.id, status: data.verification_status } }));
  }
  window.addEventListener("treewalk-tree-planted", event => pushPlantedTree(event.detail));

  // No contributor_id filter here on purpose — Supabase RLS decides what
  // actually gets deleted. The owner-scoped policy lets someone delete their
  // own tree; a separate founder-only policy additionally lets the founder
  // delete any tree. A request that matches neither simply deletes nothing.
  async function deletePlantedTree(id) {
    if (!client || !session) return;
    const { error } = await client.from("trees").delete().eq("client_id", id);
    if (error) console.warn("Could not delete tree from the shared record:", error.message);
  }
  window.addEventListener("treewalk-tree-removed", event => deletePlantedTree(event.detail.id));

  // Dual verification: any signed-in neighbor other than the original
  // contributor can confirm a pending tree's pin + photos. The DB enforces
  // "not your own tree" and "one confirmation per person" — this just
  // surfaces a friendly message for the two ways that can fail.
  async function submitTreeVerification(dbId) {
    if (!client || !session) return { error: "Sign in to confirm trees." };
    const { error } = await client.from("tree_verifications").insert({ tree_id: dbId, verifier_id: session.user.id });
    if (error) {
      if (error.code === "23505") return { error: "You've already confirmed this tree." };
      if (error.code === "42501" || /row-level security/i.test(error.message || "")) return { error: "You can't confirm a tree you added yourself." };
      return { error: error.message };
    }
    return { ok: true };
  }
  window.submitTreeVerification = submitTreeVerification;

  async function migrateLocalTrees() {
    if (!client || !session) return;
    const local = JSON.parse(localStorage.getItem("nytree-added") || "[]");
    for (const tree of local) await pushPlantedTree(tree);
  }

  // Pull other signed-in users' planted/documented trees near (lat,lng) so
  // they render on this device's map too. Own trees are excluded here —
  // those already come from the local nytree-added list via loadAddedTrees().
  async function fetchSharedTrees(lat, lng) {
    if (!client || !session || lat == null || lng == null) return [];
    const spanLat = 0.01, spanLng = 0.013; // roughly a ~1.1km box, matches the walk-reload radius
    const { data, error } = await client.from("trees")
      .select("id,client_id,contributor_id,latitude,longitude,species_common,address,location_type,place_name,verification_status")
      .neq("contributor_id", session.user.id)
      .gte("latitude", lat - spanLat).lte("latitude", lat + spanLat)
      .gte("longitude", lng - spanLng).lte("longitude", lng + spanLng)
      .limit(300);
    if (error || !data) return [];
    return data.map(row => ({
      id: row.client_id,
      dbId: row.id,
      lat: row.latitude, lng: row.longitude,
      speciesCommon: row.species_common || "", speciesScientific: "",
      address: row.address || "",
      source: "community", mine: false,
      city: typeof state !== "undefined" ? state.city : null,
      addedAt: 0,
      locationType: row.location_type || "street",
      placeName: row.place_name || "",
      verificationStatus: row.verification_status || "pending"
    }));
  }
  window.fetchSharedTrees = fetchSharedTrees;

  function showTab(name) {
    document.querySelectorAll("[data-cf-tab]").forEach(b => b.classList.toggle("active", b.dataset.cfTab === name));
    document.querySelectorAll("[data-cf-view]").forEach(v => v.hidden = v.dataset.cfView !== name);
    if (name === "records") loadRecords();
  }

  async function authenticate(mode) {
    if (!client) return;
    const email = $("cfEmail").value.trim(), password = $("cfPassword").value;
    if (!email || password.length < 6) { setStatus("Enter an email and a password of at least six characters.", true); return; }
    setStatus(mode === "signup" ? "Creating your account…" : "Signing in…");
    const result = mode === "signup" ? await client.auth.signUp({ email, password }) : await client.auth.signInWithPassword({ email, password });
    if (result.error) { setStatus(result.error.message, true); return; }
    if (mode === "signup") { setStatus("Account created. Check your email to confirm it."); return; }
    setStatus("Signed in. Syncing saved trees…");
    goToNotebookAfterSignIn();
  }

  // The payoff moment: after actually signing in (not just showing a
  // confirmation line), take the person straight to their Field Notebook —
  // that's where their synced trees, seed count, and now their name
  // actually show up. Used after sign-in, after finishing a password
  // reset, and after saving a name preference.
  function goToNotebookAfterSignIn() {
    close();
    setTimeout(() => { if (typeof window.openNotebook === "function") window.openNotebook(); }, 320);
  }

  function renderAuth() {
    $("cfSignedOut").hidden = !!session;
    $("cfSignedIn").hidden = !session;
    $("cfResetPassword").hidden = true;
    $("cfIdentity").textContent = session ? `Signed in as ${session.user.email}` : "";
    if (session) setStatus(navigator.onLine ? "Cloud connected. Saved trees will sync automatically." : "Offline. New work will wait safely on this device.");
  }

  async function saveCapture() {
    const takenCount = photos.filter(Boolean).length;
    if (takenCount === 0) { setStatus("Take at least one photo before saving.", true); return; }
    const isChallenge = requiredPhotos < 6;
    const onComplete = challengeCallback;
    setStatus("Saving photo safely on this device…");
    try {
      const hasContextCoords = contextTree && typeof contextTree.lat === "number" && typeof contextTree.lng === "number";
      const coords = hasContextCoords ? { coords: { latitude: contextTree.lat, longitude: contextTree.lng, accuracy: null } } : await getPosition();
      const linkNote = contextTree ? `Mapped tree reference: ${contextTree.id}` : "";
      const userNotes = $("cfNotes").value.trim();
      const recordClientId = editingId || crypto.randomUUID();
      // Photos are converted to ArrayBuffers before being handed to
      // IndexedDB, not stored as raw Blob objects. Safari/WebKit has a
      // long-standing bug where Blobs held in IndexedDB for more than a
      // day or two (exactly the "waiting for an account to work" scenario
      // that bit gero) can silently come back empty on read. Plain
      // ArrayBuffers don't go through that code path, so they survive.
      // Reconstituted into a real Blob only at upload time, in syncPending().
      //
      // Each photo's clientId is derived from the tree's own clientId +
      // slot, not a fresh random UUID, so re-documenting the same tree
      // (editingId set) upserts onto the same six tree_photos rows and
      // storage paths instead of piling up duplicate photo rows every
      // time someone adds more photos to a tree they already documented.
      const photoEntries = await Promise.all(photos.map(async (blob, i) => {
        if (!blob) return null;
        const buffer = await blob.arrayBuffer();
        return { clientId: `${recordClientId}-slot${i + 1}`, slot: i + 1, mimeType: blob.type || "image/jpeg", byteSize: blob.size, buffer };
      }));
      const record = {
        clientId: recordClientId,
        latitude: coords.coords.latitude, longitude: coords.coords.longitude, accuracy: coords.coords.accuracy,
        address: $("cfAddress").value.trim(), species: $("cfSpecies").value.trim(),
        notes: [userNotes, linkNote].filter(Boolean).join(" — "),
        capturedAt: new Date().toISOString(), status: "pending",
        photos: photoEntries.filter(Boolean)
      };
      await dbPut(record);
      if (contextTree && record.species) {
        window.dispatchEvent(new CustomEvent("treewalk-species-documented", { detail: { treeId: contextTree.id, species: record.species } }));
        if (contextTree.source === "community") pushPlantedTree({ ...contextTree, speciesCommon: record.species });
      }
      resetCapture();
      if (isChallenge) {
        setStatus("Documented and verified — added to the living forest record.", false);
        close();
        if (onComplete) onComplete(record);
        if (session && navigator.onLine) syncPending();
      } else {
        setStatus(takenCount < 6 ? "Saved for later — waiting on more photos." : "Saved on this device — waiting to sync.");
        if (session && navigator.onLine) await syncPending(); else showTab("records");
      }
    } catch (error) { setStatus(error.message || "The tree could not be saved.", true); }
  }

  function getPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error("Location is not available on this device."));
      navigator.geolocation.getCurrentPosition(resolve, () => reject(new Error("Allow location access so TreeWalk can place this tree.")), { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 });
    });
  }

  async function syncPending() {
    if (!session || !navigator.onLine) return;
    const records = await dbAll();
    const pending = records.filter(r => r.status !== "synced" && r.status !== "lost" && r.photos.length === 6);
    if (!pending.length) { loadRecords(); return; }
    setStatus(`Syncing ${pending.length} saved tree${pending.length === 1 ? "" : "s"}…`);
    for (const record of pending) {
      try {
        // Pre-flight check, before any network call: a record whose photos
        // are already empty (the Safari/WebKit IndexedDB Blob bug this app
        // used to be vulnerable to) can never sync successfully. Flagging it
        // as "lost" here — instead of the generic "error" status — means it
        // stops being retried on every syncPending() call, which used to
        // both waste a network round trip forever and stomp the "Syncing…"
        // status line with the same stale error on every attempt.
        const emptyPhoto = record.photos.find(p => {
          const size = p.blob ? p.blob.size : (p.buffer ? p.buffer.byteLength : 0);
          return !size;
        });
        if (emptyPhoto) {
          record.status = "lost";
          record.error = "Photos were lost before they could sync — re-document this tree to replace them.";
          await dbPut(record);
          continue;
        }
        const { data: tree, error: treeError } = await client.from("trees").upsert({
          contributor_id: session.user.id, client_id: record.clientId, latitude: record.latitude, longitude: record.longitude,
          address: record.address || null, species_common: record.species || null, notes: record.notes || null, captured_at: record.capturedAt
        }, { onConflict: "contributor_id,client_id" }).select("id").single();
        if (treeError) throw treeError;
        for (const photo of record.photos) {
          // photo.blob only exists on records saved before the ArrayBuffer
          // change below — kept as a fallback so anything already sitting
          // in a device's IndexedDB from an older build still syncs.
          const blob = photo.blob || new Blob([photo.buffer], { type: photo.mimeType });
          if (!blob || !blob.size) throw new Error("A saved photo has no content — it may have been lost before it could sync.");
          const ext = (photo.mimeType.split("/")[1] || "jpg").replace("jpeg", "jpg");
          const path = `${session.user.id}/${record.clientId}/${photo.slot}.${ext}`;
          const upload = await client.storage.from("tree-photos").upload(path, blob, { contentType: photo.mimeType, upsert: true });
          if (upload.error) throw upload.error;
          const meta = await client.from("tree_photos").upsert({
            tree_id: tree.id, owner_id: session.user.id, client_id: photo.clientId, slot: photo.slot,
            storage_path: path, mime_type: photo.mimeType, byte_size: photo.byteSize ?? blob.size, captured_at: record.capturedAt
          }, { onConflict: "owner_id,client_id" });
          if (meta.error) throw meta.error;
        }
        record.status = "synced"; record.syncedAt = new Date().toISOString(); record.cloudId = tree.id;
        await dbPut(record);
      } catch (error) {
        // One bad record (a stray mime type, a flaky upload) shouldn't block
        // every other pending tree behind it — keep going, and leave this
        // one flagged so it's retried next time syncPending() runs rather
        // than silently displayed as "Waiting to sync" forever.
        record.status = "error"; record.error = error.message; await dbPut(record);
        setStatus(`Couldn't sync a saved tree: ${error.message}`, true);
      }
    }
    await loadRecords();
    const all = await dbAll();
    const lostCount = all.filter(r => r.status === "lost").length;
    if (all.every(r => r.status === "synced" || r.status === "lost")) {
      setStatus(lostCount ? `Synced — ${lostCount} older photo set${lostCount === 1 ? "" : "s"} couldn't be recovered, re-document ${lostCount === 1 ? "it" : "them"} when you're near the tree.` : "Everything is synced to TreeWalk Cloud.");
    } else if (all.some(r => r.status === "error")) setStatus("Some saved trees couldn't sync yet — will retry automatically.", true);
  }

  async function loadRecords() {
    const local = await dbAll();
    let cloud = [];
    if (session && navigator.onLine) {
      const { data } = await client.from("trees").select("id,client_id,address,species_common,captured_at,created_at").eq("contributor_id", session.user.id).order("captured_at", { ascending: false });
      cloud = data || [];
    }
    const byClient = new Map(cloud.map(r => [r.client_id, { clientId: r.client_id, address: r.address, species: r.species_common, capturedAt: r.captured_at, status: "synced" }]));
    local.forEach(r => byClient.set(r.clientId, r));
    const hidden = hiddenRecordIds();
    const rows = [...byClient.values()].filter(r => !hidden.has(r.clientId)).sort((a, b) => String(b.capturedAt).localeCompare(String(a.capturedAt)));
    const addButton = `<button type="button" class="cf-add-tree" id="cfAddTreeFromList">+ Document a new tree</button>`;
    const list = rows.length ? rows.map(r => {
      const hasLocalPhotos = r.status !== "lost" && r.photos && r.photos.some(p => (p.blob && p.blob.size) || (p.buffer && p.buffer.byteLength));
      const canViewPhotos = r.status === "synced" || hasLocalPhotos;
      const pill = r.status === "synced" ? "✓ Synced"
        : r.status === "lost" ? "⚠ Photos lost — re-document to replace"
        : r.status === "error" ? `⚠ Couldn't sync yet${r.error ? ` (${escapeHtml(r.error)})` : ""}`
        : (r.photos && r.photos.length < 6 ? `${r.photos.length} of 6 photos` : "Waiting to sync");
      const label = escapeHtml(r.species || "Unidentified tree");
      return `
      <div class="cf-list-item">
        <strong>${label}</strong>
        <span>${escapeHtml(r.address || `${Number(r.latitude || 0).toFixed(5)}, ${Number(r.longitude || 0).toFixed(5)}`)}</span>
        <span class="pill">${pill}</span>
        <div class="cf-item-actions">
          ${canViewPhotos ? `<button type="button" class="cf-view-photos" data-view-photos="${escapeHtml(r.clientId)}">🖼 View photos</button>` : ""}
          <button type="button" class="cf-item-link" data-redocument="${escapeHtml(r.clientId)}">📷 Add more photos</button>
          <button type="button" class="cf-item-link cf-item-remove" data-hide-record="${escapeHtml(r.clientId)}" data-record-label="${label}">🗑 Remove from list</button>
        </div>
      </div>`;
    }).join("") : `<p class="cf-empty">No documented trees yet.</p>`;
    $("cfRecords").innerHTML = addButton + list;
  }

  // "Remove from list" only ever touches this device's own preference of
  // what to show here — it hides a client_id, it never deletes the trees /
  // tree_photos rows or the storage objects. The tree stays on the shared
  // map and in TreeWalk's records exactly as before.
  function hiddenRecordIds() {
    try { return new Set(JSON.parse(localStorage.getItem("treewalk-hidden-records") || "[]")); }
    catch (error) { return new Set(); }
  }
  function hideRecordFromList(clientId, label) {
    if (!confirm(`Remove "${label || "this tree"}" from your My Trees list?\n\nThis only removes it from your list here — the tree and its photos stay exactly as they are for everyone else.`)) return;
    const ids = hiddenRecordIds();
    ids.add(clientId);
    localStorage.setItem("treewalk-hidden-records", JSON.stringify([...ids]));
    loadRecords();
  }

  // Re-opens the capture flow scoped to a tree you've already documented —
  // editingId set means saveCapture() upserts onto the same trees row and
  // the same six tree_photos rows/storage paths (see the deterministic
  // photo clientId in saveCapture) instead of forking a duplicate tree bed,
  // which is exactly what happened to the old, now-"lost" Rodney St record.
  async function redocumentRecord(clientId) {
    const local = (await dbAll()).find(r => r.clientId === clientId);
    const tree = {
      id: clientId,
      speciesCommon: local && local.species,
      address: local && local.address,
      ...(local && typeof local.latitude === "number" ? { lat: local.latitude, lng: local.longitude } : {})
    };
    open(tree, { editingId: clientId });
  }

  // Photos live wherever they actually are: the local IndexedDB record
  // still holds them (nothing deletes it after a successful sync — the
  // record just flips to status "synced"), so on the device that took the
  // photos this is instant and needs no network call. Only falls back to
  // fetching signed URLs from storage for a record viewed on a different
  // device than the one that captured it.
  async function openPhotoViewer(clientId) {
    const modal = $("photoViewer"), grid = $("pvGrid");
    if (!modal || !grid) return;
    grid.innerHTML = `<p class="pv-status">Loading photos…</p>`;
    modal.hidden = false; modal.setAttribute("aria-hidden", "false");
    try {
      const local = (await dbAll()).find(r => r.clientId === clientId);
      let urls = [];
      if (local && local.photos && local.photos.length) {
        urls = local.photos.slice().sort((a, b) => (a.slot || 0) - (b.slot || 0)).map(p => {
          const blob = p.blob || (p.buffer ? new Blob([p.buffer], { type: p.mimeType }) : null);
          return blob && blob.size ? URL.createObjectURL(blob) : null;
        }).filter(Boolean);
      }
      if (!urls.length && session) {
        const { data: files } = await client.storage.from("tree-photos").list(`${session.user.id}/${clientId}`);
        if (files && files.length) {
          const paths = files.map(f => `${session.user.id}/${clientId}/${f.name}`);
          const { data: signed } = await client.storage.from("tree-photos").createSignedUrls(paths, 3600);
          urls = (signed || []).filter(s => s.signedUrl).map(s => s.signedUrl);
        }
      }
      if (!urls.length) {
        grid.innerHTML = `<p class="pv-status">No photos could be loaded for this tree.</p>`;
        return;
      }
      // Photos documented before compressPhoto() existed can still be
      // several MB each — decoding six of those isn't instant, and a blank
      // grid with no feedback is exactly what made this look broken before.
      // Show progress instead of nothing.
      const total = urls.length;
      let loaded = 0;
      grid.innerHTML = `<p class="pv-status" id="pvLoadStatus">Loading ${total} photo${total === 1 ? "" : "s"}…</p>` +
        urls.map(u => `<img src="${u}" alt="Documented tree photo">`).join("");
      grid.querySelectorAll("img").forEach(img => {
        const markDone = () => {
          loaded++;
          const status = document.getElementById("pvLoadStatus");
          if (!status) return;
          if (loaded >= total) status.remove();
          else status.textContent = `Loading photo ${loaded + 1} of ${total}…`;
        };
        img.addEventListener("load", markDone, { once: true });
        img.addEventListener("error", markDone, { once: true });
      });
    } catch (error) {
      grid.innerHTML = `<p class="pv-status">Couldn't load photos: ${escapeHtml(error.message || "unknown error")}</p>`;
    }
  }
  function closePhotoViewer() {
    const modal = $("photoViewer"), grid = $("pvGrid");
    if (!modal) return;
    modal.hidden = true; modal.setAttribute("aria-hidden", "true");
    if (grid) grid.innerHTML = "";
  }

  function resetCapture() {
    requiredPhotos = 6; challengeCallback = null;
    renderRows(PHOTOS);
    photos = Array(6).fill(null); editingId = null; contextTree = null;
    $("cfEyebrow").textContent = "TREEWALK NYC FIELD RECORD";
    $("cfTitle").textContent = "Document this tree";
    $("cfSpecies").value = ""; $("cfAddress").value = ""; $("cfNotes").value = "";
    $("cfSaveLater").hidden = false;
    updateProgress();
  }

  async function refreshAll() { renderAuth(); updateProgress(); }
  function escapeHtml(v) { return String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }

  function openDb() { return new Promise((resolve, reject) => { const request = indexedDB.open(DB_NAME, 1); request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: "clientId" }); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); }
  async function dbPut(value) { const db = await openDb(); return new Promise((resolve, reject) => { const tx = db.transaction(STORE, "readwrite"); tx.objectStore(STORE).put(value); tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => reject(tx.error); }); }
  async function dbAll() { const db = await openDb(); return new Promise((resolve, reject) => { const request = db.transaction(STORE).objectStore(STORE).getAll(); request.onsuccess = () => { db.close(); resolve(request.result || []); }; request.onerror = () => reject(request.error); }); }
})();