---
doc: checklist
status: approved
---

# Build Checklist

Build mode: learn — chosen by the learner; after each verified slice, provide a hands-on check and brief code orientation before committing.

## Slices

- [ ] **1. Play the real game as growing score-and-yardage paths**
  Becomes usable: Open the local app, see the matchup, press Play and watch the real checked game paths grow with a matching play ticker.
  Why now: Proves the central visual idea and highest-risk data accounting together; bootstrapping happens within this usable slice.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Main Game Replay`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Data Source and Preparation`, `spec.md > Data Model`, `spec.md > Data Loader and Game Model`, `spec.md > Main Replay Chart`, `spec.md > Where It Runs and How Someone Tries It`
  Build: Prepare the real event file with provenance, reconcile official totals and scoring/quarter boundaries, set up local D3 and static preview, implement the opening reveal, game paths and ticker with a basic single-clock playback. Include data-load validation and the error/Retry view. Keep fourth-down fields for later analysis.
  Verify (mechanical): Run the real-game verifier and Node model tests for final totals, scoring, returns, nullified plays and chronology. Start the preview, inspect the opening and real path progression in a browser, and confirm the final score and relative asset paths. Check a missing-data response and successful retry after restoration.
  Learner check: Open the app, press Play, inspect how the two paths develop, and report whether this tells the game story you imagined. The server will be started and its URL provided.
  Commit: `Add verified game data and playable football replay`

- [ ] **2. Control playback and revisit key moments**
  Becomes usable: Pause, resume, change speed and replay; inspect persistent yellow event markers and the associated player/event bubbles.
  Why now: Makes the working kernel comfortable to watch and explore before adding analysis views.
  PRD ref: `prd.md > Ticker and Playback`, `prd.md > Key Moments and Hover Markers`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Playback Controller`, `spec.md > Ticker and Event Inspector`, `spec.md > Look and Feel`
  Build: Complete speed presets, approximately seven-minute normal pacing, independent manual/hover pause reasons, Replay reset, thought bubbles and focusable/clickable yellow markers; retain agreed colors and tip labels.
  Verify (mechanical): Run playback tests for elapsed time, speed changes, pause/resume and reset. In a browser, inspect an event, leave it, confirm automatic resume, and repeat while manually paused to confirm that pause is preserved. Check Replay resets the session.
  Learner check: Try pause, speed and a yellow dot. Confirm the event stays readable, playback resumes as expected, and Replay starts at the beginning.
  Commit: `Add playback controls and inspectable game moments`

- [ ] **3. Explore the final statistics over game time**
  Becomes usable: The completed replay reveals a box score; passing/rushing clicks animate the lower chart, with team selection and quarter totals.
  Why now: Reuses the already checked game model without changing the main replay and adds the agreed comparison journey.
  PRD ref: `prd.md > Final Box Score and Selected-Stat Replay`
  Spec ref: `spec.md > Box Score and Selected-Stat Chart`, `spec.md > Data Model`
  Build: Implement the two-team box score, gross passing/net offense explanation, selected-stat chart, Chiefs-first selector, Compare both and quarter/overtime markers. Selection changes restart only the lower animation.
  Verify (mechanical): Check model/quarter totals against the saved expected values. In the browser complete a replay at faster speed, click each statistic, change teams and compare, and confirm the main chart remains unchanged.
  Learner check: Finish a replay, click passing then rushing, and try Bills/Chiefs/Compare both. Check that the selected winner appears first and the quarter markers make sense.
  Commit: `Add final box score and yardage comparison charts`

- [ ] **4. Analyse fourth-down decisions and prepare the public site**
  Becomes usable: Inspect fourth-down counts/rates and yards-needed bars for either team or both; the completed app can be previewed under the same path structure used by GitHub Pages.
  Why now: Adds the approved extension on top of established data and prepares the complete local app for final learner review before shipping.
  PRD ref: `prd.md > Fourth-Down Analysis`, `prd.md > Checkable Acceptance Criteria`
  Spec ref: `spec.md > Fourth-Down Analysis`, `spec.md > Important Failure Modes`, `spec.md > Where It Runs and How Someone Tries It`, `spec.md > Verification and Build Order`
  Build: Add fourth-down summaries, explicit denominators, chronological decision bars and color legend, tooltips, team selection and edge-case displays. Add README/source attribution and a validated site-to-docs publishing helper. Do not publish remotely in this slice.
  Verify (mechanical): Verify real fourth-down counts (Bills 8 with 4/4 conversions; Chiefs 5 with 1/1), earlier-down field-goal exclusion and nullified-play exclusion. Run isolated fixtures for N/A, goal-to-go, failed attempts and missed fourth-down kicks. Inspect tooltips, keyboard controls, responsive layout and repository-subpath asset loading; check public files exclude private planning context.
  Learner check: Open fourth-down analysis, compare teams, click the count and inspect bars. Then explore the whole app and report anything confusing, broken or worth refining.
  Commit: `Add fourth-down analysis and deployment-ready site`

## Hands-on Checkpoints

Slice 1 implementation and mechanical verification completed October 5, 2026: 189 normalized events; independent scoring/period/final-total verifier and nine model tests pass; browser replay reached Bills 36 / Chiefs 42; missing-data message and successful Retry checked. Waiting for learner feedback before the slice commit. Local preview: `node tools/serve.mjs` → `http://127.0.0.1:4173/`. Local Git author configured as Kevin Flynn with the learner-supplied GitHub no-reply address; learner feedback remains pending before the first checkpoint commit.

- [ ] Early usable behavior explored — after slice 1; feedback can shape the visual implementation before later work.
- [ ] Final kick-the-tires exploration and feedback completed — after slice 4. In learn mode, each slice also gets its listed learner check.

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — follow one project action through 2–3 real code locations, or connect already completed practice to the agent-workflow goal
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: not started
Route and stops: to be chosen from finished code
Edit outcome: not started
Reflection: not offered yet; personal answers remain in the ignored learner profile
Activity mode: guided action trace after final review, unless useful prior practice is connected instead

## Revisions
- First learner review confirmed the paths match the intended game story and requested clearer score/yardage axes. Added exact bold team-score badges with brief yellow scoring highlights and a prominent cumulative-yards heading; awaiting the learner's retry before the slice 1 commit.
- Basic pause and speed controls were introduced in slice 1 to make complete-game verification practical. Slice 2 still completes the control interactions, reset and event inspection; the agreed product behavior is unchanged.



