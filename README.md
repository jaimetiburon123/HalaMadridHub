# Hala Madrid Hub

Misión M2 · Async Odyssey — Web Development I.

## How to use

1. Open a terminal in the project folder and run npm install (only the first time).
2. Run npm run dev and open the link that appears.
3. The page loads three sections from the TheSportsDB API:
   - Match centre: the last result and the next match of Real Madrid.
   - La Liga season: Real Madrid's stats (position, points, win rate...) and the top of the table with the recent form of each team.
   - The squad: player cards grouped by position, with the squad stats, a search bar and filters by position.
4. If something fails while loading (no internet, API limit...), the section shows an error message with a "Try again" button.
5. The data is saved in localStorage (bonus), so if you reload the page it doesn't repeat the requests it has already made.

## Use of AI
I used claude code as a partner to code the app.
Real Prompt Examples:
- "My idea for the app was to create a football hub specified for Real Madrid where you can see their results, upcoming matches, stats, squad list, etc. How would you suggest completing this in 5 different phases?"
- "why is the majority of the squad missing (vini, mbappe, etc)"

After each step the website would update automatically and so I checked that the new features worked before committing to github.

Something that I had to decide was what to do with the squad, because the free API key only returns 10 players (in alphabetical order) and only allows around 10 requests per minute. Claude tried searching the rest of the players one by one but the API blocked the requests, so I decided to keep the 10 players and explain the limit since the alternative was having to pay a monthly subscription.

## Autopsy
1. I decided to keep only the 10 players that the free API key returns. The alternative that I discarded was searching each star player (Mbappé, Vinícius, Bellingham...) by name with extra requests, because the API only allows around 10 requests per minute and most of the searches got blocked with an error. It would have made the page slow and full of errors. I also discarded paying a monthly subscription to the API.

2. Each section of the page (matches, season and squad) loads on its own with its own try/catch. The alternative that I discarded was loading everything together because if only one request failed the whole page would show an error. This way if one section fails the others still work, and only that section shows the "Try again" button.
