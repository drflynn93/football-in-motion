---
doc: spec
status: approved
---

# Football Game Animation — Technical Spec

Final project name chosen by the learner during shipping: **Football in Motion**. Planned repository: `drflynn93/football-in-motion`. Public repository and Pages URLs will be recorded after creation and verification; no live URL is assumed here. The build and hands-on review are complete; earlier future-tense notes below preserve the technical-planning record.

## How This Works, In Plain Language
We prepare one checked file of Bills–Chiefs plays. Opening the app reads that file; pressing Play moves through it in order. D3 draws the game paths, while the same plays provide the ticker, event bubbles, final statistics, and fourth-down analysis. Playback controls change the viewing pace without changing the statistics. GitHub Pages shares the finished app through a public link.

The app works entirely in the visitor's browser. Node is a local helper for previewing and checking the project; visitors do not need it. No live sports-site connection is needed while watching. Refreshing starts a new viewing session; saved game data stays unchanged.

## The Core Journey Through the System
Implements `prd.md > The Core Journey`.
1. Load the page, local D3 file, and saved game JSON. Validate the game before enabling Play; keep the matchup visible on failure.
2. Play reveals the score axis, yardage axis, and names, then introduces the verified coin-toss context.
3. One playback controller advances a logical timeline. All visible replay elements read that same position.
4. The chart draws per-play yardage and score changes; the ticker shows the corresponding play. Key moments create short bubbles and persistent yellow markers.
5. Pause or hover holds the logical position. Leaving a hover resumes only when the viewer had been playing. Replay resets the whole viewing session.
6. Completion reveals the box score and fourth-down summaries. Clicking passing/rushing opens the lower animated chart; clicking fourth-down count opens decision bars. Each analysis defaults to Chiefs and offers Bills / Compare both.

## Stack
- Ordinary HTML, CSS, and JavaScript modules; no application framework or build pipeline. D3 is the agreed visualization dependency.
- D3 7.9.0, pinned and downloaded into `site/vendor/` with its license. Load its local UMD bundle before the app module. No floating CDN dependency at playback time. [D3 setup](https://d3js.org/getting-started).
- Node 24 locally: v24.19.0 is available in this workspace. Built-in HTTP support for preview, filesystem support for data preparation, and the built-in test runner. No npm installation is required for routine preview/tests. [Node scripts](https://nodejs.org/learn/command-line/run-nodejs-scripts-from-the-command-line).
- GitHub Pages, published from `main` and `/docs`. Only the contents of `site/` are copied to `docs/` for deployment. [Publishing configuration](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Where It Runs and How Someone Tries It

Shipping update: the public repository is https://github.com/drflynn93/football-in-motion, verified without authentication on October 5, 2026 (public, MIT license). The live app is https://drflynn93.github.io/football-in-motion/. GitHub Pages is configured for main /docs. A .nojekyll file in the publishing folder tells GitHub to serve the prepared static app without Jekyll processing; the publishing helper copies this marker from site/. The public app and its assets load without authentication; live browser replay starts successfully. Demo-video URL remains pending.
After implementation, from the project root:
- `node tools/serve.mjs` serves only `site/` on `127.0.0.1:4173`. Open `http://127.0.0.1:4173/` to try or record the app; Ctrl+C stops the preview. Support a port argument if the default is occupied.
- `node --test` runs calculation and controller checks.
- `node tools/publish.mjs` validates then copies public app files into `docs/`, without including planning profiles or raw research.
- Push the reviewed public repository, select Settings > Pages > Deploy from a branch > main > /docs, and use the URL GitHub returns. Repository name and account remain to be supplied at shipping time; do not invent a URL.
- All app links/assets are relative so the repository subpath works. Visitors need a modern browser, no accounts or keys.
- The public app URL supplements the required short video and public GitHub repository. At 8x the seven-minute replay is about 53 seconds, useful for a short demonstration; also demonstrate hovering and fourth-down analysis.

## Look and Feel
Implements `prd.md > Look and Feel`.
White background, black axes and text, restrained spacing, ordinary readable system fonts. Dark green runs, dotted green passes, green PR/KR/IR/FR text along return segments, and red losses. Small names track tips with Bills offset left and Chiefs right at the shared start. Yellow dots mark events. Use SVG patterns for missed-field-goal red/gray bars, with a textual legend. Team names and labels remain visible so colors are not the only identification. Keep hover markers focusable for keyboard inspection; provide click/tap inspection as an equivalent where no pointer hover exists.

## Components

### Data Loader and Game Model
Implements `prd.md > States and Boundaries` and all statistical behaviors.
Read `./data/bills-chiefs.json`, validate required fields, and derive cumulative team snapshots and summaries through pure functions. Fetch errors or unusable required data produce the agreed message and Retry button. Retry re-reads the same file and validates it; it does not substitute another game. Missing essential numerical facts must fail preparation rather than become fabricated zeros. Player names may be abbreviated from the source; missing optional names are explicitly unavailable, not invented.

### Playback Controller
Implements `prd.md > Ticker and Playback` and `Key Moments and Hover Markers`.
A single requestAnimationFrame clock tracks logical progress, speed, manual pause, and marker-hover pause independently. Use monotonic time, retain accumulated progress when changing speed, and rebase time after pauses or tab inactivity to avoid skipping plays. Suggested initial speed presets: 0.5x, 1x, 2x, 4x, 8x. Allocate the opening reveals/coin toss and game events together to approximately 420 seconds at 1x, excluding pauses. Start with modest minimum per-event display time and proportional game-clock pacing; normalize the schedule to the target and tune against readability. The lower-chart animation has its own controller and cannot change the completed main replay.

### Main Replay Chart
Implements `prd.md > Main Game Replay`.
Keep prominent "Cumulative yards gained" and secondary "Net offense + returns · yards" headings above the vertical axis. Add exact whole-number current-score badges at each team's horizontal coordinate, bold throughout and yellow for three logical playback seconds after scoring. The badges and scoreboard read the same score state; no fractional score labels appear during path animation. Separate zero-score badges with short guides to the shared center so both are readable.
D3 draws an SVG with a mirrored score axis: Bills coordinates are negative scores, Chiefs positive, but both tick labels display nonnegative actual scores. Vertical coordinates are cumulative net offense plus returns. Fixed domains derive from the complete checked game, including a below-zero margin if any cumulative total requires it. Paths contain a separate segment per event/category. For a scoring play, apply its yardage vertically then its points horizontally in the same event; conversion kicks change score with zero yards. Kicks and punts have no offensive yardage; their actual returns accrue to the returning team. Penalty-only field-position changes do not count as offensive/return yards. Scoring margin is never inferred from mirrored-path distance.

### Ticker and Event Inspector
Implements `prd.md > Key Moments and Hover Markers`.
Show play context, quarter/clock, player name or number, and key-event labels using source facts. Ticker scroll is synchronized to replay progression, not an unrelated continuous animation. A thought bubble initially lasts about three logical seconds, tuned for readability, and leaves its dot behind. Hover/focus pauses progression and reopens the same event; leaving clears only the inspection pause. Handle coincident markers with small visual offsets while retaining their true event coordinates in data. Do not show the game's result in the opening view.

### Box Score and Selected-Stat Chart
Implements `prd.md > Final Box Score and Selected-Stat Replay`.
Show both teams' passing, rushing, combined return yards, interceptions made, and opponent fumbles recovered. Passing box-score and selected-stat values use gross passing yardage; the main combined chart uses net passing after sacks. Explain this distinction in the legend. Rushing is net rushing. Clicking passing/rushing opens a lower yards-over-elapsed-game-time chart, initially Chiefs. Changing statistic/team clears and restarts only that lower chart, with direct team labels in comparison mode. Quarter markers are cumulative totals at Q1–Q4 boundaries plus the overtime ending; repeated-clock plays remain separate in source order. Historical playoff overtime in this game uses a 15-minute period, not current regular-season assumptions.

### Fourth-Down Analysis
Implements `prd.md > Fourth-Down Analysis`.
From valid completed fourth-down decisions, exclude timeouts, administrative rows and plays nullified by penalties. Count each actual play once; a replayed punt is not a second decision. Classify runs/passes including sacks as go-for-it, punts as punts, field-goal attempts by result. Use source conversion flags, touchdowns and verified possession/penalty context rather than merely comparing yards gained with distance.
Show total decisions; attempts / decisions as go-for-it percentage; conversions / attempts as success percentage. Use N/A when attempts are zero. Chiefs is default; Compare both keeps team denominators separate.
Clicking the count reveals chronological decision bars: height is yards needed (or goal-to-go), not yards gained. Green conversion, red failure, gray punt, gold made field goal, red/gray missed field goal. Labels/tooltips include team, period/clock, distance, decision, result, and score context. A zero-distance bar needs a small marker and an exact zero label. The game has no missed fourth-down field goal; its missed third-down kick must not be inserted into this chart. Synthetic missed/failure examples are test fixtures only.

## Data Source and Preparation
Use nflverse's 2021 play-by-play release, game ID `2021_20_BUF_KC`. January 2022 playoffs belong to the 2021 season. Preparation is a one-time process, not a visitor-facing fetch option.
- [Release](https://github.com/nflverse/nflverse-data/releases/tag/pbp).
- Exact GET download: `https://github.com/nflverse/nflverse-data/releases/download/pbp/play_by_play_2021.csv.gz`. No payload or key; response is gzip-compressed CSV. Filter to the game before shipping.
- [Field definitions](https://nflreadr.nflverse.com/articles/dictionary_pbp.html) and [dictionary source](https://raw.githubusercontent.com/nflverse/nflreadr/main/data-raw/dictionary_pbp.csv).
- [Data license](https://github.com/nflverse/nflverse-data/blob/main/LICENSE.md): CC BY 4.0. Include source credit, license link and modification note in data metadata, README, and app footer. Do not claim source endorsement.
- Independent check: [official NFL gamebook](https://static.www.nfl.com/image/upload/v1677629313/gamecenter/34f0d976-71ad-11ec-a493-77fb1cc3a88e.pdf). Use it to cross-check factual totals and exceptional plays, not as the runtime dependency.
- The learner's Pro-Football-Reference page remains a reference link; direct automated access was blocked. No bypass or scraping dependency is planned.

### Evidence Already Checked During Specification
Saved 189 source rows in `devpost/research/bills-chiefs-source-rows.json`. Inspected fields and computed initial totals against the gamebook:

| Check | Bills | Chiefs |
|---|---:|---:|
| Final score | 36 | 42 |
| Rushing yards | 109 | 182 |
| Gross passing yards | 329 | 378 |
| Net passing after sack losses | 313 | 370 |
| Punt + kickoff return yards | 22 | 86 |
| Combined net offense + return yards | 444 | 638 |
| Interceptions made / opponent fumbles recovered | 0 / 0 | 0 / 0 |
| Completed fourth-down decisions | 8 | 5 |
| Go-for-it attempts / conversions | 4 / 4 | 1 / 1 |

The official book confirms Kansas City won the opening toss and deferred; it also won the overtime toss and received. Retain source row order, not a numeric play-ID sort: the END GAME row has a lower ID than the final touchdown. Scores in source fields must be reconciled to actual event boundaries rather than assuming every column has identical before/after semantics.

These checks establish source feasibility; they do not mean the app's normalized dataset or charts are already verified. Preparation and full timeline reconciliation remain the first build slice. All scoring transitions and quarter totals must match the book. Review fumble/self-recovery accounting: own recoveries are not FR return production or defensive recovery counts; do not add the same movement twice. Exclude two-point conversion yardage from offense and distinguish sacks from completed-pass totals.

## Data Model
`bills-chiefs.json` stores schema version, matchup/date, winner, source/license/hash and preparation notes, opening context, ordered events, expected official totals, and a verification summary.
Each event stores stable ID and source sequence; qtr/clock and elapsed seconds; possession/return teams; down, yards needed, goal-to-go and field position; category; per-team rushing/gross passing/net passing/return deltas; scores before/after; player display identities; key-event tags; fourth-down decision/result; and short fact-based display text. One play can contain multiple yardage segments credited to different teams. Keep quarters and non-yardage scoring events.
Derived snapshots, quarter totals, box score and fourth-down summaries come from this common event model. UI-only fields (progress, speed, pause reasons, active team/stat, selected marker) live in browser memory and reset on reload. No database, accounts, cookies or stored viewing history.

## File Structure
Planned files, not files already built:
```
devpost-project/
  site/
    index.html                  # app page and controls
    styles.css                  # agreed light design
    vendor/d3-7.9.0.min.js       # pinned local library
    vendor/d3-LICENSE           # dependency attribution
    data/bills-chiefs.json      # normalized checked game
    js/app.js                   # loader and page coordination
    js/model.js                 # totals, snapshots, fourth-down calculations
    js/playback.js              # pause/speed/replay clock
    js/replay-chart.js          # mirrored score and yardage SVG
    js/events.js                # ticker, bubbles and dots
    js/analysis.js              # box score and yards-over-time SVG
    js/fourth-downs.js          # summaries and decision bars
  tools/prepare-game.mjs        # transforms retained source rows
  tools/verify-game.mjs         # timeline and official-total reconciliation
  tools/serve.mjs               # localhost-only static preview
  tools/publish.mjs             # validate/copy only public files to docs
  tests/model.test.mjs          # statistical and special-play checks
  tests/playback.test.mjs       # pause/hover/speed/replay checks
  docs/                        # generated public site copy for Pages
  devpost/                     # canonical plans and learning documents
    research/                  # retained source evidence, not served
  package.json                 # ES module setting and optional scripts
  README.md                    # local startup, demo and source credit
  .gitignore                   # preserves personal-profile/credential exclusions
```

## Important Failure Modes
- Missing/invalid game JSON: matchup, explanation, Retry. Numerical validation failures do not render a misleading replay.
- A required fact cannot be reconciled: halt data preparation and investigate before public demo; do not fabricate the kernel.
- Asset path errors on Pages: use relative URLs and test under a repository subpath before shipping.
- Pause/speed/hover interactions drifting: one logical replay clock and distinct pause reasons; check against deterministic fixtures.

## Verification and Build Order
1. Normalize the real data, document provenance and reconcile full totals, scoring timeline, quarter totals, and actual fourth downs. Fixtures cover no attempts, failures, missed fourth-down kicks, return losses and IR/FR without adding them to the real game.
2. Page, load/error/retry flow and main chart with static checked snapshots.
3. Controller, reveal/ticker, event inspection, seven-minute pacing, pause/speed/replay; verify no jumps or manual-pause cancellation.
4. Box score, selected-stat lower chart, quarters and selector.
5. Fourth-down summaries/bars and comparison, then learner hands-on review, responsive/keyboard checks, and local deployment-path check.
Use `node --test`, the real-game verifier, and a browser walkthrough; do not mark synthetic tests as evidence that real plays occurred. Record a useful learning moment and app map in the build phase. Publish only after build review.

## What Was Simplified and Why
One checked game, one browser app, one visualization library, static hosting. Data fetching/importing, additional games and high school support remain deferred. Raw research and the learner profile are not public site files. The added fourth-down view stretches the original tiny replay; separate slices keep it reviewable without adding services.

## Decisions and Open Issues
Agreed architecture: D3, verified saved data, browser app and GitHub Pages public link. Implementation detail derived from that agreement: plain modules, local D3, static preview server, shared calculations, and deployment-only public directory.
The learner's genuine uncertainty was whether an alternative to D3 would better fit this custom replay; comparison clarified flexibility versus built-in chart features. They selected D3. A related discussion separated fetching data from verifying it; live importing was deferred and saved verified data accepted.
No further architecture choice blocks this draft review. First-build investigations are explicit: full normalization, scoring boundary checks, quarter totals and exceptional-play reconciliation. GitHub account/repository setup is a shipping task. All diagrams describe the planned app, not an implemented result.


## Approval
The learner approved the technical blueprint on October 5, 2026. Proceed to 5-build; source feasibility checks do not replace the required first-slice data reconciliation.

