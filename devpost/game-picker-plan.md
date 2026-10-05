# Football in Motion — separate game-picker version

Requested by the learner after the reviewed one-game contest app was published. Work lives on the `multi-game` branch in an isolated checkout; the live `main` site remains unchanged.

## First usable version

Choose an included NFL season, optionally filter by team, choose a matchup/date, then load and replay that game with the existing score/yardage paths, player moments, passing/rushing comparisons and fourth-down decisions. Start with 2021 and 2025 season catalogs, excluding games that fail source checks. The 2021 Bills–Chiefs example remains available and retains its independent official-gamebook verification.

## Data and truthfulness

Prepare individual game files from nflverse season releases, with source attribution and structural/scoring checks. Additional games are source-validated, not claimed to be independently reconciled against official gamebooks. Downloading and normalizing happens locally during preparation; visitors load only a catalog and their selected game. No API keys or live scraping. Pro Football Reference remains a reference link rather than a runtime dependency because automated access was blocked earlier. College and high-school importing are outside this first picker; league choice can be revisited if requested.

## Required changes

- Remove hardcoded Bills/Chiefs teams, names, final scores, chart limits and overtime duration assumptions from the shared model and views.
- Reset old clocks, inspection state and analysis handlers when loading another game; show loading/error/Retry explicitly and prevent stale requests from replacing a newer selection.
- Source team options from each game; default to winner, or away team for a tie. Keep explicit percentage denominators and chronological bars.
- Keep source order and distinguish nullified plays; exclude two-point attempts from offensive yardage.
- Determine period boundaries from each selected game's actual events; handle regulation endings, regular-season overtime, playoff overtime and ties.
- Catalog preparation validates every generated game, reports unusable source games explicitly, and retains the official verifier for the original example.

## Verification

Existing tests and original official verifier remain passing. Add meaningful checks for arbitrary teams, regulation/overtime/tie games, source normalization, catalog filtering, invalid game data and loading races. Browser-check a different matchup, reset during playback, team filtering, fourth-down analysis and narrow layout. Save a local checkpoint and provide a separate preview for learner review before any new-version publication.

## Implementation and review record

- 565 selectable saved games: 283 in 2021 and 282 in 2025. Five excluded source games are disclosed in the picker, with reasons. Visitors download only the selected game, approximately 0.12 MB on average.
- Shared model, scoring badges, yardage paths, player moments, stat comparisons and fourth-down analysis now use each game's own teams and scale. Winner-first analysis defaults to away team for ties.
- Local replay preview: `http://127.0.0.1:4175/`. The original public site remains on main. Prepared assets under docs are local only.
- The original official-gamebook verifier still passes. Automated checks cover every catalog game, home/away filtering, quoted CSV descriptions, missing scores, overtime clocks, failed loads, cancelled and out-of-order requests, and the browser fetch receiver.
- Browser checks exercised Browns–Chiefs regulation replay, passing comparison, fourth-down comparisons, changing to Packers–Cowboys in 2025, and a narrow layout without horizontal overflow. Browser testing caught and corrected the fetch receiver issue.
- Final verification: all 40 automated tests pass. Packers–Cowboys finishes 40–40 with overtime and tie labels; its analysis defaults to Packers. A deliberately missing local game shows Retry, then recovers after restoration. Loading a different game during a paused replay resets all old analysis. The narrow picker has no horizontal overflow. The official example verifier continues to pass.
- Learner hands-on review is pending; publication of this separate version is pending.

## Follow one game selection through the code

1. `site/js/picker.js` filters the catalog and loads one game. Its cancellation guard prevents an older, slow response from replacing a newer selection.
2. `site/js/app.js` stops the old replay, validates the newly loaded game and updates names, selectors and score displays.
3. `site/js/model.js` accumulates that game's plays; the existing chart and analysis modules render the resulting model.

Teaching point: expanding from one example to a chooser exposes hidden assumptions (team names, final scores, overtime length). Test different kinds of games and then test the actual controls in a browser. Source-data checks and independent verification are different claims.
