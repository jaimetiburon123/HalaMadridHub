// La Liga season section: summary tiles and the league table with form chips.
import { el, statTiles } from './dom.js';
import { renderEmpty } from './states.js';

const signed = (n) => (n > 0 ? `+${n}` : String(n));

function createFormChips(letters) {
  const wrap = el('span', 'form');
  wrap.append(...letters.map((letter) => el('span', `form-chip form-chip--${letter}`, letter)));
  return wrap;
}

function createSummary(summary) {
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
  return stats;
}

function createTable(table) {
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
  return scroll;
}

export function renderSeason(container, table, summary) {
  if (table.length === 0) {
    renderEmpty(container, 'League table not available right now.');
    return;
  }
  const nodes = summary ? [createSummary(summary), createTable(table)] : [createTable(table)];
  container.replaceChildren(...nodes);
}
