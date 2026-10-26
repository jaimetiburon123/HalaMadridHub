// Loading, error, empty and stale-data states shared by every section.
import { el } from './dom.js';

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

function timeAgo(savedAt) {
  const minutes = Math.round((Date.now() - savedAt) / 60000);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.round(hours / 24)} days ago`;
}

// Shown above a section when the network failed and saved data is displayed instead.
// Called with savedAt = null it just clears the note.
export function renderStaleNote(container, savedAt, onRetry) {
  if (savedAt === null) {
    container.replaceChildren();
    return;
  }
  const note = el('div', 'stale-note');
  note.setAttribute('role', 'status');
  note.append(el('span', '', `Couldn't update. Showing saved data from ${timeAgo(savedAt)}.`));
  if (onRetry) {
    const button = el('button', 'btn btn--small', 'Retry');
    button.type = 'button';
    button.addEventListener('click', onRetry);
    note.append(button);
  }
  container.replaceChildren(note);
}
