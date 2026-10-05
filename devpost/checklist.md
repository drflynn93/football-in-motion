---
doc: checklist
status: approved
---

# Build Checklist

Build mode: learn — chosen by the learner; after each verified slice, provide a hands-on check and brief code orientation before committing.

## Slices

- [x] **1. Play the real game as growing score-and-yardage paths**
  Becomes usable: Open the local app, see the matchup, press Play and watch the real checked game paths grow with a matching play ticker.
  Why now: Proves the central visual idea and highest-risk data accounting together; bootstrapping happens within this usable slice.
  PRD ref: `prd.md > The Core Journey`, `prd.md > Main Game Replay`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Data Source and Preparation`, `spec.md > Data Model`, `spec.md > Data Loader and Game Model`, `spec.md > Main Replay Chart`, `spec.md > Where It Runs and How Someone Tries It`
  Build: Prepare the real event file with provenance, reconcile official totals and scoring/quarter boundaries, set up local D3 and static preview, implement the opening reveal, game paths and ticker with a basic single-clock playback. Include data-load validation and the error/Retry view. Keep fourth-down fields for later analysis.
  Verify (mechanical): Run the real-game verifier and Node model tests for final totals, scoring, returns, nullified plays and chronology. Start the preview, inspect the opening and real path progression in a browser, and confirm the final score and relative asset paths. Check a missing-data response and successful retry after restoration.
  Learner check: Open the app, press Play, inspect how the two paths develop, and report whether this tells the game story you imagined. The server will be started and its URL provided.
  Commit: `Add verified game data and playable football replay`

- [x] **2. Control playback and revisit key moments**
  Becomes usable: Pause, resume, change speed and replay; inspect persistent yellow event markers and the associated player/event bubbles.
  Why now: Makes the working kernel comfortable to watch and explore before adding analysis views.
  PRD ref: `prd.md > Ticker and Playback`, `prd.md > Key Moments and Hover Markers`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Playback Controller`, `spec.md > Ticker and Event Inspector`, `spec.md > Look and Feel`
  Build: Complete speed presets, approximately seven-minute normal pacing, independent manual/hover pause reasons, Replay reset, thought bubbles and focusable/clickable yellow markers; retain agreed colors and tip labels.
  Verify (mechanical): Run playback tests for elapsed time, speed changes, pause/resume and reset. In a browser, inspect an event, leave it, confirm automatic resume, and repeat while manually paused to confirm that pause is preserved. Check Replay resets the session.
  Learner check: Try pause, speed and a yellow dot. Confirm the event stays readable, playback resumes as expected, and Replay starts at the beginning.
  Commit: `Add playback controls and inspectable game moments`

- [x] **3. Explore the final statistics over game time**
  Becomes usable: The completed replay reveals a box score; passing/rushing clicks animate the lower chart, with team selection and quarter totals.
  Why now: Reuses the already checked game model without changing the main replay and adds the agreed comparison journey.
  PRD ref: `prd.md > Final Box Score and Selected-Stat Replay`
  Spec ref: `spec.md > Box Score and Selected-Stat Chart`, `spec.md > Data Model`
  Build: Implement the two-team box score, gross passing/net offense explanation, selected-stat chart, Chiefs-first selector, Compare both and quarter/overtime markers. Selection changes restart only the lower animation.
  Verify (mechanical): Check model/quarter totals against the saved expected values. In the browser complete a replay at faster speed, click each statistic, change teams and compare, and confirm the main chart remains unchanged.
  Learner check: Finish a replay, click passing then rushing, and try Bills/Chiefs/Compare both. Check that the selected winner appears first and the quarter markers make sense.
  Commit: `Add final box score and yardage comparison charts`

- [x] **4. Analyse fourth-down decisions and prepare the public site**
  Becomes usable: Inspect fourth-down counts/rates and yards-needed bars for either team or both; the completed app can be previewed under the same path structure used by GitHub Pages.
  Why now: Adds the approved extension on top of established data and prepares the complete local app for final learner review before shipping.
  PRD ref: `prd.md > Fourth-Down Analysis`, `prd.md > Checkable Acceptance Criteria`
  Spec ref: `spec.md > Fourth-Down Analysis`, `spec.md > Important Failure Modes`, `spec.md > Where It Runs and How Someone Tries It`, `spec.md > Verification and Build Order`
  Build: Add fourth-down summaries, explicit denominators, chronological decision bars and color legend, tooltips, team selection and edge-case displays. Add README/source attribution and a validated site-to-docs publishing helper. Do not publish remotely in this slice.
  Verify (mechanical): Verify real fourth-down counts (Bills 8 with 4/4 conversions; Chiefs 5 with 1/1), earlier-down field-goal exclusion and nullified-play exclusion. Run isolated fixtures for N/A, goal-to-go, failed attempts and missed fourth-down kicks. Inspect tooltips, keyboard controls, responsive layout and repository-subpath asset loading; check public files exclude private planning context.
  Learner check: Open fourth-down analysis, compare teams, click the count and inspect bars. Then explore the whole app and report anything confusing, broken or worth refining.
  Commit: `Add fourth-down analysis and deployment-ready site`

## Hands-on Checkpoints

Slice 4 implemented and mechanically verified October 5, 2026; learner approved the fourth-down view and final exploration with “looks good”; saved as checkpoint 04e7d78. Thirty-two Node tests pass, including independent denominators, N/A, nullified/earlier-down exclusions, conversion/failure/punt/field-goal colors, goal-to-go/zero labels, synthetic IR/FR/lost-return accounting, and repository-subpath hosting/privacy checks. Independent real-game verifier passes. Browser verified Chiefs-first summaries, Bills 8 and Chiefs 5 bars, chronological 13-bar comparison, click details and keyboard Enter/Escape with score-before/after context. Responsive views checked at 390 and 1280 requested viewport widths; no horizontal page overflow; override reset. Prepared 12 matching public files in docs and verified real browser startup/Play at /football-demo/; nothing uploaded. README includes startup/resume and data/license explanations. Final hands-on review is complete; no further changes requested.

Slice 3 implemented and mechanically verified October 5, 2026; learner approved the comparison view and the slice was committed. Twenty-three Node tests and the independent game verifier pass. Browser verified box score values, Chiefs as first selection with Compare both visible, Bills/Chiefs/both choices, passing-to-rushing restart, all five passing/rushing period totals, and an unchanged completed main SVG. After readability/end-bubble refinements, reran a complete 8x replay and checked the updated passing comparison and clean finish. Preview left on the completed passing comparison; the learner can immediately explore box-score choices.

Slice 2 implemented and mechanically verified October 5, 2026; learner confirmed expected behavior and the slice was committed. Nineteen Node tests pass (ten game-model and nine playback checks); independent real-game verification still passes. Browser checks covered marker hover/focus, automatic resume, preserving manual pause, keyboard Enter, click-to-pin/Close, speed selection and Replay clearing score/markers. Fixed a real narrow-layout click failure and repeated click/close/pause/Replay checks successfully. Preview left with an earlier touchdown open for inspection.

Slice 1 implementation and mechanical verification completed October 5, 2026: 189 normalized events; independent scoring/period/final-total verifier and nine model tests pass; browser replay reached Bills 36 / Chiefs 42; missing-data message and successful Retry checked. Learner confirmed the game story and approved clearer axis labels; slice 1 committed. Local preview: `node tools/serve.mjs` → `http://127.0.0.1:4173/`. Local Git author configured as Kevin Flynn with the learner-supplied GitHub no-reply address; first checkpoint saved.

- [x] Early usable behavior explored — after slice 1; feedback can shape the visual implementation before later work.
- [x] Final kick-the-tires exploration and feedback completed — after slice 4. In learn mode, each slice also gets its listed learner check.

## Final Review

- [x] Final review complete — checks pass; learner approved the completed app October 5, 2026, with no additional revisions requested.

## Code Tour and App Map

- [x] Learning activity complete — follow one project action through 2–3 real code locations, or connect already completed practice to the agent-workflow goal
- [x] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [x] `devpost/app-map.html` generated from finished code, source-checked, and provided as a file link; visual browser preview unavailable (local-file URL policy). Includes a project-grounded practice to reuse.

Activity and evidence: evidence-based recap of actual axis refinement: learner requested clearer score and yardage axes, tried the changes and approved them. Exact-score transition/highlight/reset behavior has a model test; browser review and learner feedback established presentation readability. Connected this completed practice to an observable requirement → verification → hands-on review → checkpoint workflow. No claim of mastery.
Route and stops: reference route in the map: model.js / fourthDownSummary → fourth-downs.js / refresh → fourth-downs.js / draw. Source paths and anchors checked; no interactive editor tour claimed.
Edit outcome: previously completed and approved axis refinement supplies the practice evidence. Optional later heading edit offered in the map; no new edit performed or required.
Reflection: optional transfer reflection offered as a follow-up with the map; no answer supplied or required for completion. Personal answers belong in the ignored learner profile.
Activity mode: completed-practice connection and evidence-based recap, with an untoured reference route. Map has inline CSS and no scripts or fetched resources. Relative links checked; file-open requested in Codex (queued), file link provided in handoff. Offline visual rendering could not be checked because the in-app browser rejects file URLs.

## Revisions
- Slice 3 browser review separated the closely spaced Q4/OT labels for readability. It also revealed that the final transient bubble could remain visible when the main clock stopped; completed playback now clears automatic bubbles while retaining dot inspection.
- Slice 2 browser testing found that the longer inspection-pause button label could wrap the controls and move the dot during a click on narrow screens. Reserved a stable button width so inspection does not move the chart.
- First learner review confirmed the paths match the intended game story and requested clearer score/yardage axes. Added exact bold team-score badges with brief yellow scoring highlights and a prominent cumulative-yards heading; learner retried and approved; included in the slice 1 checkpoint.
- Basic pause and speed controls were introduced in slice 1 to make complete-game verification practical. Slice 2 still completes the control interactions, reset and event inspection; the agreed product behavior is unchanged.




- Optional Discord project-thread suggestion made after the first checkpoint; no message sent.

## Shipping — started October 5, 2026

- [x] Readiness rechecked: 32 tests pass; verifier reconciles 189 events, 21 scoring changes, five period totals, returns and fourth downs. Documented preview responds successfully. Learner additionally tried the complete app and reported liking it.
- [x] Initial publication review: five local commits inspected; learner profile and credential files absent from tracked history. Credential-pattern matches in tools/publish.mjs are the scanner's own pattern strings, not credentials. Canonical scope and HTML planning companions reviewed for deliberate inclusion; added clear finished-project notes while retaining the planning history. Personal profile remains ignored.
- [x] Current public contest requirements checked at https://learn-ai-basics.devpost.com/ and /rules. Overview specifies a 1–3 minute video; rules say less than three minutes, publicly visible on YouTube or Vimeo. Plan for at least one minute and under three minutes. Public GitHub/GitLab/Bitbucket repository must contain scope.md, prd.md and spec.md; rules also call for an open-source license. A live app link is optional.
- [ ] Confirm any already-created repository or video links with learner; none saved in project yet.
- [x] Learner chose Football in Motion / football-in-motion and approved MIT licensing for original app code. Root LICENSE names Kevin Flynn; D3 ISC and football-data CC BY 4.0 terms remain separate.
- [x] Learner chose Football in Motion / football-in-motion and explicitly authorized creating the public drflynn93 repository, uploading the reviewed app/planning files and enabling Pages, after being told included files and history will be public and the learner profile stays excluded.
- [ ] Verify public repository without authentication and record URL in spec.
- [ ] Publish the agreed GitHub Pages app and verify public URL; record in spec.
- [ ] Learner records/uploads demo; verify public video URL and record in spec.
- [ ] Read actual signed-in submission form and its exit-survey prompts. Public form view did not expose the editable fields. Do not assume exact required fields from generic Devpost forms.
- [ ] Learner writes project name, description, required answers and exit survey; agent may identify gaps and correct spelling/grammar only.
- [ ] Learner submits on Devpost and confirms completion. Nothing has been submitted or published remotely.

Contest deadline shown October 5: October 26, 2026, 5:00 p.m. Eastern. Sources above are requirements evidence, not authorization to publish or accept terms.

Shipping access: GitHub CLI is not installed; Git credential manager is available. GitHub repository creation opened in the in-app browser, which requires the learner to sign in directly. No password/token requested in chat. MIT code-license choice approved and added. No repository created or pushed yet.
