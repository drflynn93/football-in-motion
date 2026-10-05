---
doc: prd
status: approved
---

# Football Game Animation — Product Requirements

## Approved Requirements Amendment — October 5, 2026
The learner requested new fourth-down analysis and possible additional-game/data-source features during `4-spec`. The previously approved requirements below remain the baseline. The learner approved the amended scope and product requirements on October 5, 2026, including the labeled fourth-down proposals below. Resume technical planning; implementation still awaits an approved specification.

Requested additions: isolate fourth-down plays for both teams to analyze go-for-it, punt, and field-goal decisions; explore fetching versus verified saved data; explore adding a game, including high school play-by-play when available.

Agreed first-version boundary: add fourth-down analysis for Bills–Chiefs only. Fetching choices and importing other games, including high school games, are deferred. The fourth-down viewing interaction and its labeled details have been reviewed and approved.

Technical decisions already agreed during the interrupted specification interview: use D3 for both charts and provide a public link. After discussing fetching alternatives, the learner accepted a verified saved game-data file and GitHub Pages hosting. See spec.md for the agreed architecture.

Working descriptive title, not a final learner-chosen name. A visual replay of Bills at Chiefs, January 23, 2022, for a football viewer seeking the story behind the result.
Source: `scope.md > The Core Loop`, `The Unique Kernel`, and `Selected Game and Source Check — October 1, 2026`.

## The Core Journey
1. Open the page and see "Bills vs Chiefs · 1/23/2022" and a Play button.
2. Press Play. Reveal the horizontal scale, then the vertical scale, then the team names beside the vertical axis.
3. Show the opening coin-toss context in a scrolling play-by-play ticker at the top, if verified in the source. Animate both teams' paths as the game unfolds.
4. Allow the viewer to pause and control playback speed.
5. At the end, show a box score with typical statistics below the horizontal axis.
6. Clicking passing or rushing yards starts an animation of that statistic over game time, with markers showing quarter-end totals.

## Screens and Layout
Opening title and Play control, followed by a main chart with a play-by-play ticker above it. End-of-game box score appears below the chart's horizontal axis. The selected-stat chart appears below the main chart; it does not replace the main game visualization. Its exact position relative to the box score can be arranged during layout implementation.

## Look and Feel
Clean, light, minimal layout: white background, black text and axes. Keep green gains and red losses. Small-font team names follow the growing tips of both paths. At the shared starting point, place the Bills label just left of center and Chiefs just right; afterward each small label follows its own path tip.
Source: `scope.md > Inspiration & Identity`, refined by the learner during the PRD interview.

## Features and Behavior

### Main Game Replay
The learner revised the scope's axis arrangement: score is now horizontal, yards vertical. Both teams start at zero points and zero yards in the bottom center. Bills scores extend left from the center; Chiefs scores extend right. Each side displays actual nonnegative point values, e.g. 14, 7, 0, 7, 14. Gaining yards moves upward; negative yards move downward. Yardage without scoring does not change horizontal position. Team names follow their path tips in small text.

Interpretation note: with mirrored scores, horizontal separation is the sum of the two scores, not their margin. Do not describe that separation as the lead. This revises the original scope's vertical-gap interpretation; score labels must make the actual values clear.

Build-review refinement: each team's current actual score has a bold label at its horizontal-axis position, including values between the regular seven-point ticks. Briefly highlight the label in yellow when that team scores. Make the vertical-axis heading prominent: "Cumulative yards gained", with "Net offense + returns · yards" as its explanation.

The vertical measure remains "Offense + return yards": net rushing and passing plus punt, kickoff, interception, and opponent-fumble return yards. Do not add receiving yards a second time or include kick flight distance. A recovery without a return adds zero return yards.

Use dark green running segments, dotted green passing segments, and green PR/KR/IR/FR patterns for return categories. Losses are red. Present key-event and player context from `scope.md > The POC Boundary` through the ticker and thought bubbles described below.

### Ticker and Playback
Scrolling play-by-play appears at the top and follows the displayed game progression. Normal-speed playback takes about seven minutes, excluding pauses. Pause and adjustable speed are required. After the full game finishes, show a Replay button to start the full game again from the beginning. Exact speed choices and the pacing of individual plays still need definition; the seven-minute target is learner-decided.

### Key Moments and Hover Markers
Key events show a brief thought bubble containing the event and relevant player details, then the bubble disappears and leaves a yellow dot at the event's location on the team path. Hovering over a dot brings the same information back and pauses playback so the viewer can read it. Leaving the dot resumes automatically from the same moment, rather than restarting the game. Preserve a pre-existing manual pause; that guard was included in the reviewed plan and approved. Exact transient bubble duration remains to be tuned for readability.

### Final Box Score and Selected-Stat Replay
Show a two-team box score beneath the horizontal axis after the real replay finishes, with passing yards, rushing yards, total return yards, interceptions made, and opponent fumbles recovered. Total return yards combines punt, kickoff, interception, and opponent-fumble returns consistently with the main chart. Interceptions and fumble recoveries are counts, not yardage; show zero when no such events occurred. Passing and rushing yardage entries are clickable. A click animates the selected category as yards over game time in a chart below the main chart, with quarter-total markers. The lower chart has a team selector with Bills, Chiefs, and Compare both options. Viewers can inspect one team or compare both for the selected statistic. When the lower chart first opens, show the winning team (Chiefs for this game), with Compare both visibly available. Changing the selected statistic or team restarts only the lower animation, leaving the completed main chart intact. The lower chart uses elapsed game time, including overtime, with Q1–Q4 and overtime-ending markers.

### Fourth-Down Analysis
Show fourth-down count, go-for-it count and percentage, and successful-conversion count and percentage. Go-for-it percentage is go-for-it attempts divided by all fourth-down decisions. Success percentage is successful conversions divided by go-for-it attempts: the learner confirmed 3 out of 4 equals 75%. Clicking the fourth-down count opens a bar chart with one bar for each fourth-down decision; bar height represents yards needed for a first down, not yards gained. Reuse the Bills / Chiefs / Compare both selector, initially showing Chiefs, as confirmed by the learner. In Compare both, show separate summaries for each team and identify each team's bars.

Use the learner's agreed result colors: green for successful go-for-it plays; red for failed go-for-it plays; gray for punts; gold for made field goals; red/gray for missed field goals. The precise red/gray treatment can be implemented as a distinguishable pattern with a legend.

This is descriptive analysis of observed decisions and outcomes, not a model recommending the best decision.

Details approved in the amended-plan review: order bars chronologically; identify team and game clock; show exact distance, decision, and outcome on hover. Render missed field goals with a red/gray pattern and a legend. If there are no fourth-down decisions, show a zero count and no-bars message; if there are no go-for-it attempts, show conversion success as "N/A" rather than dividing by zero. Fourth-and-goal distances require an explicit goal-to-go label rather than suggesting a new first down is possible.

## Checkable Acceptance Criteria
- Fourth-down summaries report total decisions, go-for-it attempts and percentage, and conversions and percentage with the defined denominators.
- Clicking the fourth-down count shows yards-needed bars with the specified outcome colors.
- Fourth-down analysis supports Bills, Chiefs, and Compare both, initially showing Chiefs.
- If game data cannot be displayed, the matchup remains visible with an explanatory message and a Retry button. Retry attempts to display the same game again; if it still fails, the error remains available instead of showing a blank or invented replay.
- The selected-stat chart can show Bills alone, Chiefs alone, or both teams together through its team selector. It initially shows the winning team, Chiefs, with Compare both visible.
- Opening view displays the selected matchup, corrected date, and Play control.
- Play reveals axes in the learner's specified order before the growing paths.
- Score moves Bills left and Chiefs right; yardage moves vertically. Yardage-only plays keep the same horizontal coordinate.
- Each path carries a small team-name label at its tip. At the shared starting point, Bills sits just left of center and Chiefs just right, keeping both labels readable.
- Gains, losses, and categories use the agreed styles.
- Pause stops replay progression; playback speed changes its rate.
- The real replay reaches the verified final score: Bills 36, Chiefs 42, including overtime.
- A box score appears below the horizontal axis on completion, with both teams shown for passing yards, rushing yards, total return yards, interceptions made, and opponent fumbles recovered. Zero event counts are displayed.
- A Replay button is available after completion and restarts the full game from the beginning.
- A key-event thought bubble leaves a persistent yellow marker after disappearing.
- Hovering a yellow marker redisplays its event/player information and pauses progression.
- Leaving a marker resumes a previously running replay at the same point, without resetting progress.
- The full game takes approximately seven minutes at normal speed, excluding pauses.
- Clicking passing or rushing yards animates that selected statistic over game time and displays quarter-end totals.
Source: learner-described journey and `scope.md > What "Working" Looks Like`.

## States and Boundaries
- **Opening:** matchup/date and Play; replay has not begun.
- **Playing:** revealed chart, synchronized ticker, growing paths, playback controls.
- **Paused:** current visual state is retained. The viewer can resume from the same point using the playback control. Hover-paused playback resumes on leaving the marker; a pre-existing manual pause is preserved.
- **Finished:** complete game visualization and box score; final score is visible, with a Replay button to start the full game again.
- **Selected-stat replay:** yards-over-time animation with quarter markers, below the main chart. The main game visualization stays visible.
- **Data error:** keep the matchup visible, show a message explaining that the game cannot be displayed, and provide a Retry button to attempt the same game again. Do not replace it with a fabricated or misleading partial replay.
- **Data limitations:** this real game has no interceptions or opponent-fumble recoveries, so IR/FR segments do not occur. Do not invent them. Verify required player/return details during specification; unresolved gaps in essential data must be resolved before building the real replay.

## Product Decisions
- If game data cannot be displayed, show a message with a Retry button.
- Add total return yards, interceptions, and fumble recoveries to the final box score. Only passing and rushing entries are currently specified as interactive.
- The lower chart offers Bills, Chiefs, and Compare both options for the selected statistic, initially showing the winning team with Compare both visible.
- One real game remains the demonstration boundary.
- Score extends horizontally away from a shared center; yards grow vertically. This deliberately replaces the earlier scope axis arrangement.
- Small team-name labels follow path tips.
- Light black-and-white layout retains green/red data marks.
- End-of-game statistics allow selected passing/rushing replays with quarter-total markers.
- Selected-stat replay uses yards over time, not the main score-versus-yards layout.
- Selected-stat replay appears below the main chart rather than replacing it.
- A Replay button lets viewers start the full game again after it finishes.
- Brief thought bubbles leave yellow event dots for later inspection; hovering pauses playback.
- Leaving a hovered dot automatically resumes playback from the same moment.
- Normal-speed full-game replay takes about seven minutes.

## What We're Building
One game replay, readable play/player context, pause and speed control, final box score, a small selected-stat replay for passing or rushing yards, and fourth-down summaries and decision bars for the same game.

## Deferred From the POC
Multiple games and game selection remain deferred to preserve the one-game demonstration boundary. Cleat and football symbol lines were considered and rejected in scope; preserve the agreed simpler styles.
Fetching choices and importing other games, including high school play-by-play, are also deferred by learner agreement during the October 5 revision.

## Review and Remaining Verification
The learner approved the displayed product plan on October 5, 2026, including the labeled proposals: elapsed game time with Q1–Q4 and overtime-ending markers; changes to statistic or team restart only the lower animation; and leaving a hovered marker preserves a pre-existing manual pause.

Exact speed presets, bubble duration, and per-play timing can be tuned for readability without changing the agreed experience. The working descriptive title remains in use; no final submission name has been chosen.

For technical planning: verify opening coin toss, separate play and return distances, NFL sack accounting, and a usable source. Do not fabricate unavailable context.


