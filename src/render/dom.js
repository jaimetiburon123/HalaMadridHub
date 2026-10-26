// Shared DOM helpers used by every render module.

// Builds an element with textContent (safe against weird API strings).
export function el(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
}

export function statTiles(items) {
  return items.map(([label, value]) => {
    const tile = el('div', 'stat');
    tile.append(el('span', 'stat-value', String(value)), el('span', 'stat-label', label));
    return tile;
  });
}

// Runs fn only once the calls stop for `ms` milliseconds (e.g. when the user stops typing).
export function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
