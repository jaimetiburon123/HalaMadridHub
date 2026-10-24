# Hala Madrid Hub

Mission M2 · Async Odyssey (U2 · Advanced JavaScript and Frontend Tooling)

A Real Madrid fan dashboard built with **Vite** and vanilla JavaScript. It consumes the public
[TheSportsDB](https://www.thesportsdb.com/) API with `fetch` + `async/await` and shows:

- **Match centre:** the last result and the next fixture, with badges, date and stadium.
  Cards are coloured green / grey / red for a win, draw or loss.
- **La Liga season:** position, points, win rate, goal difference, goals per game and points
  behind the leader, plus the top of the table with recent form (W/D/L chips).
- **The squad:** player cards grouped by line (goalkeepers, defenders, midfielders, forwards),
  squad stats (average age, nationalities, youngest player), a search box and position filters.

## Getting started

```bash
npm install
npm run dev      # development server at http://localhost:5173
npm run build    # production build in dist/
npm run preview  # preview the production build
```

Requires Node.js 18 or newer. No API key or `.env` is needed: it uses TheSportsDB's public test key `123`.

## Project structure

```
src/
├── api/
│   ├── sportsdb.js   # fetch calls, response.ok checks, readable errors
│   └── cache.js      # localStorage cache with expiry time (bonus)
├── logic/
│   ├── squad.js      # map/filter/reduce: normalize players, group by line, stats, search
│   └── matches.js    # results (W/D/L), league table, form parsing, season summary
├── render/
│   └── ui.js         # DOM rendering: loading, error, empty states and every section
├── main.js           # wires API → logic → render, one independent loader per section
└── style.css
```

Each layer has one responsibility: `api/` only fetches, `logic/` only transforms data with pure
functions (no DOM), and `render/` only paints the DOM.

## How the rubric is covered

| Objective | Where |
| --- | --- |
| `fetch` + `async/await`, `try/catch`, `response.ok` | `src/api/sportsdb.js` → `request()` |
| Loading and error states visible to the user | `renderLoading` / `renderError` (with a **Try again** button) in `src/render/ui.js` |
| `map` / `filter` / `reduce` before painting | `src/logic/squad.js`, `src/logic/matches.js` |
| ES modules split into API, logic and render | `src/api`, `src/logic`, `src/render` |
| Robustness | Empty arrays and missing fields fall back to safe defaults, broken images fall back to a placeholder, invalid JSON and network errors show a message, and each section fails independently |
| Bonus: localStorage cache | `src/api/cache.js`: squad and team cached 24 h, table 1 h, matches 30 min. Only successful responses are cached |

## Limitations

TheSportsDB's free test key limits some endpoints: the squad endpoint only returns the first
10 players in alphabetical order, the match endpoints return only the last and next match, and
the league table returns the top 5. It also allows only about 10 requests per minute.

That's why the squad section shows 10 players and not the whole first team. Fetching the rest
player by player would blow through the rate limit, so the app sticks to what the free key gives
and is built to work with whatever amount of data comes back. When the API rate-limits a
request, the section shows a clear message with a **Try again** button, and the localStorage
cache keeps normal reloads well under the limit.

## AI declaration

This project was built with the help of an AI assistant (Claude, by Anthropic, used through
Claude Code).

- **What the AI did:** it suggested the project idea and the 5-step plan, and wrote the code
  (API, cache, logic, rendering and CSS) and this README.
- **What I did:** I chose the topic and the idea, set up the GitHub repository, reviewed and
  tested each step in the browser, and made every commit with my own message.
