import './style.css';
import { getSquad } from './api/sportsdb.js';
import { renderSquadList, renderMessage } from './render/ui.js';

const app = document.querySelector('#app');

async function init() {
  try {
    const players = await getSquad();
    renderSquadList(app, players);
  } catch (error) {
    renderMessage(app, error.message);
  }
}

init();
