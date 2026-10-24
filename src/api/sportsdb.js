// API layer: everything that talks to TheSportsDB lives here.
import { readCache, writeCache } from './cache.js';

export const BASE_URL = 'https://www.thesportsdb.com/api/v1/json/123';
export const REAL_MADRID_ID = '133738';
export const LA_LIGA_ID = '4335';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;

// Generic GET helper: returns a cached copy when it's still fresh, otherwise fetches.
// Throws a readable error on network failures, rate limiting, non-2xx responses and invalid JSON.
async function request(endpoint, ttl) {
  const cached = readCache(endpoint);
  if (cached) return cached;

  let response;
  try {
    response = await fetch(`${BASE_URL}/${endpoint}`);
  } catch {
    throw new Error('Network error: could not reach TheSportsDB.');
  }

  // The free key allows only a few requests per minute.
  if (response.status === 429) {
    throw new Error('TheSportsDB is limiting requests right now. Try again in a minute.');
  }
  if (!response.ok) {
    throw new Error(`TheSportsDB responded with status ${response.status}.`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('TheSportsDB returned data that is not valid JSON.');
  }

  // Only successful responses are cached, so errors are always retried.
  writeCache(endpoint, data, ttl);
  return data;
}

export async function getTeam(teamId = REAL_MADRID_ID) {
  const data = await request(`lookupteam.php?id=${teamId}`, 24 * HOUR);
  return data?.teams?.[0] ?? null;
}

export async function getSquad(teamId = REAL_MADRID_ID) {
  const data = await request(`lookup_all_players.php?id=${teamId}`, 24 * HOUR);
  return Array.isArray(data?.player) ? data.player : [];
}

export async function getLastMatches(teamId = REAL_MADRID_ID) {
  const data = await request(`eventslast.php?id=${teamId}`, 30 * MINUTE);
  return Array.isArray(data?.results) ? data.results : [];
}

export async function getNextMatches(teamId = REAL_MADRID_ID) {
  const data = await request(`eventsnext.php?id=${teamId}`, 30 * MINUTE);
  return Array.isArray(data?.events) ? data.events : [];
}

export async function getLeagueTable(season, leagueId = LA_LIGA_ID) {
  const data = await request(`lookuptable.php?l=${leagueId}&s=${season}`, HOUR);
  return Array.isArray(data?.table) ? data.table : [];
}
