/* ============================================================================
   GridMap — the reusable Leaflet map used on Home / LMSD / Statewide pages.
   Plain Leaflet (not react-leaflet) driven imperatively from a React
   useEffect, so it works with zero build step / CDN-only React.
============================================================================ */

const { useEffect, useRef, useState, useCallback } = React;

const KV_COLOR = { "400": "#ef4d8f", "765": "#ef4d8f", "220": "#42d6c8", tee: "#93a2b3", planned: "#ef4d8f" };

function offsetPath(path, meters) {
  // Offsets a lat/lon path perpendicular to its local direction by `meters`,
  // approximated in degrees. Good enough at the zoom levels this app uses.
  const out = [];
  for (let i = 0; i < path.length; i++) {
    const [lat, lon] = path[i];
    const prev = path[Math.max(0, i - 1)];
    const next = path[Math.min(path.length - 1, i + 1)];
    const dLat = next[0] - prev[0];
    const dLon = next[1] - prev[1];
    const len = Math.hypot(dLat, dLon) || 1;
    const perpLat = -dLon / len;
    const perpLon = dLat / len;
    const degPerMeter = meters / 111320;
    out.push([lat + perpLat * degPerMeter, lon + perpLon * degPerMeter]);
  }
  return out;
}

function interpolateAlong(path, frac) {
  // total length in "degrees" (fine for short local segments)
  const segLens = [];
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const d = Math.hypot(path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1]);
    segLens.push(d);
    total += d;
  }
  let target = total * frac;
  for (let i = 0; i < segLens.length; i++) {
    if (target <= segLens[i] || i === segLens.length - 1) {
      const t = segLens[i] ? target / segLens[i] : 0;
      const [lat1, lon1] = path[i];
      const [lat2, lon2] = path[i + 1];
      return [lat1 + (lat2 - lat1) * t, lon1 + (lon2 - lon1) * t];
    }
    target -= segLens[i];
  }
  return path[path.length - 1];
}

function GridMap({
  substationKeys = null,
  lineKeys = null,
  showZones = false,
  showKm = false,
  weatherEnabled = false,
  onSelect = () => {},
  height = "70vh",
  downloadName = "karjat-grid-map",
  center = [18.55, 74.9],
  zoom = 9,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const normalLayerRef = useRef(null);
  const satLayerRef = useRef(null);
  const overlayGroupRef = useRef(null);
  const [mode, setMode] = useState("normal"); // normal | satellite | hybrid
  const [hybridOpacity, setHybridOpacity] = useState(55);
  const [weatherData, setWeatherData] = useState({});
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const map = L.map(containerRef.current, { zoomControl: true }).setView(center, zoom);
    mapRef.current = map;

    normalLayerRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      crossOrigin: true,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    satLayerRef.current = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, crossOrigin: true, opacity: 0, attribution: "Tiles &copy; Esri" }
    ).addTo(map);

    overlayGroupRef.current = L.layerGroup().addTo(map);

    return () => map.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // layer mode switching
  useEffect(() => {
    if (!satLayerRef.current) return;
    if (mode === "normal") satLayerRef.current.setOpacity(0);
    else if (mode === "satellite") satLayerRef.current.setOpacity(1);
    else satLayerRef.current.setOpacity(hybridOpacity / 100);
  }, [mode, hybridOpacity]);

  // draw substations, lines, zones (re-run when filters change)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const group = overlayGroupRef.current;
    group.clearLayers();

    if (showZones) {
      LMSD_ZONES.forEach((zone) => {
        const poly = L.polygon(zone.poly, {
          color: zone.color,
          weight: 1.5,
          fillColor: zone.color,
          fillOpacity: 0.08,
          dashArray: "4 5",
        }).addTo(group);
        const matching = JURISDICTION_SEED.filter((j) =>
          j.segments.some((s) => s.division === zone.name)
        );
        const officerLines = matching
          .flatMap((j) => j.teams.flatMap((t) => t.members.map((m) => `${m.name} (${m.post}) · ${m.mobile}`)))
          .filter((v, i, a) => a.indexOf(v) === i);
        const html = `<div class="popup-card">
            <div class="popup-title">${zone.name}</div>
            <div class="popup-sub">${matching.map((m) => m.line).join("<br/>")}</div>
            <hr/>
            ${officerLines.map((o) => `<div class="popup-officer">${o}</div>`).join("")}
          </div>`;
        poly.bindTooltip(zone.name, { sticky: true });
        poly.bindPopup(html);
        poly.on("click", () => onSelect(zone.name, "zone"));
      });
    }

    const linesToShow = LINES.filter((l) => !lineKeys || lineKeys.includes(l.key)).filter(
      (l) => l.path && l.path.length > 1
    );

    linesToShow.forEach((line) => {
      const color = KV_COLOR[line.kv] || "#999";
      const dash = line.status === "planned" ? "6 8" : null;
      const paths = line.circuits >= 2 ? [offsetPath(line.path, 90), offsetPath(line.path, -90)] : [line.path];

      paths.forEach((p) => {
        L.polyline(p, {
          color,
          weight: line.kv === "220" ? 3 : 3.6,
          opacity: 0.92,
          dashArray: dash,
          lineCap: "round",
        })
          .addTo(group)
          .bindTooltip(`${line.from} \u2192 ${line.to} (${line.km || ""})`, { sticky: true });
      });

      if (showKm && line.path.length > 1) {
        [0.25, 0.5, 0.75].forEach((frac) => {
          const pt = interpolateAlong(line.path, frac);
          L.circleMarker(pt, { radius: 3, color: "#0c1117", weight: 1, fillColor: "#fff", fillOpacity: 1 })
            .addTo(group)
            .bindTooltip(line.km || "", { permanent: false });
        });
      }
    });

    const subsToShow = Object.entries(SUBSTATIONS).filter(
      ([key, s]) => !s.hidden && (!substationKeys || substationKeys.includes(key))
    );

    subsToShow.forEach(([key, s]) => {
      const color = KV_COLOR[s.kv] || "#ccc";
      const marker = L.circleMarker([s.lat, s.lon], {
        radius: key === "karjat" ? 9 : 6,
        color,
        weight: s.kv === "planned" ? 2.4 : 1.4,
        fillColor: s.kv === "planned" ? "transparent" : color,
        fillOpacity: s.kv === "planned" ? 0 : 0.9,
      }).addTo(group);

      const w = weatherData[key];
      const wInfo = w ? wmoInfo(w.current_weather.weathercode) : null;
      const html = `<div class="popup-card">
          <div class="popup-title">${s.name}${s.approx ? ' <span class="tag-approx">approx.</span>' : ""}</div>
          <div class="popup-sub">${s.lat.toFixed(4)}, ${s.lon.toFixed(4)} &middot; ${s.kv === "planned" ? "Planned" : s.kv + " kV"}</div>
          ${w ? `<div class="popup-weather">${wInfo.label}, ${Math.round(w.current_weather.temperature)}&deg;C</div>` : ""}
        </div>`;
      marker.bindPopup(html);
      marker.on("click", () => onSelect(key, "substation"));

      if (weatherEnabled && w) {
        const icon = L.divIcon({
          className: "weather-badge",
          html: `<div class="wbadge wbadge-${wInfo.mood}">${Math.round(w.current_weather.temperature)}&deg;</div>`,
          iconSize: [34, 20],
          iconAnchor: [17, 30],
        });
        L.marker([s.lat, s.lon], { icon }).addTo(group);
      }
    });
  }, [substationKeys, lineKeys, showZones, showKm, weatherEnabled, weatherData, onSelect]);

  // fetch weather batch when enabled
  useEffect(() => {
    if (!weatherEnabled) return;
    const keys = Object.entries(SUBSTATIONS)
      .filter(([k, s]) => !s.hidden && (!substationKeys || substationKeys.includes(k)))
      .map(([k, s]) => ({ key: k, lat: s.lat, lon: s.lon }));
    if (keys.length === 0) return;
    fetchWeatherBatch(keys)
      .then(setWeatherData)
      .catch((e) => console.error("weather fetch error", e));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weatherEnabled]);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const canvas = await html2canvas(containerRef.current, { useCORS: true, allowTaint: true });
      const imgData = canvas.toDataURL("image/png");
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${downloadName}.pdf`);
    } catch (e) {
      alert(
        "Could not export this view (some map tile providers block canvas export via CORS). " +
          "As a fallback, use your browser's Print \u2192 Save as PDF on this page."
      );
      console.error(e);
    } finally {
      setDownloading(false);
    }
  }, [downloadName]);

  return (
    <div className="gridmap-wrap" style={{ height }}>
      <div ref={containerRef} className="gridmap-canvas" />

      <div className="map-controls">
        <div className="layer-switch">
          {["normal", "hybrid", "satellite"].map((m) => (
            <button key={m} className={mode === m ? "active" : ""} onClick={() => setMode(m)}>
              {m === "normal" ? "Map" : m === "hybrid" ? "Hybrid" : "Satellite"}
            </button>
          ))}
        </div>
        {mode === "hybrid" && (
          <div className="opacity-slider">
            <span>Satellite opacity</span>
            <input
              type="range"
              min="0"
              max="100"
              value={hybridOpacity}
              onChange={(e) => setHybridOpacity(Number(e.target.value))}
            />
            <span>{hybridOpacity}%</span>
          </div>
        )}
      </div>

      <button className="download-btn" onClick={handleDownload} disabled={downloading}>
        {downloading ? "Preparing\u2026" : "\u2B07 Download view (PDF)"}
      </button>
    </div>
  );
}
