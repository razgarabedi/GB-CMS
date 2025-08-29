// Open-Meteo provider: no API key required
// Docs: https://open-meteo.com/

const memoryCache = new Map(); // key -> { ts, data }
const TEN_MIN = 10 * 60 * 1000;

function cacheGet(key) {
  const e = memoryCache.get(key);
  if (e && Date.now() - e.ts < TEN_MIN) return e.data;
  return null;
}
function cachePut(key, data) {
  memoryCache.set(key, { ts: Date.now(), data });
}

function iconAndDescFromCode(code, isDay, lang) {
  // Rough mapping; descriptions in German (de)
  // Weather codes: https://open-meteo.com/en/docs#api_form
  const de = {
    0: 'Klar',
    1: 'Überwiegend klar',
    2: 'Teilweise bewölkt',
    3: 'Bewölkt',
    45: 'Nebel', 48: 'Reifiger Nebel',
    51: 'Leichter Nieselregen', 53: 'Nieselregen', 55: 'Starker Nieselregen',
    56: 'Leichter gefrierender Nieselregen', 57: 'Gefrierender Nieselregen',
    61: 'Leichter Regen', 63: 'Regen', 65: 'Starker Regen',
    66: 'Leichter gefrierender Regen', 67: 'Gefrierender Regen',
    71: 'Leichter Schneefall', 73: 'Schneefall', 75: 'Starker Schneefall',
    77: 'Schneekörner',
    80: 'Leichte Regenschauer', 81: 'Regenschauer', 82: 'Starke Regenschauer',
    85: 'Leichte Schneeschauer', 86: 'Starke Schneeschauer',
    95: 'Gewitter', 96: 'Gewitter mit leichtem Hagel', 99: 'Gewitter mit starkem Hagel',
  };
  const desc = (lang || '').startsWith('de') ? (de[code] || 'Unbekannt') : String(code);
  // Map to OpenWeather-like icon ids for reuse in frontend
  const base = isDay ? 'd' : 'n';
  let icon = '01' + base; // clear
  if (code === 0) icon = '01' + base;
  else if (code === 1) icon = '02' + base;
  else if (code === 2) icon = '03' + base;
  else if (code === 3) icon = '04' + base;
  else if ([45, 48].includes(code)) icon = '50' + base; // mist
  else if ([51, 53, 55, 56, 57].includes(code)) icon = '10' + base; // drizzle-like
  else if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) icon = '10' + base; // rain
  else if ([71, 73, 75, 77, 85, 86].includes(code)) icon = '13' + base; // snow
  else if ([95, 96, 99].includes(code)) icon = '11' + base; // thunder
  return { icon, description: desc };
}

async function geocode(name, language = 'de') {
  const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
  url.searchParams.set('name', name);
  url.searchParams.set('language', language);
  url.searchParams.set('count', '1');
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok || !data?.results?.length) {
    const err = new Error('location not found');
    err.status = 404;
    throw err;
  }
  const r = data.results[0];
  return { lat: r.latitude, lon: r.longitude, name: r.name };
}

async function fetchForecast(lat, lon, units = 'metric', lang = 'de') {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('current_weather', 'true');
  url.searchParams.set('daily', 'weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,relative_humidity_2m_max,relative_humidity_2m_min');
  url.searchParams.set('timezone', 'auto');
  url.searchParams.set('language', lang);
  // units: Open-Meteo uses metric by default; for imperial we could convert client-side
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    const err = new Error('open-meteo error');
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

async function getCurrent(location, units = 'metric', lang = 'de') {
  const key = `om:current:${location}:${units}:${lang}`;
  const c = cacheGet(key);
  if (c) return c;
  const { lat, lon } = await geocode(location, lang);
  const f = await fetchForecast(lat, lon, units, lang);
  const cw = f.current_weather;
  const { icon, description } = iconAndDescFromCode(cw.weathercode, cw.is_day === 1, lang);
  const payload = {
    main: { temp: Math.round(cw.temperature) },
    weather: [{ description, icon }],
    wind: { speedKmh: Math.round(cw.windspeed), direction: cw.winddirection },
  };
  cachePut(key, payload);
  return payload;
}

async function getDaily(location, units = 'metric', lang = 'de') {
  const key = `om:daily:${location}:${units}:${lang}`;
  const c = cacheGet(key);
  if (c) return c;
  const { lat, lon } = await geocode(location, lang);
  const f = await fetchForecast(lat, lon, units, lang);
  const days = [];
  for (let i = 0; i < Math.min(5, f.daily.time.length); i += 1) {
    const code = f.daily.weathercode[i];
    const isDay = true;
    const { icon, description } = iconAndDescFromCode(code, isDay, lang);
    const dt = Math.floor(new Date(f.daily.time[i]).getTime() / 1000);
    const rhMax = Array.isArray(f.daily.relative_humidity_2m_max) ? f.daily.relative_humidity_2m_max[i] : undefined;
    const rhMin = Array.isArray(f.daily.relative_humidity_2m_min) ? f.daily.relative_humidity_2m_min[i] : undefined;
    const humidity = typeof rhMax === 'number' && typeof rhMin === 'number'
      ? Math.round((rhMax + rhMin) / 2)
      : (typeof rhMax === 'number' ? Math.round(rhMax) : (typeof rhMin === 'number' ? Math.round(rhMin) : undefined));
    days.push({
      dt,
      temp: { day: f.daily.temperature_2m_max[i], night: f.daily.temperature_2m_min[i] },
      precipProbability: Array.isArray(f.daily.precipitation_probability_max) ? f.daily.precipitation_probability_max[i] : undefined,
      humidity,
      weather: [{ description, icon }],
    });
  }
  const payload = { daily: days };
  cachePut(key, payload);
  return payload;
}

module.exports = { getCurrent, getDaily };


