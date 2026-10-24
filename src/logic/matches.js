// Logic layer: pure functions for fixtures, results and the league table.
import { REAL_MADRID_ID } from '../api/sportsdb.js';

const toNumber = (value) => {
  const n = Number(value);
  return value === null || value === undefined || value === '' || Number.isNaN(n) ? null : n;
};

// Current football season string, e.g. "2026-2027" (seasons start in August).
export function currentSeason(today = new Date()) {
  const year = today.getFullYear();
  const start = today.getMonth() >= 7 ? year : year - 1;
  return `${start}-${start + 1}`;
}

export function normalizeMatch(event, teamId = REAL_MADRID_ID) {
  const isHome = event.idHomeTeam === teamId;
  const home = toNumber(event.intHomeScore);
  const away = toNumber(event.intAwayScore);

  let result = null;
  if (home !== null && away !== null) {
    const ours = isHome ? home : away;
    const theirs = isHome ? away : home;
    result = ours > theirs ? 'W' : ours < theirs ? 'L' : 'D';
  }

  const date = event.strTimestamp ? new Date(`${event.strTimestamp}Z`) : null;
  return {
    id: event.idEvent,
    competition: event.strLeague || 'Match',
    date: date && !Number.isNaN(date.getTime()) ? date : null,
    venue: event.strVenue || '',
    home: { name: event.strHomeTeam || 'TBD', badge: event.strHomeTeamBadge || '', score: home },
    away: { name: event.strAwayTeam || 'TBD', badge: event.strAwayTeamBadge || '', score: away },
    result,
  };
}

export const normalizeMatches = (events, teamId) =>
  events.filter((e) => e && e.idEvent).map((e) => normalizeMatch(e, teamId));

// "WWLWD" -> { W: 3, D: 1, L: 1, letters: ['W','W','L','W','D'], points: 10 }
export function parseForm(form) {
  const letters = String(form ?? '')
    .toUpperCase()
    .split('')
    .filter((c) => ['W', 'D', 'L'].includes(c));
  const counts = letters.reduce((acc, c) => ({ ...acc, [c]: acc[c] + 1 }), { W: 0, D: 0, L: 0 });
  return { ...counts, letters, points: counts.W * 3 + counts.D };
}

export function normalizeTable(rows, teamId = REAL_MADRID_ID) {
  return rows
    .filter((r) => r && r.strTeam)
    .map((r) => ({
      rank: toNumber(r.intRank),
      team: r.strTeam,
      played: toNumber(r.intPlayed) ?? 0,
      won: toNumber(r.intWin) ?? 0,
      drawn: toNumber(r.intDraw) ?? 0,
      lost: toNumber(r.intLoss) ?? 0,
      goalsFor: toNumber(r.intGoalsFor) ?? 0,
      goalsAgainst: toNumber(r.intGoalsAgainst) ?? 0,
      points: toNumber(r.intPoints) ?? 0,
      form: parseForm(r.strForm),
      isUs: r.idTeam === teamId,
    }))
    .sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
}

// Season summary for our team, derived from its table row.
export function seasonSummary(table) {
  const us = table.find((row) => row.isUs);
  if (!us) return null;
  const leader = table[0];
  return {
    ...us,
    goalDifference: us.goalsFor - us.goalsAgainst,
    goalsPerGame: us.played ? us.goalsFor / us.played : 0,
    winRate: us.played ? Math.round((us.won / us.played) * 100) : 0,
    pointsBehindLeader: leader && !leader.isUs ? leader.points - us.points : 0,
  };
}
