// Squad section: stats, search and filters, and player cards grouped by line.
import { el, statTiles, debounce } from './dom.js';
import { renderEmpty } from './states.js';

const PLACEHOLDER_PHOTO = '/player-placeholder.svg';
const SEARCH_DELAY = 250;

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

  // Typing is debounced so the grid isn't rebuilt on every key press; chip clicks stay instant.
  search.addEventListener(
    'input',
    debounce(() => onChange({ query: search.value, line: activeLine }), SEARCH_DELAY)
  );
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
