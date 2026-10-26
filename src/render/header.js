// Club header: badge, title and stadium details.
import { el } from './dom.js';

export function renderClubHeader(container, team) {
  if (!team) return;
  const nodes = [];
  if (team.strBadge) {
    const badge = document.createElement('img');
    badge.className = 'club-badge';
    badge.src = team.strBadge;
    badge.alt = `${team.strTeam ?? 'Club'} badge`;
    badge.addEventListener('error', () => badge.remove(), { once: true });
    nodes.push(badge);
  }
  const titles = el('div', 'club-titles');
  titles.append(el('h1', '', 'Hala Madrid Hub'));
  const details = [
    team.intFormedYear && `Since ${team.intFormedYear}`,
    team.strStadium,
    team.intStadiumCapacity && `${Number(team.intStadiumCapacity).toLocaleString('en-GB')} seats`,
  ].filter(Boolean);
  if (details.length) titles.append(el('p', 'club-details', details.join(' · ')));
  nodes.push(titles);
  container.replaceChildren(...nodes);
}
