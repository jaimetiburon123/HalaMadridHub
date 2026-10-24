import './style.css';
import { getTeam, getSquad, getLastMatches, getNextMatches, getLeagueTable } from './api/sportsdb.js';
import { normalizePlayers, filterPlayers, groupByLine, squadStats, availableLines } from './logic/squad.js';
import { normalizeMatches, normalizeTable, seasonSummary, currentSeason } from './logic/matches.js';
import {
  renderClubHeader, renderLoading, renderError, renderMatches, renderSeason,
  renderSquadStats, renderSquadFilters, renderSquadGroups,
} from './render/ui.js';

const $ = (selector) => document.querySelector(selector);

// Each section loads on its own, so one failing request doesn't break the others.
async function loadMatches() {
  const container = $('#matches');
  renderLoading(container, 'Checking the fixture list...');
  try {
    const [last, next] = await Promise.all([getLastMatches(), getNextMatches()]);
    renderMatches(container, { last: normalizeMatches(last), next: normalizeMatches(next) });
  } catch (error) {
    renderError(container, error.message, loadMatches);
  }
}

async function loadSeason() {
  const container = $('#season');
  renderLoading(container, 'Reading the La Liga table...');
  try {
    const table = normalizeTable(await getLeagueTable(currentSeason()));
    renderSeason(container, table, seasonSummary(table));
  } catch (error) {
    renderError(container, error.message, loadSeason);
  }
}

async function loadSquad() {
  const container = $('#squad');
  $('#squad-stats').replaceChildren();
  $('#squad-filters').replaceChildren();
  renderLoading(container, 'Warming up at Valdebebas...');
  try {
    const players = normalizePlayers(await getSquad());
    if (players.length > 0) {
      renderSquadStats($('#squad-stats'), squadStats(players));
      renderSquadFilters($('#squad-filters'), availableLines(players), (filters) =>
        renderSquadGroups(container, groupByLine(filterPlayers(players, filters)))
      );
    }
    renderSquadGroups(container, groupByLine(players));
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
