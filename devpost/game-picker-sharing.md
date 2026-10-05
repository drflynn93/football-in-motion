# Sharing the separate game picker

The learner approved the working extension and requested publication for sharing on October 5, 2026.

- Original contest app: https://drflynn93.github.io/football-in-motion/
- Separate game-picker destination: https://drflynn93.github.io/football-in-motion/game-picker/
- Picker source and tests: the `multi-game` branch of the existing public repository.
- The existing Pages setup publishes `main` / `docs`; reviewed picker assets are copied into `docs/game-picker/`. Original root assets are preserved. The original publication helper audits this extra directory and leaves it intact.
- Picker includes 565 source-checked NFL games from 2021 and 2025. Five source games are explicitly unavailable. Only the original Bills–Chiefs example has independent official-gamebook reconciliation.
- No account, local server, API key or sports-site login is needed for visitors. Loading another game resets replay and analysis. College, high-school and arbitrary game imports are outside this first picker.

Local checks passed before publication: 40 picker tests, all catalog games validated, original official verifier, Browns–Chiefs replay and comparisons, Packers–Cowboys overtime tie, Retry recovery, resetting during replay, narrow layout. Public-link verification follows deployment.

Publication verified: catalog responds publicly with 565 games; the original root app still responds with its original layout; the 2025 Packers–Cowboys file responds with 211 events; the repository is publicly readable. Live browser selection of Browns loads the new matchup and starts replay. Sharing does not require keeping the learner's PC on.

To update the picker, prepare and test `docs/` on `multi-game`, copy those reviewed public assets into `main`'s `docs/game-picker/`, audit them, and commit/push main. Do not overwrite the root app unless the learner requests it. Keep ignored source downloads, private learner context and local credentials out of public history.
