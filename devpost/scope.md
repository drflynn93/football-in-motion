---
doc: scope
status: approved
---

# Football Game Animation

Final project name chosen by the learner during shipping: **Football in Motion**. Repository name: `football-in-motion`.

## Later Approved Design and Build Record
The PRD interview revised the original axis arrangement recorded below: actual scores extend horizontally from zero (Bills left, Chiefs right); cumulative net offensive and return yards grow vertically. Horizontal separation is the sum of scores, not the scoring margin. Exact score labels communicate the current score. The completed, reviewed proof of concept uses Bills–Chiefs, January 23, 2022, with replay controls, inspectable key moments, final passing/rushing comparisons and fourth-down analysis. The original scope below is retained as planning history; the approved PRD and technical spec describe the final design.

## Approved Scope Amendment — October 5, 2026
The learner explicitly requested revisiting the plan during technical planning. Previously approved decisions below remain the baseline; the following additions were considered during the revision:
- Analyze fourth-down plays for both teams: going for a first down, punting, or attempting a field goal. Define whether this is a filtered replay, a separate analysis view, or both, and what decision context is shown.
- Explore a choice between fetching game data and using a verified saved game.
- Explore adding other games, including high school games when suitable play-by-play is available.
The learner agreed to keep the first version to Bills–Chiefs with fourth-down analysis. Fetching options, additional games, and high school game importing are deferred. The learner approved the fourth-down interaction and amended plan on October 5, 2026; resume technical planning.

Working descriptive title: a quick visual replay of one football game that tells more of its story than a final score or box score. The learner selected Buffalo Bills at Kansas City Chiefs, January 23, 2022 (NFL), after initially exploring college football. The one-game boundary is unchanged.

## The Unique Kernel
Two team paths evolve through the plays: horizontal movement represents a custom combined total of net offensive yards and return yards, while height represents each team's actual score. Their vertical gap shows the real scoring margin as it changes, helping a viewer recognize a close game, a blowout, a comeback, or late scoring after a game was largely decided. Label the horizontal measure "Offense + return yards" so it is not mistaken for standard total offense.

## Who It's For
A college football viewer who wants the story behind a result without reading a long play-by-play. The learner contrasted similar final scores that conceal very different game experiences.

## The Core Loop
Open the visualization for one preloaded game and watch both teams' paths develop in play order, with important events providing context. The first version demonstrates one game rather than a game-selection service. Playback controls will be defined in the PRD.

## Inspiration & Identity
Animated D3-style visualization. Both teams begin at zero yards and zero points. Dark green segments represent runs, dotted green segments represent passes, and green "PR" and "KR" patterns represent punt and kickoff returns. Green "IR" patterns represent interception returns; green "FR" patterns represent returns after recovering an opponent's fumble. All return yards add to the returning team's horizontal total. Recoveries without a return add zero return yards. Negative yardage, including return losses, uses red and moves backward. Key moments may pop up as "First down!" or "Touchdown!" Team identification and precise visual encoding remain to be defined.

## Why This Matters to the Learner
Enjoys college football and AI-assisted animated visualizations. Wants to improve "agentic ai workflows" and teach students the planning and collaboration process, with brief teaching takeaways along the way.

## What "Working" Looks Like
One real game's plays drive an animation of both teams' cumulative yards and actual scores. The viewer can see what the score was when scoring occurred and how the lead changed rather than seeing only quarter totals. Relevant player names or numbers and key events give the replay context. A short screen demonstration should make the game's changing competitiveness apparent.

## The POC Boundary
- Approved October 5 amendment: add fourth-down decision analysis for the same game. Show fourth-down counts, go-for-it rates, conversion success, and clickable yards-needed bars colored by decision/outcome, with Bills / Chiefs / Compare both selection. No fetching or additional-game importing in this first version.
- One preloaded real college football game; the learner confirmed "1 game is enough."
- Yardage progression and actual score form the central visual story.
- The custom horizontal total combines net rushing and passing yards with punt and kickoff return yards. The draft also includes interception and opponent-fumble return yards, with categories kept distinguishable. Do not count receiving yards again or count the flight of a kick as return yards.
- Preserve the desire to distinguish rushing and passing; the exact presentation will be settled in the PRD.
- Key-event context, including first downs, touchdowns, interceptions, sacks, and fumbles, with relevant player names or numbers where the selected data supports them. Coverage and fallback behavior must be defined before building.
- Target roughly 2–4 hours of active work, with a short demo video and public GitHub repository for submission. Deployment is optional.

## Later
Supporting multiple games or game selection is outside this first demonstration.
Fetching versus saved-data options and importing additional games, including high school games, are deferred by learner agreement on October 5, 2026. A future importer would need to validate and normalize available play-by-play.

## Explicitly Cut
No additional features have been explicitly cut. Avoid adding features without a learner decision.

## Open Decisions for Planning
Select the game and verify a usable play-by-play source, including separate return distances. Define precise yardage accounting, treatment of field goals and safeties, and player-detail availability. Credit return movement to the returning team; distinguish offensive movement before a turnover from movement after it. These details must support the score-and-yardage story without expanding the one-game scope. No data source, stack, or detailed screen design has been chosen.

## Selected Game and Source Check — October 1, 2026
- Learner-selected source: https://www.pro-football-reference.com/boxscores/202201230kan.htm#all_pbp
- Game: Buffalo Bills at Kansas City Chiefs, January 23, 2022; Chiefs won 42–36 in overtime. This changes the demonstration from college football to NFL.
- Direct automated access to the supplied page returned HTTP 403; its play-by-play contents were not verified directly.
- An official NFL gamebook was inspected as corroborating evidence: https://static.www.nfl.com/image/upload/v1677629313/gamecenter/34f0d976-71ad-11ec-a493-77fb1cc3a88e.pdf
- The gamebook includes play-by-play, scoring, player identities, roster numbers, and return statistics. There were no interceptions or opponent-fumble recoveries, so the real game cannot demonstrate IR/FR segments. Keep those categories in the design; separate synthetic verification examples may be needed during build, clearly distinguished from the real replay.
- NFL sack accounting must be reflected in the yardage definition; do not silently carry over college-football assumptions. Implementation source and extraction approach remain undecided.
