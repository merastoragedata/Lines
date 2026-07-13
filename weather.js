/* ============================================================================
   Weather helper — uses Open-Meteo (free, no API key, CORS-enabled)
   https://open-meteo.com/en/docs
============================================================================ */

// WMO weather codes -> { label, icon, mood } used for theming/animation
const WMO = {
  0: { label: "Clear sky", mood: "sunny", icon: "sun" },
  1: { label: "Mainly clear", mood: "sunny", icon: "sun" },
  2: { label: "Partly cloudy", mood: "cloudy", icon: "cloud-sun" },
  3: { label: "Overcast", mood: "cloudy", icon: "cloud" },
  45: { label: "Fog", mood: "fog", icon: "cloud-fog" },
  48: { label: "Depositing rime fog", mood: "fog", icon: "cloud-fog" },
  51: { label: "Light drizzle", mood: "rain", icon: "cloud-drizzle" },
  53: { label: "Moderate drizzle", mood: "rain", icon: "cloud-drizzle" },
  55: { label: "Dense drizzle", mood: "rain", icon: "cloud-drizzle" },
  56: { label: "Light freezing drizzle", mood: "rain", icon: "cloud-drizzle" },
  57: { label: "Dense freezing drizzle", mood: "rain", icon: "cloud-drizzle" },
  61: { label: "Slight rain", mood: "rain", icon: "cloud-rain" },
  63: { label: "Moderate rain", mood: "rain", icon: "cloud-rain" },
  65: { label: "Heavy rain", mood: "storm", icon: "cloud-rain-wind" },
  66: { label: "Light freezing rain", mood: "rain", icon: "cloud-rain" },
  67: { label: "Heavy freezing rain", mood: "storm", icon: "cloud-rain-wind" },
  71: { label: "Slight snow", mood: "snow", icon: "cloud-snow" },
  73: { label: "Moderate snow", mood: "snow", icon: "cloud-snow" },
  75: { label: "Heavy snow", mood: "snow", icon: "cloud-snow" },
  77: { label: "Snow grains", mood: "snow", icon: "cloud-snow" },
  80: { label: "Slight rain showers", mood: "rain", icon: "cloud-rain" },
  81: { label: "Moderate rain showers", mood: "rain", icon: "cloud-rain" },
  82: { label: "Violent rain showers", mood: "storm", icon: "cloud-rain-wind" },
  85: { label: "Slight snow showers", mood: "snow", icon: "cloud-snow" },
  86: { label: "Heavy snow showers", mood: "snow", icon: "cloud-snow" },
  95: { label: "Thunderstorm", mood: "storm", icon: "cloud-lightning" },
  96: { label: "Thunderstorm, slight hail", mood: "storm", icon: "cloud-lightning" },
  99: { label: "Thunderstorm, heavy hail", mood: "storm", icon: "cloud-lightning" },
};

function wmoInfo(code) {
  return WMO[code] || { label: "Unknown", mood: "cloudy", icon: "cloud" };
}

/**
 * Fetch current + hourly (48h) + daily (up to 16 days) forecast for one
 * or more locations in a single request (Open-Meteo supports comma-joined
 * lat/lon lists).
 */
async function fetchWeatherBatch(points) {
  // points: [{key, lat, lon}]
  const lats = points.map((p) => p.lat).join(",");
  const lons = points.map((p) => p.lon).join(",");
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}` +
    `&current_weather=true` +
    `&hourly=temperature_2m,weathercode,precipitation_probability` +
    `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
    `&forecast_days=16&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather fetch failed: " + res.status);
  const json = await res.json();
  // Open-Meteo returns a single object if 1 location, or an array if multiple
  const arr = Array.isArray(json) ? json : [json];
  const out = {};
  points.forEach((p, i) => {
    out[p.key] = arr[i];
  });
  return out;
}

if (typeof module !== "undefined") {
  module.exports = { WMO, wmoInfo, fetchWeatherBatch };
}
