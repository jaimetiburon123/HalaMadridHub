// Logic layer: pure functions that transform squad data (map/filter/reduce).
const LINES = ['Goalkeepers', 'Defenders', 'Midfielders', 'Forwards', 'Others'];

// Map TheSportsDB's detailed positions onto the four lines of a team.
export function positionToLine(position = '') {
  const p = String(position ?? '').toLowerCase();
  if (p.includes('goalkeeper')) return 'Goalkeepers';
  if (p.includes('back') || p.includes('defen')) return 'Defenders';
  if (p.includes('midfield')) return 'Midfielders';
  if (p.includes('wing') || p.includes('forward') || p.includes('striker')) return 'Forwards';
  return 'Others';
}

export function ageFrom(dateBorn, today = new Date()) {
  const born = new Date(dateBorn);
  if (!dateBorn || Number.isNaN(born.getTime())) return null;
  const age = today.getFullYear() - born.getFullYear();
  const birthdayPassed =
    today.getMonth() > born.getMonth() ||
    (today.getMonth() === born.getMonth() && today.getDate() >= born.getDate());
  return birthdayPassed ? age : age - 1;
}

// Raw API player -> clean object the UI can trust.
export function normalizePlayers(rawPlayers) {
  return rawPlayers
    .filter((p) => p && typeof p.strPlayer === 'string' && p.strPlayer.trim() !== '')
    .map((p) => ({
      id: p.idPlayer,
      name: p.strPlayer.trim(),
      position: p.strPosition?.trim() || 'Unknown',
      line: positionToLine(p.strPosition),
      nationality: p.strNationality?.trim() || 'Unknown',
      number: p.strNumber?.trim() || '',
      age: ageFrom(p.dateBorn),
      photo: p.strCutout || p.strThumb || '',
    }))
    .sort((a, b) => (Number(a.number) || 99) - (Number(b.number) || 99));
}

export function filterPlayers(players, { query = '', line = 'All' } = {}) {
  const q = query.trim().toLowerCase();
  return players
    .filter((p) => line === 'All' || p.line === line)
    .filter(
      (p) => q === '' || p.name.toLowerCase().includes(q) || p.nationality.toLowerCase().includes(q)
    );
}

// [{ line: 'Goalkeepers', players: [...] }, ...] in pitch order, empty lines dropped.
export function groupByLine(players) {
  const groups = players.reduce((acc, p) => {
    (acc[p.line] ??= []).push(p);
    return acc;
  }, {});
  return LINES.filter((line) => groups[line]).map((line) => ({ line, players: groups[line] }));
}

export function squadStats(players) {
  const ages = players.map((p) => p.age).filter((age) => age !== null);
  const averageAge = ages.length ? ages.reduce((sum, age) => sum + age, 0) / ages.length : null;

  const nationalities = players.reduce((acc, p) => {
    acc[p.nationality] = (acc[p.nationality] ?? 0) + 1;
    return acc;
  }, {});
  const topNationality = Object.entries(nationalities).sort((a, b) => b[1] - a[1])[0] ?? null;

  const youngest = players
    .filter((p) => p.age !== null)
    .reduce((min, p) => (min === null || p.age < min.age ? p : min), null);

  return {
    total: players.length,
    averageAge,
    nationalityCount: Object.keys(nationalities).length,
    topNationality,
    youngest,
  };
}

export const availableLines = (players) => ['All', ...groupByLine(players).map((g) => g.line)];
