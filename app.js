const { useState, useEffect } = React;

const ROUTES = {
  "": { label: "Home Map", comp: HomePage },
  "lmsd": { label: "LMSD Map", comp: LmsdPage },
  "maintenance": { label: "Maintenance", comp: MaintenancePage },
  "coordinates": { label: "Coordinates", comp: CoordinatesPage },
  "statewide": { label: "Statewide", comp: StatewidePage },
  "weather": { label: "Weather", comp: WeatherPage },
  "teams": { label: "LMSD Teams", comp: TeamsPage },
};

function App() {
  const [route, setRoute] = useState(window.location.hash.replace("#/", "") || "");

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash.replace("#/", ""));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const Current = (ROUTES[route] || ROUTES[""]).comp;

  return (
    <div className="app-shell">
      <nav className="topnav">
        <div className="brand">
          <span className="brand-dot" />
          400 kV Karjat Portal
        </div>
        <div className="nav-links">
          {Object.entries(ROUTES).map(([path, r]) => (
            <a key={path} href={`#/${path}`} className={route === path ? "active" : ""}>
              {r.label}
            </a>
          ))}
        </div>
      </nav>
      <main>
        <Current />
      </main>
      <footer className="app-footer">
        Working reference portal built from field-supplied data {"\u2014"} not an official MSETCL/POWERGRID system.
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
