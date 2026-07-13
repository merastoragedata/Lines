# 400 kV Karjat Grid Portal

A static, zero-build React site (React + Babel loaded via CDN, so there's no
`npm install` / build step — just push and enable GitHub Pages) covering:

1. **Home** — full-scale map, Map/Hybrid/Satellite layers (adjustable satellite
   opacity in Hybrid mode), live weather badges, PDF export of current view.
2. **LMSD Map** — same map with LMSD jurisdiction zones shaded, km markers
   along each line, click/hover a zone for its responsible office + officers.
3. **Maintenance** — full line-by-line contact directory.
4. **Coordinates** — every substation's lat/lon in one table.
5. **Statewide** — the wider 400kV/220kV network from your uploaded diagrams.
6. **Weather** — tab per substation, current + hourly + 16-day forecast,
   background/animation changes with conditions (sun/cloud/rain/storm), plus
   an all-substations map with live weather badges.
7. **LMSD Teams** — editable team roster (max 5 teams/line, 1–5 people/team),
   backed by a Google Sheet via Apps Script.

## Deploy to GitHub Pages

1. Create a new GitHub repo, push all these files to the root (or to `/docs`
   and point Pages at that folder).
2. Repo Settings → Pages → Source: deploy from branch, folder `/ (root)`.
3. Done — your site will be live at `https://<username>.github.io/<repo>/`.

No build tooling, no `package.json` needed — `index.html` loads React,
Babel (for in-browser JSX), and Leaflet straight from CDNs.

## Connect the Google Sheet (LMSD Teams page)

1. Open `code.gs` — follow the deployment steps written at the top of that
   file (create an Apps Script project, paste the code, Deploy → Web app).
2. Visit your deployed web app URL once with `?action=init` appended, to
   create and auto-populate the spreadsheet.
3. Open `data.js`, find this line near the top:
   ```js
   const APPS_SCRIPT_URL = "PASTE_YOUR_WEB_APP_URL_HERE";
   ```
   Replace the placeholder with your `.../exec` URL and commit.
4. The **LMSD Teams** page will now read/write live to your Sheet. Until you
   do this, that page runs in local preview mode (edits aren't persisted).

## Files

| File | Purpose |
|---|---|
| `index.html` | Entry point, CDN script tags, load order |
| `data.js` | All substation coordinates, line paths, jurisdiction seed data |
| `weather.js` | Open-Meteo fetch helper + weather-code → icon/mood mapping |
| `mapEngine.js` | The reusable Leaflet map component (layers, double circuits, zones, weather, PDF export) |
| `pages.js` | All 7 page components |
| `app.js` | Hash-router shell + nav |
| `styles.css` | Full dark theme + weather page animations |
| `code.gs` | Google Apps Script backend (Sheet-as-database) |

## Honest scope notes — please read before relying on this

- **Line paths are illustrative**, built from the line lengths, LILO points,
  and bearings you gave me — not surveyed tower/GPS coordinates. Several
  statewide-network substations (marked `approx: true` in `data.js`) use a
  nearby town/taluka center as a stand-in because I couldn't find an exact
  site pin — worth double-checking against MSETCL's own records before this
  goes anywhere official.
- **Satellite tiles** are Esri World Imagery (free, no API key) rather than
  Google's own satellite layer — visually very similar, but if you specifically
  need Google's tiles you'd need a Google Maps API key and a small swap in
  `mapEngine.js`.
- **PDF export** uses `html2canvas`, which can occasionally fail to capture
  map tiles if a tile provider's CORS headers are strict in a given browser —
  I've added `crossOrigin` flags to reduce this, and the UI falls back to
  suggesting your browser's Print → Save as PDF if the export throws.
- **Weather** is real, live data (Open-Meteo, no key required) — but the
  rain/sun/cloud page background is a CSS/animation approximation of mood,
  not a literal radar rendering.
- **"Google Earth-like"**: this uses Leaflet (2D, open-source, no key) with
  satellite/hybrid/map layers and full zoom — genuinely close to Google Maps'
  UX, but it isn't a tilting 3D globe. If true 3D is important, that would
  mean swapping in Cesium or Google's own 3D Maps JS API (needs a billed
  Google Cloud key), which I didn't want to assume you wanted without asking.
- The historic Ahilyanagar–Belwandi circuit cut is used only to shape the
  double-circuit corridor visually, per your instruction — it isn't labeled
  anywhere in the UI.
