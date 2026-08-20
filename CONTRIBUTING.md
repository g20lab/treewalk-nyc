# Contributing to TreeWalk NYC

Thanks for taking a look — this project is young, moves fast, and issues/PRs of any
size are welcome, from a typo fix to a new city adapter.

## Getting set up

No build step, no package manager, no framework — it's static HTML/CSS/JS. Clone the
repo and serve the folder over plain HTTP:

```
python3 -m http.server 8080
```

Then open `http://localhost:8080`. A couple of things to know going in:

- **Geolocation only works on `localhost` or HTTPS.** Browsers block it on a plain
  `http://` IP/hostname, so `localhost` is the one exception that lets you test the
  map locally. To test on a phone, deploy somewhere with HTTPS (Netlify, Vercel, GitHub
  Pages all work — this is a static site).
- **No backend is required to explore Community mode's map/discovery features** — they
  hit live public tree data directly. Accounts, cloud sync, and social features (care
  log, reactions, verification) need a [Supabase](https://supabase.com/) project — see
  the README's "Backend (optional)" section.
- Scripts load in a fixed order as classic `<script>` tags sharing one global scope
  (see the README's "Stack" section) — there's no module bundler, so a new file needs
  to be added to `index.html` in the right position, and any new global should avoid
  colliding with existing names in `app.js`/`cloud-sync.js`/`kidsLessons.js`.

## Reporting a bug

Open an issue with: what you expected, what happened instead, and which mode
(Community or Kids) and city you were in. A screenshot or the browser console's error
output helps a lot — there's no automated test suite yet, so most bugs get found by
someone actually clicking through the app.

## A good first PR

Look for anything in `app.js`/`kidsLessons.js` that reads like a known rough edge (the
README calls a couple of features "mid-build"), or open an issue first to ask what's
currently blocked/wanted — this avoids duplicate work on a codebase that's changing
often. Small, focused PRs are much easier to review than large ones on a project this
size.

### Adding a city

Copy the `cityAdapters.js` pattern rather than special-casing a new data source inside
`app.js`: an adapter is just a `fetchTrees(lat, lng)` function that returns the
normalized tree shape the rest of the app already expects (see the existing NYC and
Philadelphia adapters for the shape). Open an issue first if you're not sure a
candidate city's open data actually has the fields TreeWalk needs (species, lat/lng at
minimum).

### Adding/editing species content

Species content (leaf images, facts, tags) lives alongside `speciesDeepDive.js` and
`curriculum.js`. If you're adding real photography for a species' one-species deep
dive (see `kidsLessons.js`'s `LONDON_PLANETREE_DEEP_DIVE` for the current example),
please use openly-licensed images (CC BY / CC BY-SA / public domain) and include the
photographer credit and license in the same shape as the existing example — TreeWalk
doesn't want to ship anything it doesn't have clear rights to use.

## Code style

Match what's already there — this is a small, un-bundled codebase where consistency
matters more than any particular style guide. Vanilla JS, no semicolon wars, no new
dependencies without a good reason (this is a zero-build static site on purpose).

## License

By contributing, you agree your contribution is licensed under this repo's
[MIT license](LICENSE).
