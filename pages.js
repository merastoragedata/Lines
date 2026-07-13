const { useEffect, useState, useMemo } = React;

function User({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: "inline", verticalAlign: "-2px" }}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function Phone({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: "inline", verticalAlign: "-2px" }}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

const KARJAT_SUBSTATION_KEYS = [
  "karjat", "lilo", "girawali", "lonikand2", "puneeast",
  "ahilyanagar", "belwandi", "bhigwan", "shirsuphal", "jeur",
];
const KARJAT_LINE_KEYS = [
  "karjat_lilo", "lilo_lonikand2", "lilo_girawali", "karjat_puneeast",
  "karjat_cutab", "cutab_belwandi", "cutab_ahilyanagar",
  "karjat_bhigwan", "karjat_shirsuphal", "karjat_jeur",
];

function Disclaimer() {
  return (
    <div className="disclaimer">
      Route paths are illustrative estimated alignments built from known line lengths and LILO points
      &mdash; <strong>not surveyed tower/GPS data.</strong> Points marked <span className="tag-approx">approx.</span> use
      a nearby town/taluka as a stand-in.
    </div>
  );
}

/* ---------------------------------- HOME ---------------------------------- */
function HomePage() {
  const [selected, setSelected] = useState(null);
  return (
    <div className="page">
      <PageHeader
        eyebrow="MSETCL · Ahmednagar District"
        title="400 kV Karjat — Full Network Map"
        subtitle="Satellite / hybrid / map layers · live weather · zoomable · downloadable"
      />
      <GridMap
        substationKeys={KARJAT_SUBSTATION_KEYS}
        lineKeys={KARJAT_LINE_KEYS}
        weatherEnabled={true}
        onSelect={(k) => setSelected(k)}
        height="75vh"
        downloadName="karjat-full-map"
      />
      <Disclaimer />
    </div>
  );
}

/* ---------------------------------- LMSD ---------------------------------- */
function LmsdPage() {
  const [selectedZone, setSelectedZone] = useState(null);

  const zoneInfo = useMemo(() => {
    if (!selectedZone) return null;
    const zone = LMSD_ZONES.find((z) => z.name === selectedZone);
    const matching = JURISDICTION_SEED.filter((j) => j.segments.some((s) => s.division === selectedZone));
    return { zone, matching };
  }, [selectedZone]);

  return (
    <div className="page">
      <PageHeader
        eyebrow="Page 2"
        title="LMSD Jurisdiction Map"
        subtitle="Km-wise markers on each line · click or hover a zone for its responsible office"
      />
      <div className="split-layout">
        <GridMap
          substationKeys={KARJAT_SUBSTATION_KEYS}
          lineKeys={KARJAT_LINE_KEYS}
          showZones={true}
          showKm={true}
          onSelect={(k, type) => type === "zone" && setSelectedZone(k)}
          height="70vh"
          downloadName="karjat-lmsd-map"
        />
        <aside className="side-panel">
          {!zoneInfo ? (
            <div className="empty-hint">Click or hover a shaded LMSD zone on the map to see its responsible office and officers here.</div>
          ) : (
            <div>
              <h3>{zoneInfo.zone.name}</h3>
              {zoneInfo.matching.map((line) => (
                <div key={line.line} className="jur-card">
                  <div className="jur-line-name">{line.line}</div>
                  {line.teams.flatMap((t) => t.members).map((m, i) => (
                    <div key={i} className="jur-officer">
                      <User size={13} /> {m.name} <span className="muted">· {m.post}</span>
                      <div className="jur-mobile"><Phone size={12} /> {m.mobile}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
      <Disclaimer />
    </div>
  );
}

/* ------------------------------ MAINTENANCE -------------------------------- */
function MaintenancePage() {
  const [lines, setLines] = useState(JURISDICTION_SEED);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.startsWith("PASTE_")) return;
    setLoading(true);
    fetch(`${APPS_SCRIPT_URL}?action=getData`)
      .then((r) => r.json())
      .then((d) => d.ok && setLines(d.lines))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <PageHeader eyebrow="Page 3" title="Line Maintenance Directory" subtitle={loading ? "Loading live data\u2026" : "Full contact details by line and division"} />
      <div className="table-stack">
        {lines.map((line) => (
          <div key={line.line} className="line-card">
            <div className="line-card-head">
              <div className="line-card-title">{line.line}</div>
              <div className="line-card-length">{line.length}</div>
            </div>
            <table className="mini-table">
              <thead><tr><th>Chainage</th><th>Division</th></tr></thead>
              <tbody>
                {line.segments.map((s, i) => (
                  <tr key={i}><td>{s.chainage}</td><td>{s.division}</td></tr>
                ))}
              </tbody>
            </table>
            <div className="officer-grid">
              {line.teams.flatMap((t) => t.members).map((m, i) => (
                <div className="officer-chip" key={i}>
                  <User size={14} /> <span>{m.name}</span> <span className="muted">{m.post}</span>
                  <a href={`tel:${m.mobile}`}><Phone size={12} /> {m.mobile}</a>
                </div>
              ))}
              {line.teams.length === 0 && <div className="muted">No officer assigned yet</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ COORDINATES -------------------------------- */
function CoordinatesPage() {
  const [filter, setFilter] = useState("all");
  const rows = Object.entries(SUBSTATIONS).filter(([k, s]) => !s.hidden && (filter === "all" || s.group === filter));
  return (
    <div className="page">
      <PageHeader eyebrow="Page 4" title="Substation Coordinates" subtitle="All substations referenced across this portal" />
      <div className="chip-row">
        {["all", "karjat", "state400", "state220"].map((f) => (
          <button key={f} className={filter === f ? "chip active" : "chip"} onClick={() => setFilter(f)}>
            {f === "all" ? "All" : f === "karjat" ? "Karjat network" : f === "state400" ? "Statewide 400kV" : "Statewide 220kV"}
          </button>
        ))}
      </div>
      <table className="full-table">
        <thead><tr><th>Substation</th><th>Voltage</th><th>Latitude</th><th>Longitude</th><th>Notes</th></tr></thead>
        <tbody>
          {rows.map(([key, s]) => (
            <tr key={key}>
              <td>{s.name}</td>
              <td>{s.kv === "planned" ? "Planned" : s.kv === "tee" ? "\u2014" : `${s.kv} kV`}</td>
              <td className="mono">{s.lat.toFixed(6)}</td>
              <td className="mono">{s.lon.toFixed(6)}</td>
              <td>{s.approx ? <span className="tag-approx">approx.</span> : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------- STATEWIDE --------------------------------- */
function StatewidePage() {
  return (
    <div className="page">
      <PageHeader
        eyebrow="Page 5 · Statewide"
        title="All Substations & Line Connections"
        subtitle="400 kV and 220 kV network reconstructed from your uploaded connectivity diagrams"
      />
      <GridMap
        substationKeys={null}
        lineKeys={null}
        weatherEnabled={false}
        height="78vh"
        center={[18.6, 75.4]}
        zoom={7}
        downloadName="statewide-network-map"
      />
      <Disclaimer />
    </div>
  );
}

/* -------------------------------- WEATHER ---------------------------------- */
const WEATHER_TABS = KARJAT_SUBSTATION_KEYS.filter((k) => SUBSTATIONS[k].kv !== "tee");

function WeatherPage() {
  const [active, setActive] = useState("karjat");
  const [data, setData] = useState({});

  useEffect(() => {
    const pts = WEATHER_TABS.map((k) => ({ key: k, lat: SUBSTATIONS[k].lat, lon: SUBSTATIONS[k].lon }));
    fetchWeatherBatch(pts).then(setData).catch(console.error);
  }, []);

  const current = data[active];
  const mood = current ? wmoInfo(current.current_weather.weathercode).mood : "cloudy";

  return (
    <div className={`page weather-page mood-${mood}`}>
      <div className="weather-bg-layer">
        {mood === "rain" || mood === "storm" ? <RainFX /> : null}
        {mood === "sunny" ? <SunFX /> : null}
        {mood === "cloudy" ? <CloudFX /> : null}
      </div>

      <div className="weather-content">
        <PageHeader eyebrow="Page 6" title="Weather Across the Grid" subtitle="Current, hourly and 16-day outlook per substation" light />

        <div className="weather-tabs">
          {WEATHER_TABS.map((k) => (
            <button key={k} className={active === k ? "wtab active" : "wtab"} onClick={() => setActive(k)}>
              {SUBSTATIONS[k].name.replace("400 kV ", "").replace("220 kV ", "").replace(" SS", "")}
            </button>
          ))}
        </div>

        {!current ? (
          <div className="empty-hint light">Loading forecast\u2026</div>
        ) : (
          <WeatherDetail substationKey={active} weather={current} />
        )}

        <h3 className="all-lines-heading">All substations &mdash; live conditions</h3>
        <GridMap
          substationKeys={KARJAT_SUBSTATION_KEYS}
          lineKeys={KARJAT_LINE_KEYS}
          weatherEnabled={true}
          height="55vh"
          downloadName="weather-network-map"
        />
      </div>
    </div>
  );
}

function WeatherDetail({ substationKey, weather }) {
  const info = wmoInfo(weather.current_weather.weathercode);
  const hourly = weather.hourly;
  const daily = weather.daily;
  const nowIdx = hourly.time.findIndex((t) => new Date(t) >= new Date());
  const next24 = Array.from({ length: 12 }).map((_, i) => nowIdx + i * 2).filter((i) => i < hourly.time.length);

  return (
    <div className="weather-detail">
      <div className="weather-now">
        <Icon name={info.icon} size={64} />
        <div>
          <div className="temp-now">{Math.round(weather.current_weather.temperature)}&deg;C</div>
          <div className="cond-now">{info.label}</div>
          <div className="loc-now">{SUBSTATIONS[substationKey].name}</div>
        </div>
      </div>

      <div className="hourly-strip">
        {next24.map((i) => (
          <div className="hour-chip" key={i}>
            <div className="hour-time">{new Date(hourly.time[i]).getHours()}:00</div>
            <Icon name={wmoInfo(hourly.weathercode[i]).icon} size={20} />
            <div className="hour-temp">{Math.round(hourly.temperature_2m[i])}&deg;</div>
            <div className="hour-pop">{hourly.precipitation_probability[i]}%</div>
          </div>
        ))}
      </div>

      <div className="daily-grid">
        {daily.time.map((t, i) => (
          <div className="day-chip" key={t}>
            <div className="day-name">{i === 0 ? "Today" : new Date(t).toLocaleDateString(undefined, { weekday: "short" })}</div>
            <Icon name={wmoInfo(daily.weathercode[i]).icon} size={22} />
            <div className="day-temp">{Math.round(daily.temperature_2m_max[i])}&deg; / {Math.round(daily.temperature_2m_min[i])}&deg;</div>
            <div className="day-pop">{daily.precipitation_probability_max[i]}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Icon({ name, size }) {
  const symbol = { sun: "\u2600\ufe0f", "cloud-sun": "\u26c5", cloud: "\u2601\ufe0f", "cloud-fog": "\ud83c\udf2b\ufe0f",
    "cloud-drizzle": "\ud83c\udf26\ufe0f", "cloud-rain": "\ud83c\udf27\ufe0f", "cloud-rain-wind": "\ud83c\udf28\ufe0f",
    "cloud-snow": "\ud83c\udf28\ufe0f", "cloud-lightning": "\u26c8\ufe0f" }[name] || "\u2601\ufe0f";
  return <span style={{ fontSize: size }}>{symbol}</span>;
}

function RainFX() {
  const drops = Array.from({ length: 60 });
  return (
    <div className="fx-rain">
      {drops.map((_, i) => (
        <span key={i} style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 2}s`, animationDuration: `${0.6 + Math.random() * 0.6}s` }} />
      ))}
    </div>
  );
}
function SunFX() { return <div className="fx-sun"><div className="sun-glow" /></div>; }
function CloudFX() {
  return (
    <div className="fx-cloud">
      <div className="cloud c1" /><div className="cloud c2" /><div className="cloud c3" />
    </div>
  );
}

/* --------------------------------- TEAMS ------------------------------------ */
function TeamsPage() {
  const [lines, setLines] = useState(JURISDICTION_SEED.map((l) => ({ ...l, teams: l.teams.map((t) => ({ ...t })) })));
  const [editingLine, setEditingLine] = useState(null);
  const [saving, setSaving] = useState(false);
  const liveEnabled = APPS_SCRIPT_URL && !APPS_SCRIPT_URL.startsWith("PASTE_");

  useEffect(() => {
    if (!liveEnabled) return;
    fetch(`${APPS_SCRIPT_URL}?action=getData`)
      .then((r) => r.json())
      .then((d) => d.ok && setLines(d.lines))
      .catch(() => {});
  }, []);

  function updateLine(lineName, updater) {
    setLines((prev) => prev.map((l) => (l.line === lineName ? updater(l) : l)));
  }

  function addTeam(lineName) {
    updateLine(lineName, (l) => {
      if (l.teams.length >= 5) return l;
      return { ...l, teams: [...l.teams, { teamName: `Team ${l.teams.length + 1}`, members: [{ name: "", post: "", mobile: "" }] }] };
    });
  }
  function removeTeam(lineName, idx) {
    updateLine(lineName, (l) => ({ ...l, teams: l.teams.filter((_, i) => i !== idx) }));
  }
  function addMember(lineName, teamIdx) {
    updateLine(lineName, (l) => ({
      ...l,
      teams: l.teams.map((t, i) => (i === teamIdx && t.members.length < 5 ? { ...t, members: [...t.members, { name: "", post: "", mobile: "" }] } : t)),
    }));
  }
  function removeMember(lineName, teamIdx, mIdx) {
    updateLine(lineName, (l) => ({
      ...l,
      teams: l.teams.map((t, i) => (i === teamIdx ? { ...t, members: t.members.filter((_, j) => j !== mIdx) } : t)),
    }));
  }
  function updateMember(lineName, teamIdx, mIdx, field, value) {
    updateLine(lineName, (l) => ({
      ...l,
      teams: l.teams.map((t, i) =>
        i === teamIdx ? { ...t, members: t.members.map((m, j) => (j === mIdx ? { ...m, [field]: value } : m)) } : t
      ),
    }));
  }

  async function save(line) {
    if (!liveEnabled) {
      alert("This is running in preview mode (no Apps Script URL configured in data.js), so changes stay local to your browser only.");
      setEditingLine(null);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({ action: "saveTeams", line: line.line, teams: line.teams }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setEditingLine(null);
    } catch (e) {
      alert("Could not save: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page">
      <PageHeader
        eyebrow="Page 7 · Google Sheet-backed"
        title="LMSD Team Management"
        subtitle={liveEnabled ? "Connected to your Google Sheet" : "Preview mode \u2014 add your Apps Script URL in data.js for live editing"}
      />
      <div className="table-stack">
        {lines.map((line) => {
          const editing = editingLine === line.line;
          return (
            <div key={line.line} className="line-card">
              <div className="line-card-head">
                <div className="line-card-title">{line.line}</div>
                {!editing ? (
                  <button className="edit-btn" onClick={() => setEditingLine(line.line)}>Edit</button>
                ) : (
                  <div className="edit-actions">
                    <button className="save-btn" disabled={saving} onClick={() => save(line)}>{saving ? "Saving\u2026" : "Save"}</button>
                    <button className="cancel-btn" onClick={() => setEditingLine(null)}>Cancel</button>
                  </div>
                )}
              </div>

              <div className="teams-grid">
                {line.teams.map((team, ti) => (
                  <div key={ti} className="team-card">
                    <div className="team-card-head">
                      <input
                        className="team-name-input"
                        value={team.teamName}
                        disabled={!editing}
                        onChange={(e) => updateLine(line.line, (l) => ({ ...l, teams: l.teams.map((t, i) => (i === ti ? { ...t, teamName: e.target.value } : t)) }))}
                      />
                      {editing && <button className="x-btn" onClick={() => removeTeam(line.line, ti)}>&times;</button>}
                    </div>
                    {team.members.map((m, mi) => (
                      <div className="member-row" key={mi}>
                        <input placeholder="Name" value={m.name} disabled={!editing} onChange={(e) => updateMember(line.line, ti, mi, "name", e.target.value)} />
                        <input placeholder="Post" value={m.post} disabled={!editing} onChange={(e) => updateMember(line.line, ti, mi, "post", e.target.value)} />
                        <input placeholder="Mobile" value={m.mobile} disabled={!editing} onChange={(e) => updateMember(line.line, ti, mi, "mobile", e.target.value)} />
                        {editing && team.members.length > 1 && <button className="x-btn" onClick={() => removeMember(line.line, ti, mi)}>&times;</button>}
                      </div>
                    ))}
                    {editing && team.members.length < 5 && (
                      <button className="add-link" onClick={() => addMember(line.line, ti)}>+ Add person (max 5)</button>
                    )}
                  </div>
                ))}
                {editing && line.teams.length < 5 && (
                  <button className="add-team-btn" onClick={() => addTeam(line.line)}>+ Add team (max 5)</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------- SHARED UI --------------------------------- */
function PageHeader({ eyebrow, title, subtitle, light }) {
  return (
    <header className={`page-header ${light ? "light" : ""}`}>
      <div className="eyebrow">{eyebrow}</div>
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </header>
  );
}
