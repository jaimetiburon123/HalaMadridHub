import './style.css';
import { getTeam, getSquad, getLastMatches, getNextMatches, getLeagueTable } from './api/sportsdb.js';
import { normalizePlayers, filterPlayers, groupByLine, squadStats, availableLines } from './logic/squad.js';
import { normalizeMatches, normalizeTable, seasonSummary, currentSeason } from './logic/matches.js';
import { renderLoading, renderError, renderStaleNote } from './render/states.js';
import { renderClubHeader } from './render/header.js';
import { renderMatches } from './render/matches.js';
import { renderSeason } from './render/season.js';
import { renderSquadStats, renderSquadFilters, renderSquadGroups } from './render/squad.js';

const $ = (selector) => document.querySelector(selector);

// Remembers the oldest saved-at time when a request falls back to cached data.
function staleTracker() {
  let savedAt = null;
  return {
    onStale: (time) => { savedAt = savedAt === null ? time : Math.min(savedAt, time); },
    get savedAt() { return savedAt; },
  };
}

// Each section loads on its own, so one failing request doesn't break the others.
async function loadMatches() {
  const container = $('#matches');
  const stale = staleTracker();
  renderStaleNote($('#matches-note'), null);
  renderLoading(container, 'Checking the fixture list...');
  try {
    const [last, next] = await Promise.all([getLastMatches(stale), getNextMatches(stale)]);
    renderMatches(container, { last: normalizeMatches(last), next: normalizeMatches(next) });
    renderStaleNote($('#matches-note'), stale.savedAt, loadMatches);
  } catch (error) {
    renderError(container, error.message, loadMatches);
  }
}

async function loadSeason() {
  const container = $('#season');
  const stale = staleTracker();
  renderStaleNote($('#season-note'), null);
  renderLoading(container, 'Reading the La Liga table...');
  try {
    const table = normalizeTable(await getLeagueTable(currentSeason(), stale));
    renderSeason(container, table, seasonSummary(table));
    renderStaleNote($('#season-note'), stale.savedAt, loadSeason);
  } catch (error) {
    renderError(container, error.message, loadSeason);
  }
}

async function loadSquad() {
  const container = $('#squad');
  const stale = staleTracker();
  renderStaleNote($('#squad-note'), null);
  $('#squad-stats').replaceChildren();
  $('#squad-filters').replaceChildren();
  renderLoading(container, 'Warming up at Valdebebas...');
  try {
    const players = normalizePlayers(await getSquad(stale));
    if (players.length > 0) {
      renderSquadStats($('#squad-stats'), squadStats(players));
      renderSquadFilters($('#squad-filters'), availableLines(players), (filters) =>
        renderSquadGroups(container, groupByLine(filterPlayers(players, filters)))
      );
    }
    renderSquadGroups(container, groupByLine(players));
    renderStaleNote($('#squad-note'), stale.savedAt, loadSquad);
  } catch (error) {
    renderError(container, error.message, loadSquad);
  }
}

// Header details are a nice extra: if they fail, the plain title stays.
async function loadClub() {
  try {
    renderClubHeader($('#club'), await getTeam());
  } catch {
    // Keep the default header.
  }
}

loadClub();
loadMatches();
loadSeason();
loadSquad();
