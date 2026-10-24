import './style.css';
import { getSquad } from './api/sportsdb.js';
import { renderSquad, renderLoading, renderError } from './render/ui.js';

const app = document.querySelector('#app');

async function init() {
  renderLoading(app, 'Warming up at Valdebebas...');
  try {
    const players = await getSquad();
    renderSquad(app, players);
  } catch (error) {
    renderError(app, error.message, init);
  }
}

init();
