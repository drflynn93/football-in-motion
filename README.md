# Football in Motion

This separate `multi-game` version adds a game picker: choose the 2021 or 2025 NFL season, filter by team, choose a game, then select **Load game → Play**. Watch net offensive and return yards grow against actual scores, inspect key plays, compare passing/rushing over time, and examine fourth-down decisions.

[Original public one-game app](https://drflynn93.github.io/football-in-motion/) · [GitHub repository](https://github.com/drflynn93/football-in-motion). The game-picker extension is a separate local version; that public link still shows the original.

## Start locally

You need Node.js (built and tested with Node 24). Open this project folder in Codex. Ask: **“Start the football app preview.”** Or run this from the project folder:

```text
node tools/serve.mjs --port 4175
```

Open **http://127.0.0.1:4175/** in a browser. Choose a season/team/game and select Load game, then Play. The original Bills–Chiefs example loads initially. Normal playback lasts about seven minutes; 8× takes about 53 seconds. The box score and fourth-down analysis appear when the game ends. Select passing/rushing to animate a lower comparison chart; select a fourth-down count to open decision bars. Hover/focus a yellow dot to pause and read; click/tap to keep details open. Replay starts a fresh session. Loading another game stops the previous replay and clears its analysis.

No npm installation, API key, account or live sports connection is needed to watch. Stop the local server with Ctrl+C. After shutting down the PC, start the server again; this localhost link works only on that computer. Use `--port 4174` if the usual port is occupied.

## Check and prepare the public site

```text
node --test
node tools/verify-game.mjs
node tools/publish.mjs
node tools/serve.mjs --docs --prefix /football-demo/ --port 4174
```

The last command previews the prepared site at **http://127.0.0.1:4174/football-demo/**, simulating a repository subpath. The preparation helper validates the game and copies an explicit public-file list from `site/` to `docs/`. It refuses unexpected public files. It does not upload or deploy anything.

The original is already published from `main` → `/docs`. Keep this version on `multi-game` while reviewing it. Publishing the extension is a separate decision; the preparation command only writes local files.

## What the numbers mean

- Main vertical axis: net rushing + passing after sacks + PR/KR/IR/FR return yards. Receiving yards and kick flight distance are not added. Own-team fumble recoveries add no defensive-recovery count or return yards.
- Horizontal axis: away team's score to the left, home team's score to the right. Their separation is the sum of scores, not the lead. Bold badges show exact current scores; scales adapt to each game's scores and yards.
- Box score and lower passing chart: gross passing yards. Bills gross/net: 329/313; Chiefs: 378/370. Returns: Bills 22, Chiefs 86. Neither team intercepted a pass or recovered an opponent's fumble.
- Fourth downs: go-for-it percentage uses all valid fourth-down decisions as its denominator; conversion percentage uses attempts. No attempts means N/A. Bar height is yards needed, with goal-to-go labeled. Nullified plays and earlier-down field goals are excluded. This game has no missed fourth-down field goal; the missed third-down kick is excluded.
- The original playoff game used a 15-minute overtime period. Regular-season overtime uses ten minutes for the included seasons. Source play order is preserved, including equal game clocks and nonmonotonic source IDs. Times are source play-start times, which can differ from scoring-summary end times. A tie defaults to the away team for analysis; Compare both remains available.

## Data and attribution

Play data comes from [nflverse's 2021 release](https://github.com/nflverse/nflverse-data/releases/tag/pbp), game `2021_20_BUF_KC`, under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Modified by filtering one game and normalizing scores, yardage, identities and decisions. Independent totals, scoring transitions and exceptional plays were checked against the [official NFL gamebook](https://static.www.nfl.com/image/upload/v1677629313/gamecenter/34f0d976-71ad-11ec-a493-77fb1cc3a88e.pdf). Attribution does not imply endorsement. [Field definitions](https://nflreadr.nflverse.com/articles/dictionary_pbp.html).

The picker includes 565 games: 283 from 2021 and 282 from 2025. Five other games are listed as unavailable because required timing or play order could not be validated. Additional games pass source structure, score sequence and final scoreboard checks; they have **not** been independently reconciled against official gamebooks. The original example keeps its independent verification. Do not treat these source checks as independent verification of every player's statistics.

The retained original source rows in `devpost/research/` support preparation (`node tools/prepare-game.mjs`) but are not served or copied into the public site. The original [Pro Football Reference game page](https://www.pro-football-reference.com/boxscores/202201230kan.htm#all_pbp) is a reference, not a runtime dependency.

To reproduce the catalog, save the [2021 CSV gzip](https://github.com/nflverse/nflverse-data/releases/download/pbp/play_by_play_2021.csv.gz) and [2025 CSV gzip](https://github.com/nflverse/nflverse-data/releases/download/pbp/play_by_play_2025.csv.gz) under `.cache/` using their existing filenames, then run `node tools/prepare-catalog.mjs`. The ignored downloads stay local. Normalized game files and catalog are included, so visitors need no download setup. The app fetches the catalog and one selected saved game at a time; it does not fetch or scrape a live football website.

D3 7.9.0 is vendored locally under its ISC license; see `site/vendor/d3-LICENSE`. The application uses ordinary HTML/CSS/JavaScript and Node's built-in preview/testing tools. Personal learner context and local credentials are excluded from Git through `.gitignore`.

## Proof-of-concept boundary

Two included NFL seasons with a team/game picker. Importing arbitrary games, college football, high-school support and automatic live-season updates remain outside this version. Fourth-down analysis describes decisions and outcomes; it does not recommend an optimal decision. Earlier planning documents describe the original contest app; `devpost/game-picker-plan.md` records this separate extension.

## License

Original application code is licensed under the [MIT License](LICENSE), copyright 2026 Kevin Flynn. The included D3 library retains its ISC license. Football data retains its CC BY 4.0 license and attribution; the application license does not replace those third-party terms.
