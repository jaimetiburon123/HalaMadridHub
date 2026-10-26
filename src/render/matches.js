// Match centre section: last result and next fixture cards.
import { el } from './dom.js';
import { renderEmpty } from './states.js';

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
