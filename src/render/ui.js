// Render layer: functions that paint data into the DOM.
const PLACEHOLDER_PHOTO = '/player-placeholder.svg';

// Small helper to build elements with textContent (safe against weird API strings).
function el(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
}

function statTiles(items) {
  return items.map(([label, value]) => {
    const tile = el('div', 'stat');
    tile.append(el('span', 'stat-value', String(value)), el('span', 'stat-label', label));
    return tile;
  });
}

export function renderLoading(container, label = 'Loading...') {
  const box = el('div', 'state state--loading');
  box.setAttribute('role', 'status');
  const spinner = el('span', 'spinner');
  spinner.setAttribute('aria-hidden', 'true');
  box.append(spinner, label);
  container.replaceChildren(box);
}

export function renderError(container, message, onRetry) {
  const box = el('div', 'state state--error');
  box.setAttribute('role', 'alert');
  box.append(el('strong', '', 'Something went wrong'), el('p', '', message));
  if (onRetry) {
    const button = el('button', 'btn', 'Try again');
    button.type = 'button';
    button.addEventListener('click', onRetry);
    box.append(button);
  }
  container.replaceChildren(box);
}

export function renderEmpty(container, message) {
  container.replaceChildren(el('div', 'state state--empty', message));
}

/* ---------- Squad ---------- */

function createPlayerCard(player) {
  const card = el('article', 'player-card');
  const photo = document.createElement('img');
  photo.src = player.photo || PLACEHOLDER_PHOTO;
  photo.alt = player.name;
  photo.loading = 'lazy';
  photo.addEventListener('error', () => { photo.src = PLACEHOLDER_PHOTO; }, { once: true });

  const age = player.age !== null ? ` · ${player.age} y/o` : '';
  card.append(
    photo,
    el('h3', '', player.name),
    el('p', 'player-meta', `${player.position}${age}`),
    el('p', 'player-meta', player.nationality)
  );
  if (player.number) card.append(el('span', 'player-number', player.number));
  return card;
}

export function renderSquadStats(container, stats) {
  container.replaceChildren(
    ...statTiles([
      ['Players', stats.total],
      ['Average age', stats.averageAge !== null ? stats.averageAge.toFixed(1) : '—'],
      ['Nationalities', stats.nationalityCount],
      ['Most common', stats.topNationality ? `${stats.topNationality[0]} (${stats.topNationality[1]})` : '—'],
      ['Youngest', stats.youngest ? `${stats.youngest.name} (${stats.youngest.age})` : '—'],
    ])
  );
}

export function renderSquadFilters(container, lines, onChange) {
  const search = document.createElement('input');
  search.type = 'search';
  search.placeholder = 'Search player or nationality...';
  search.className = 'search';
  search.setAttribute('aria-label', 'Search players');

  let activeLine = 'All';
  const chips = el('div', 'chips');
  const buttons = lines.map((line) => {
    const chip = el('button', 'chip', line);
    chip.type = 'button';
    chip.setAttribute('aria-pressed', String(line === activeLine));
    chip.addEventListener('click', () => {
      activeLine = line;
      buttons.forEach((b) => b.setAttribute('aria-pressed', String(b === chip)));
      onChange({ query: search.value, line: activeLine });
    });
    return chip;
  });
  chips.append(...buttons);

  search.addEventListener('input', () => onChange({ query: search.value, line: activeLine }));
  container.replaceChildren(search, chips);
}

export function renderSquadGroups(container, groups) {
  if (groups.length === 0) {
    renderEmpty(container, 'No players match your search.');
    return;
  }
  container.replaceChildren(
    ...groups.map(({ line, players }) => {
      const section = el('section', 'line-group');
      const grid = el('div', 'squad-grid');
      grid.append(...players.map(createPlayerCard));
      section.append(el('h3', 'line-title', `${line} (${players.length})`), grid);
      return section;
    })
  );
}

/* ---------- Matches ---------- */

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
});

function createTeamSide(team) {
  const side = el('div', 'match-team');
  if (team.badge) {
    const badge = document.createElement('img');
    badge.src = team.badge;
    badge.alt = '';
    badge.addEventListener('error', () => badge.remove(), { once: true });
    side.append(badge);
  }
  side.append(el('span', '', team.name));
  return side;
}

function createMatchCard(match, label) {
  const card = el('article', `match-card${match.result ? ` match-card--${match.result}` : ''}`);
  const header = el('div', 'match-header');
  header.append(el('span', 'match-label', label), el('span', '', match.competition));

  const score = match.result ? `${match.home.score} – ${match.away.score}` : 'vs';
  const body = el('div', 'match-body');
  body.append(createTeamSide(match.home), el('span', 'match-score', score), createTeamSide(match.away));

  const when = match.date ? dateFormat.format(match.date) : 'Date TBC';
  const footer = el('p', 'match-footer', [when, match.venue].filter(Boolean).join(' · '));
  card.append(header, body, footer);
  return card;
}

export function renderMatches(container, { last, next }) {
  const cards = [
    ...last.map((m) => createMatchCard(m, 'Last result')),
    ...next.map((m) => createMatchCard(m, 'Next match')),
  ];
  if (cards.length === 0) {
    renderEmpty(container, 'No matches available right now.');
    return;
  }
  container.replaceChildren(...cards);
}

function createFormChips(letters) {
  const wrap = el('span', 'form');
  wrap.append(...letters.map((letter) => el('span', `form-chip form-chip--${letter}`, letter)));
  return wrap;
}

const signed = (n) => (n > 0 ? `+${n}` : String(n));

export function renderSeason(container, table, summary) {
  if (table.length === 0) {
    renderEmpty(container, 'League table not available right now.');
    return;
  }

  const nodes = [];
  if (summary) {
    const stats = el('div', 'stats');
    stats.append(
      ...statTiles([
        ['Position', `${summary.rank}º`],
        ['Points', summary.points],
        ['Win rate', `${summary.winRate}%`],
        ['Goal diff.', signed(summary.goalDifference)],
        ['Goals / game', summary.goalsPerGame.toFixed(2)],
        ['Behind leader', summary.pointsBehindLeader > 0 ? `${summary.pointsBehindLeader} pts` : 'Leaders!'],
      ])
    );
    nodes.push(stats);
  }

  const head = el('tr');
  head.append(...['#', 'Team', 'P', 'W', 'D', 'L', 'GD', 'Pts', 'Form'].map((h) => el('th', '', h)));
  const thead = el('thead');
  thead.append(head);

  const tbody = el('tbody');
  tbody.append(
    ...table.map((row) => {
      const tr = el('tr', row.isUs ? 'is-us' : '');
      const cells = [row.rank ?? '—', row.team, row.played, row.won, row.drawn, row.lost,
        signed(row.goalsFor - row.goalsAgainst), row.points];
      tr.append(...cells.map((v) => el('td', '', String(v))));
      const formCell = el('td');
      formCell.append(createFormChips(row.form.letters));
      tr.append(formCell);
      return tr;
    })
  );

  const tableEl = el('table', 'league-table');
  tableEl.append(thead, tbody);
  const scroll = el('div', 'table-scroll');
  scroll.append(tableEl);
  nodes.push(scroll);

  container.replaceChildren(...nodes);
}
