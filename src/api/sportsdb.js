// API layer: everything that talks to TheSportsDB lives here.
export const BASE_URL = 'https://www.thesportsdb.com/api/v1/json/123';
export const REAL_MADRID_ID = '133738';

// Generic GET helper: throws a readable error on network failures,
// non-2xx responses and invalid JSON.
async function request(endpoint) {
  let response;
  try {
    response = await fetch(`${BASE_URL}/${endpoint}`);
  } catch {
    throw new Error('Network error: could not reach TheSportsDB.');
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

export async function getTeam(teamId = REAL_MADRID_ID) {
  const data = await request(`lookupteam.php?id=${teamId}`);
  return data?.teams?.[0] ?? null;
}

export async function getSquad(teamId = REAL_MADRID_ID) {
  const data = await request(`lookup_all_players.php?id=${teamId}`);
  return Array.isArray(data?.player) ? data.player : [];
}

export async function getLastMatches(teamId = REAL_MADRID_ID) {
  const data = await request(`eventslast.php?id=${teamId}`);
  return Array.isArray(data?.results) ? data.results : [];
}

export async function getNextMatches(teamId = REAL_MADRID_ID) {
  const data = await request(`eventsnext.php?id=${teamId}`);
  return Array.isArray(data?.events) ? data.events : [];
}
