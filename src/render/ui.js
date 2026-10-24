// Render layer: functions that paint data into the DOM.
export function renderSquadList(container, players) {
  const list = document.createElement('ul');
  list.className = 'squad-list';
  list.append(
    ...players.map((player) => {
      const item = document.createElement('li');
      item.textContent = `${player.strPlayer} · ${player.strPosition}`;
      return item;
    })
  );
  container.replaceChildren(list);
}

export function renderMessage(container, text) {
  const message = document.createElement('p');
  message.textContent = text;
  container.replaceChildren(message);
}
