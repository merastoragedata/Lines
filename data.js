/* ============================================================================
   400 kV KARJAT PORTAL — shared data module
   Coordinates are sourced from Google Places lookups against the exact pins
   you supplied, plus a fixed set of publicly-searchable MSETCL/POWERGRID
   substations. Line PATHS are illustrative estimated alignments (built from
   known line lengths + LILO points), NOT surveyed tower/GPS data — flagged
   throughout the UI. Points marked approx:true are lower-confidence
   (nearest town/taluka used as a stand-in where an exact site pin wasn't
   found).
============================================================================ */

// ---- PASTE your deployed Google Apps Script Web App URL here ----
const APPS_SCRIPT_URL = "PASTE_YOUR_WEB_APP_URL_HERE";

const SUBSTATIONS = {
  // ---- Core 400kV Karjat network (confirmed exact pins) ----
  karjat:        { name: "400 kV Karjat SS",          lat: 18.448778, lon: 74.746306, kv: "400", group: "karjat" },
  lilo:          { name: "LILO / Tee point",           lat: 18.494797, lon: 74.758146, kv: "tee", group: "karjat" },
  girawali:      { name: "400 kV Girawali SS",         lat: 18.747447, lon: 76.457604, kv: "400", group: "karjat" },
  lonikand2:     { name: "400 kV Lonikand-II SS",      lat: 18.639778, lon: 74.040083, kv: "400", group: "karjat" },
  puneeast:      { name: "765/400 kV Pune East SS",    lat: 18.729387, lon: 75.020199, kv: "planned", group: "karjat" },
  ahilyanagar:   { name: "220 kV Ahilyanagar SS",      lat: 19.049833, lon: 74.700500, kv: "220", group: "karjat" },
  belwandi:      { name: "220 kV Bhose / Belwandi SS", lat: 18.685139, lon: 74.625750, kv: "220", group: "karjat" },
  bhigwan:       { name: "220 kV Bhigwan SS",          lat: 18.304861, lon: 74.758389, kv: "220", group: "karjat" },
  shirsuphal:    { name: "220 kV Shirsuphal SS",       lat: 18.320306, lon: 74.569750, kv: "220", group: "karjat" },
  jeur:          { name: "220 kV Jeur SS (I & II)",    lat: 18.262806, lon: 75.151167, kv: "220", group: "karjat" },
  cut_ab:        { name: "(internal) Ahilyanagar-Belwandi historic cut pt", lat: 18.8590, lon: 74.6600, kv: "tee", group: "karjat", hidden: true },

  // ---- Statewide 400kV grid (from uploaded connectivity diagram) ----
  kharghar:      { name: "400 kV Kharghar SS",  lat: 19.038129, lon: 73.062497, kv: "400", group: "state400" },
  kalwa:         { name: "400 kV Kalwa SS",     lat: 19.167205, lon: 72.994114, kv: "400", group: "state400" },
  punepg:        { name: "400 kV Pune PG SS",   lat: 18.794584, lon: 73.697426, kv: "400", group: "state400" },
  chakan:        { name: "400 kV Chakan SS",    lat: 18.740187, lon: 73.841062, kv: "400", group: "state400" },
  shikrapur:     { name: "765 kV Shikrapur PG SS", lat: 18.716774, lon: 74.173417, kv: "765", group: "state400" },
  lonikand1:     { name: "400 kV Lonikand-I SS", lat: 18.637000, lon: 74.038500, kv: "400", group: "state400" },
  jejuri:        { name: "400 kV Jejuri SS",    lat: 18.282896, lon: 74.138483, kv: "400", group: "state400" },
  karad:         { name: "400 kV Karad SS",     lat: 17.302972, lon: 74.140245, kv: "400", group: "state400" },
  kiv:           { name: "400 kV K-IV SS",      lat: 17.297316, lon: 74.139067, kv: "400", group: "state400" },
  kalamb:        { name: "400 kV Kalamb SS",    lat: 18.570000, lon: 76.130000, kv: "400", group: "state400", approx: true },
  chandrapur1:   { name: "400 kV Chandrapur-I SS",  lat: 19.986132, lon: 79.289196, kv: "400", group: "state400", approx: true },
  chandrapur2:   { name: "400 kV Chandrapur-II SS", lat: 19.990000, lon: 79.292000, kv: "400", group: "state400", approx: true },
  kumbhargaon:   { name: "400 kV Kumbhargaon SS",   lat: 19.916000, lon: 79.117000, kv: "400", group: "state400", approx: true },

  // ---- Statewide 220kV grid (from uploaded Karjat-220kV-bus diagram) ----
  phaltan:       { name: "220 kV Phaltan SS",       lat: 18.013506, lon: 74.332742, kv: "220", group: "state220" },
  lonand:        { name: "220 kV Lonand SS",        lat: 17.930000, lon: 74.150000, kv: "220", group: "state220", approx: true },
  bothe:         { name: "220 kV Bothe SS",         lat: 17.960000, lon: 74.400000, kv: "220", group: "state220", approx: true },
  jejuri1:       { name: "220 kV Jejuri-I SS",      lat: 18.279000, lon: 74.135000, kv: "220", group: "state220" },
  baramati:      { name: "220 kV Baramati SS",      lat: 18.151600, lon: 74.581500, kv: "220", group: "state220" },
  walchandnagar: { name: "220 kV Walchandnagar SS", lat: 18.026889, lon: 74.772115, kv: "220", group: "state220" },
  supamidc:      { name: "220 kV Supa MIDC SS",     lat: 18.953299, lon: 74.519556, kv: "220", group: "state220", approx: true },
  bblr:          { name: "400 kV BBLR SS",          lat: 18.990000, lon: 75.774000, kv: "400", group: "state220", approx: true },
  jeurkhandke:   { name: "220 kV Jeur Khandke SS",  lat: 18.720000, lon: 75.900000, kv: "220", group: "state220", approx: true },
  sonewadi:      { name: "220 kV Sonewadi SS",      lat: 19.049833, lon: 74.700500, kv: "220", group: "state220" }, // same site as Ahilyanagar
  patoda:        { name: "220 kV Patoda SS",        lat: 18.680000, lon: 75.830000, kv: "220", group: "state220", approx: true },
  karkambh:      { name: "220 kV Karkambh SS",      lat: 17.860000, lon: 75.150000, kv: "220", group: "state220", approx: true },
  paranda:       { name: "220 kV Paranda SS",       lat: 18.270000, lon: 75.450000, kv: "220", group: "state220", approx: true },
  barshi:        { name: "220 kV Barshi SS",        lat: 18.250275, lon: 75.701348, kv: "220", group: "state220" },
  osmanabad:     { name: "220 kV Osmanabad (Dharashiv) SS", lat: 18.136697, lon: 76.067609, kv: "220", group: "state220" },
  solapurs2:     { name: "220 kV Solapur S2 (Bale) SS", lat: 17.707137, lon: 75.878999, kv: "220", group: "state220" },
  lamboti:       { name: "400 kV Lamboti SS",       lat: 17.777494, lon: 75.735356, kv: "400", group: "state220" },
  tuljapur:      { name: "220 kV Tuljapur SS",      lat: 17.953054, lon: 76.026304, kv: "220", group: "state220" },
  tembhurni:     { name: "220 kV Tembhurni SS",     lat: 18.010000, lon: 75.100000, kv: "220", group: "state220", approx: true },
  malinagar:     { name: "220 kV Malinagar SS",     lat: 17.960000, lon: 75.400000, kv: "220", group: "state220", approx: true },
  bhalwani:      { name: "220 kV Bhalwani SS",      lat: 17.800000, lon: 75.500000, kv: "220", group: "state220", approx: true },
  pandharpur1:   { name: "220 kV Pandharpur-I SS",  lat: 17.654623, lon: 75.325002, kv: "220", group: "state220" },
  pandharpur2:   { name: "220 kV Pandharpur-II SS", lat: 17.657000, lon: 75.327000, kv: "220", group: "state220", approx: true },
};

/* Each line: circuits=2 means render as a double (parallel) line.
   status: "existing" (solid) | "planned" (dotted — per your rule: dotted = future work ONLY)
   path: ordered [lat,lon] waypoints (illustrative alignment, not survey data) */
const LINES = [
  // ---- Core Karjat 400kV ----
  { key: "karjat_lilo", from: "karjat", to: "lilo", kv: "400", circuits: 4, status: "existing", km: "~5.3 km shared corridor",
    path: [[18.448778,74.746306],[18.4708,74.7395],[18.494797,74.758146]] },
  { key: "lilo_lonikand2", from: "lilo", to: "lonikand2", kv: "400", circuits: 2, status: "existing", km: "77.4 km",
    path: [[18.494797,74.758146],[18.4996,74.4200],[18.5620,74.1900],[18.639778,74.040083]] },
  { key: "lilo_girawali", from: "lilo", to: "girawali", kv: "400", circuits: 2, status: "existing", km: "206.6 km",
    path: [[18.494797,74.758146],[18.4600,75.1200],[18.5700,75.6500],[18.6600,76.1200],[18.747447,76.457604]] },
  { key: "karjat_puneeast", from: "karjat", to: "puneeast", kv: "400", circuits: 2, status: "planned", km: "~50 km D/C",
    path: [[18.448778,74.746306],[18.5600,74.8300],[18.6500,74.9500],[18.729387,75.020199]] },

  // ---- Core Karjat 220kV ----
  // Ahilyanagar + Belwandi share a double-circuit corridor up to the historic cut point, then split
  { key: "karjat_cutab", from: "karjat", to: "cut_ab", kv: "220", circuits: 2, status: "existing", km: "shared corridor",
    path: [[18.448778,74.746306],[18.5600,74.7100],[18.7200,74.6850],[18.8590,74.6600]] },
  { key: "cutab_belwandi", from: "cut_ab", to: "belwandi", kv: "220", circuits: 1, status: "existing", km: "40.7 km (total from Karjat)",
    path: [[18.8590,74.6600],[18.685139,74.625750]] },
  { key: "cutab_ahilyanagar", from: "cut_ab", to: "ahilyanagar", kv: "220", circuits: 1, status: "existing", km: "79.6 km (total from Karjat)",
    path: [[18.8590,74.6600],[18.9600,74.6800],[19.049833,74.700500]] },
  { key: "karjat_bhigwan", from: "karjat", to: "bhigwan", kv: "220", circuits: 1, status: "existing", km: "19.84 km",
    path: [[18.448778,74.746306],[18.3750,74.7550],[18.304861,74.758389]] },
  { key: "karjat_shirsuphal", from: "karjat", to: "shirsuphal", kv: "220", circuits: 1, status: "existing", km: "19.84 km",
    path: [[18.448778,74.746306],[18.3800,74.6500],[18.320306,74.569750]] },
  { key: "karjat_jeur", from: "karjat", to: "jeur", kv: "220", circuits: 2, status: "existing", km: "50.69 km (Ckt I & II)",
    path: [[18.448778,74.746306],[18.3900,74.9200],[18.3200,75.0500],[18.262806,75.151167]] },

  // ---- Statewide 400kV backbone (illustrative direct alignments) ----
  { key: "kharghar_kalwa", from: "kharghar", to: "kalwa", kv: "400", circuits: 1, status: "existing", km: "", path: [] },
  { key: "kharghar_chakan", from: "kharghar", to: "chakan", kv: "400", circuits: 1, status: "existing", km: "", path: [] },
  { key: "chakan_punepg", from: "chakan", to: "punepg", kv: "400", circuits: 1, status: "existing", km: "", path: [] },
  { key: "chakan_lonikand1", from: "chakan", to: "lonikand1", kv: "400", circuits: 1, status: "existing", km: "", path: [] },
  { key: "shikrapur_lonikand1", from: "shikrapur", to: "lonikand1", kv: "765", circuits: 1, status: "existing", km: "", path: [] },
  { key: "lonikand1_lonikand2", from: "lonikand1", to: "lonikand2", kv: "400", circuits: 1, status: "existing", km: "", path: [] },
  { key: "punepg_kiv", from: "punepg", to: "kiv", kv: "400", circuits: 1, status: "existing", km: "", path: [] },
  { key: "kiv_karad", from: "kiv", to: "karad", kv: "400", circuits: 1, status: "existing", km: "", path: [] },
  { key: "punepg_jejuri", from: "punepg", to: "jejuri", kv: "400", circuits: 1, status: "existing", km: "", path: [] },
  { key: "lonikand2_kalamb", from: "lonikand2", to: "kalamb", kv: "400", circuits: 1, status: "existing", km: "", path: [] },
  { key: "kalamb_chandrapur1", from: "kalamb", to: "chandrapur1", kv: "400", circuits: 1, status: "existing", km: "", path: [] },
  { key: "chandrapur1_chandrapur2", from: "chandrapur1", to: "chandrapur2", kv: "400", circuits: 2, status: "existing", km: "", path: [] },
  { key: "chandrapur1_kumbhargaon", from: "chandrapur1", to: "kumbhargaon", kv: "400", circuits: 1, status: "existing", km: "", path: [] },
  { key: "lonikand2_puneeast_state", from: "lonikand2", to: "puneeast", kv: "765", circuits: 1, status: "planned", km: "", path: [] },

  // ---- Statewide 220kV (Karjat-bus wider network diagram) ----
  { key: "phaltan_lonand", from: "phaltan", to: "lonand", kv: "220", circuits: 1, status: "existing", km: "", path: [] },
  { key: "phaltan_bothe", from: "phaltan", to: "bothe", kv: "220", circuits: 1, status: "existing", km: "", path: [] },
  { key: "phaltan_jejuri1", from: "phaltan", to: "jejuri1", kv: "220", circuits: 1, status: "existing", km: "", path: [] },
  { key: "lonand_baramati", from: "lonand", to: "baramati", kv: "220", circuits: 1, status: "existing", km: "", path: [] },
  { key: "jejuri1_walchandnagar", from: "jejuri1", to: "walchandnagar", kv: "220", circuits: 1, status: "existing", km: "", path: [] },
  { key: "baramati_walchandnagar", from: "baramati", to: "walchandnagar", kv: "220", circuits: 1, status: "existing", km: "", path: [] },
  { key: "baramati_shirsuphal", from: "baramati", to: "shirsuphal", kv: "220", circuits: 1, status: "existing", km: "", path: [] },
  { key: "walchandnagar_bhigwan", from: "walchandnagar", to: "bhigwan", kv: "220", circuits: 1, status: "existing", km: "", path: [] },
  { key: "bhigwan_belwandi", from: "bhigwan", to: "belwandi", kv: "220", circuits: 1, status: "existing", km: "", path: [] },
  { key: "supamidc_karjat", from: "supamidc", to: "karjat", kv: "220", circuits: 1, status: "existing", km: "", path: [] },
  { key: "bblr_jeurkhandke", from: "bblr", to: "jeurkhandke", kv: "220", circuits: 1, status: "existing", km: "", path: [] },
  { key: "karjat_jeurkhandke", from: "karjat", to: "jeurkhandke", kv: "220", circuits: 1, status: "existing", km: "", path: [] },
  { key: "jeurkhandke_patoda", from: "jeurkhandke", to: "patoda", kv: "220", circuits: 1, status: "existing", km: "", path: [] },
  { key: "jeur_karkambh", from: "jeur", to: "karkambh", kv: "220", circuits: 1, status: "existing", km: "", path: [] },
  { key: "karkambh_paranda", from: "karkambh", to: "paranda", kv: "220", circuits: 1, status: "existing", km: "", path: [] },
  { key: "paranda_barshi", from: "paranda", to: "barshi", kv: "220", circuits: 1, status: "existing", km: "", path: [] },
  { key: "paranda_osmanabad", from: "paranda", to: "osmanabad", kv: "220", circuits: 1, status: "existing", km: "", path: [] },
  { key: "osmanabad_solapurs2", from: "osmanabad", to: "solapurs2", kv: "220", circuits: 1, status: "existing", km: "", path: [] },
  { key: "osmanabad_tuljapur", from: "osmanabad", to: "tuljapur", kv: "220", circuits: 1, status: "existing", km: "", path: [] },
  { key: "lamboti_tuljapur", from: "lamboti", to: "tuljapur", kv: "220", circuits: 1, status: "planned", km: "feed", path: [] },
  { key: "lamboti_karkambh", from: "lamboti", to: "karkambh", kv: "220", circuits: 1, status: "existing", km: "", path: [] },
  { key: "karkambh_tembhurni", from: "karkambh", to: "tembhurni", kv: "220", circuits: 1, status: "existing", km: "", path: [] },
  { key: "tembhurni_malinagar", from: "tembhurni", to: "malinagar", kv: "220", circuits: 1, status: "existing", km: "", path: [] },
  { key: "malinagar_bhalwani", from: "malinagar", to: "bhalwani", kv: "220", circuits: 1, status: "existing", km: "", path: [] },
  { key: "bhalwani_pandharpur1", from: "bhalwani", to: "pandharpur1", kv: "220", circuits: 1, status: "existing", km: "", path: [] },
  { key: "pandharpur1_pandharpur2", from: "pandharpur1", to: "pandharpur2", kv: "220", circuits: 2, status: "existing", km: "", path: [] },
];

/* Jurisdiction / maintenance data — mirrors code.gs SEED_LINES so the site
   can render the maintenance page even before the Sheet has loaded. */
const JURISDICTION_SEED = [
  { line: "400 kV Karjat - Girawali Ckt I & II", length: "214.6 km",
    segments: [
      { chainage: "0-37 km", division: "LMSD Lonikand" },
      { chainage: "37-87 km", division: "400 kV LMSD Lamboti" },
      { chainage: "87-214.6 km", division: "LMSD Girwali" },
    ],
    teams: [
      { teamName: "Team 1", members: [{ name: "Aishwarya Kirtane", post: "AEE", mobile: "9922364856" }] },
      { teamName: "Team 2", members: [{ name: "Shri Nadgire", post: "DyCT", mobile: "9850704944" }] },
      { teamName: "Team 3", members: [{ name: "Nagesh Saray", post: "AE", mobile: "8554994942" }] },
    ] },
  { line: "400 kV Karjat - Lonikand I & II", length: "85.4 km",
    segments: [{ chainage: "0-85.4 km", division: "LMSD Lonikand" }],
    teams: [{ teamName: "Team 1", members: [{ name: "Aishwarya Kirtane", post: "AEE", mobile: "9922364856" }] }] },
  { line: "400/765 kV Karjat - Pune East (planned)", length: "~50 km D/C",
    segments: [{ chainage: "0-50 km", division: "POWERGRID (to be assigned)" }], teams: [] },
  { line: "220 kV Ahilyanagar", length: "79.6 km",
    segments: [{ chainage: "0-79.6 km", division: "LMSD Kedgaon" }],
    teams: [{ teamName: "Team 1", members: [
      { name: "Kishor Katore", post: "AEE", mobile: "9762430884" },
      { name: "Kailash Patil", post: "DyEE", mobile: "7030831440" }] }] },
  { line: "220 kV Bhose / Belwandi", length: "40.7 km",
    segments: [{ chainage: "0-40.7 km", division: "LMSD Kedgaon" }],
    teams: [{ teamName: "Team 1", members: [
      { name: "Kishor Katore", post: "AEE", mobile: "9762430884" },
      { name: "Kailash Patil", post: "DyEE", mobile: "7030831440" }] }] },
  { line: "220 kV Bhigwan", length: "19.84 km",
    segments: [{ chainage: "0-19.84 km", division: "LMSD Baramati" }],
    teams: [{ teamName: "Team 1", members: [{ name: "Mali", post: "AEE", mobile: "7798430251" }] }] },
  { line: "220 kV Shirsuphal", length: "19.84 km",
    segments: [{ chainage: "0-19.84 km", division: "LMSD Baramati" }],
    teams: [{ teamName: "Team 1", members: [{ name: "Mali", post: "AEE", mobile: "7798430251" }] }] },
  { line: "220 kV Jeur-I", length: "50.69 km",
    segments: [{ chainage: "0-50.69 km", division: "LMSD Baramati" }],
    teams: [{ teamName: "Team 1", members: [{ name: "Mali", post: "AEE", mobile: "7798430251" }] }] },
  { line: "220 kV Jeur-II", length: "50.69 km",
    segments: [{ chainage: "0-50.69 km", division: "LMSD Baramati" }],
    teams: [{ teamName: "Team 1", members: [{ name: "Mali", post: "AEE", mobile: "7798430251" }] }] },
];

// Rough LMSD "zone" polygons for the map (illustrative extents, not legal boundaries)
const LMSD_ZONES = [
  { name: "LMSD Lonikand", color: "#42d6c8",
    poly: [[18.40,74.55],[18.63,74.55],[18.70,74.05],[18.40,74.00]] },
  { name: "400 kV LMSD Lamboti", color: "#f2a53c",
    poly: [[18.30,74.90],[18.70,74.90],[18.70,75.75],[18.30,75.75]] },
  { name: "LMSD Girwali", color: "#ef4d8f",
    poly: [[18.35,75.75],[18.95,75.75],[18.95,76.55],[18.35,76.55]] },
  { name: "LMSD Kedgaon", color: "#a78bfa",
    poly: [[18.60,74.50],[19.15,74.50],[19.15,74.90],[18.60,74.90]] },
  { name: "LMSD Baramati", color: "#4ade80",
    poly: [[18.10,74.45],[18.45,74.45],[18.45,75.25],[18.10,75.25]] },
];

if (typeof module !== "undefined") {
  module.exports = { SUBSTATIONS, LINES, JURISDICTION_SEED, LMSD_ZONES, APPS_SCRIPT_URL };
}
