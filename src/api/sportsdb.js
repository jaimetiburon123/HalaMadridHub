// API layer: everything that talks to TheSportsDB lives here.
import { BASE_URL, REAL_MADRID_ID, LA_LIGA_ID, REQUEST_TIMEOUT } from '../config.js';
import { readCache, writeCache } from './cache.js';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

// fetch + response checks. Throws a readable error on timeouts, network failures,
// rate limiting, non-2xx responses and invalid JSON.
async function fetchJson(endpoint) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  let response;
  try {
    response = await fetch(`${BASE_URL}/${endpoint}`, { signal: controller.signal });
  } catch (error) {
    throw new Error(
      error.name === 'AbortError'
        ? 'TheSportsDB took too long to answer.'
        : 'Network error: could not reach TheSportsDB.'
    );
  } finally {
    clearTimeout(timer);
  }

  // The free key allows only a few requests per minute.
  if (response.status === 429) {
    throw new Error('TheSportsDB is limiting requests right now. Try again in a minute.');
  }
  if (!response.ok) {
    throw new Error(`TheSportsDB responded with status ${response.status}.`);
  }

  try {
    return await response.json();
  } catch {
    throw new Error('TheSportsDB returned data that is not valid JSON.');
  }
}

// Generic GET helper: fresh cache first, then the network. If the request fails but an
// expired copy exists, that copy is returned and onStale(savedAt) tells the UI it's old data.
async function request(endpoint, ttl, onStale) {
  const fresh = readCache(endpoint);
  if (fresh) return fresh.data;

  try {
    const data = await fetchJson(endpoint);
    // Only successful responses are cached, so errors are always retried.
    writeCache(endpoint, data, ttl);
    return data;
  } catch (error) {
    const stale = readCache(endpoint, { allowStale: true });
    if (!stale) throw error;
    onStale?.(stale.savedAt);
    return stale.data;
  }
}

export async function getTeam({ teamId = REAL_MADRID_ID, onStale } = {}) {
  const data = await request(`lookupteam.php?id=${teamId}`, 24 * HOUR, onStale);
  return data?.teams?.[0] ?? null;
}

export async function getSquad({ teamId = REAL_MADRID_ID, onStale } = {}) {
  const data = await request(`lookup_all_players.php?id=${teamId}`, 24 * HOUR, onStale);
  return Array.isArray(data?.player) ? data.player : [];
}

export async function getLastMatches({ teamId = REAL_MADRID_ID, onStale } = {}) {
  const data = await request(`eventslast.php?id=${teamId}`, 30 * MINUTE, onStale);
  return Array.isArray(data?.results) ? data.results : [];
}

export async function getNextMatches({ teamId = REAL_MADRID_ID, onStale } = {}) {
  const data = await request(`eventsnext.php?id=${teamId}`, 30 * MINUTE, onStale);
  return Array.isArray(data?.events) ? data.events : [];
}

export async function getLeagueTable(season, { leagueId = LA_LIGA_ID, onStale } = {}) {
  const data = await request(`lookuptable.php?l=${leagueId}&s=${season}`, HOUR, onStale);
  return Array.isArray(data?.table) ? data.table : [];
}
