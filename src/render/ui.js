// Render layer: functions that paint data into the DOM.
const PLACEHOLDER_PHOTO = '/player-placeholder.svg';

// Weird data guard: always return a non-empty, trimmed string.
const text = (value, fallback = 'Unknown') =>
  typeof value === 'string' && value.trim() !== '' ? value.trim() : fallback;

export function renderLoading(container, label = 'Loading...') {
  const box = document.createElement('div');
  box.className = 'state state--loading';
  box.setAttribute('role', 'status');
  box.innerHTML = '<span class="spinner" aria-hidden="true"></span>';
  box.append(label);
  container.replaceChildren(box);
}

export function renderError(container, message, onRetry) {
  const box = document.createElement('div');
  box.className = 'state state--error';
  box.setAttribute('role', 'alert');

  const title = document.createElement('strong');
  title.textContent = 'Something went wrong';
  const detail = document.createElement('p');
  detail.textContent = message;
  box.append(title, detail);

  if (onRetry) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn';
    button.textContent = 'Try again';
    button.addEventListener('click', onRetry);
    box.append(button);
  }
  container.replaceChildren(box);
}

export function renderEmpty(container, message) {
  const box = document.createElement('div');
  box.className = 'state state--empty';
  box.textContent = message;
  container.replaceChildren(box);
}

function createPlayerCard(player) {
  const card = document.createElement('article');
  card.className = 'player-card';

  const photo = document.createElement('img');
  photo.src = text(player.strCutout, '') || text(player.strThumb, '') || PLACEHOLDER_PHOTO;
  photo.alt = text(player.strPlayer, 'Player');
  photo.loading = 'lazy';
  // Broken image URL: fall back to the placeholder once.
  photo.addEventListener('error', () => { photo.src = PLACEHOLDER_PHOTO; }, { once: true });

  const name = document.createElement('h3');
  name.textContent = text(player.strPlayer, 'Unnamed player');

  const meta = document.createElement('p');
  meta.className = 'player-meta';
  meta.textContent = `${text(player.strPosition)} · ${text(player.strNationality)}`;

  card.append(photo, name, meta);

  const number = text(player.strNumber, '');
  if (number) {
    const badge = document.createElement('span');
    badge.className = 'player-number';
    badge.textContent = number;
    card.append(badge);
  }
  return card;
}

export function renderSquad(container, players) {
  if (!Array.isArray(players) || players.length === 0) {
    renderEmpty(container, 'No players found right now.');
    return;
  }
  const grid = document.createElement('div');
  grid.className = 'squad-grid';
  grid.append(...players.map(createPlayerCard));
  container.replaceChildren(grid);
}
