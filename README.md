# Football in Motion

A checked replay of Buffalo Bills vs Kansas City Chiefs, January 23, 2022. Watch net offensive and return yards grow against each team's actual score, inspect key plays, compare passing/rushing over time, and examine fourth-down decisions.

## Start locally

You need Node.js (built and tested with Node 24). Open this project folder in Codex. Ask: **“Start the football app preview.”** Or run this from the project folder:

```text
node tools/serve.mjs
```

Open **http://127.0.0.1:4173/** in a browser. Press Play. Normal playback lasts about seven minutes; 8× takes about 53 seconds. The box score and fourth-down analysis appear when the game ends. Select passing/rushing to animate a lower comparison chart; select a fourth-down count to open decision bars. Hover/focus a yellow dot to pause and read; click/tap to keep details open. Replay starts a fresh session.

No npm installation, API key, account or live sports connection is needed to watch. Stop the local server with Ctrl+C. After shutting down the PC, start the server again; this localhost link works only on that computer. Use `--port 4174` if the usual port is occupied.

## Check and prepare the public site

```text
node --test
node tools/verify-game.mjs
node tools/publish.mjs
node tools/serve.mjs --docs --prefix /football-demo/ --port 4174
```

The last command previews the prepared site at **http://127.0.0.1:4174/football-demo/**, simulating a repository subpath. The preparation helper validates the game and copies an explicit public-file list from `site/` to `docs/`. It refuses unexpected public files. It does not upload or deploy anything.

After final review, push the reviewed repository to GitHub and configure Pages to publish `main` → `/docs`. Use the public URL GitHub provides. The public repository, short demo video and Devpost submission are separate shipping steps still to complete.

## What the numbers mean

- Main vertical axis: net rushing + passing after sacks + PR/KR/IR/FR return yards. Receiving yards and kick flight distance are not added. Own-team fumble recoveries add no defensive-recovery count or return yards.
- Horizontal axis: Bills' score to the left, Chiefs' score to the right. Their separation is the sum of scores, not the lead. Bold badges show exact current scores.
- Box score and lower passing chart: gross passing yards. Bills gross/net: 329/313; Chiefs: 378/370. Returns: Bills 22, Chiefs 86. Neither team intercepted a pass or recovered an opponent's fumble.
- Fourth downs: go-for-it percentage uses all valid fourth-down decisions as its denominator; conversion percentage uses attempts. No attempts means N/A. Bar height is yards needed, with goal-to-go labeled. Nullified plays and earlier-down field goals are excluded. This game has no missed fourth-down field goal; the missed third-down kick is excluded.
- Historical playoff overtime for this game used a 15-minute period. Source play order is preserved, including equal game clocks and nonmonotonic source IDs. Times are source play-start times, which can differ from scoring-summary end times.

## Data and attribution

Play data comes from [nflverse's 2021 release](https://github.com/nflverse/nflverse-data/releases/tag/pbp), game `2021_20_BUF_KC`, under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Modified by filtering one game and normalizing scores, yardage, identities and decisions. Independent totals, scoring transitions and exceptional plays were checked against the [official NFL gamebook](https://static.www.nfl.com/image/upload/v1677629313/gamecenter/34f0d976-71ad-11ec-a493-77fb1cc3a88e.pdf). Attribution does not imply endorsement. [Field definitions](https://nflreadr.nflverse.com/articles/dictionary_pbp.html).

The retained source rows in `devpost/research/` support reproducible preparation (`node tools/prepare-game.mjs`) but are not served or copied into the public site. The original [Pro Football Reference game page](https://www.pro-football-reference.com/boxscores/202201230kan.htm#all_pbp) is a reference, not a runtime dependency.

D3 7.9.0 is vendored locally under its ISC license; see `site/vendor/d3-LICENSE`. The application uses ordinary HTML/CSS/JavaScript and Node's built-in preview/testing tools. Personal learner context and local credentials are excluded from Git through `.gitignore`.

## Proof-of-concept boundary

One verified saved game. Additional games, fetching/importing play-by-play and high-school support are deferred. Fourth-down analysis describes decisions and outcomes; it does not recommend an optimal decision.
