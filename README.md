# Robo Jam

A same-screen party game in the spirit of *Buzz! Junior: Robo Jam*: up to four robots (humans and CPUs) compete at Robot Boot Camp in short buzzer-style minigames and the best robot becomes **Robot of the Month**. Built on the game-template shell (lobby, per-player difficulty with Adaptive, split screen, settings, pause, results, profiles, key rebinding, gamepads, touch). All code and art are original; only the idea is borrowed.

**Play:** open `dist/robo-jam.html` in a browser (no server needed). **Rebuild:** `node tools/build.js` (or `run_build.bat` / `run_build.sh`). **Test:** `npm test`.

## Controls (buzzer style)
Every player has the big red button (**OK**) and four coloured buttons (**left, up, right, down**).
| Device | Big red button | Coloured buttons |
|---|---|---|
| Keyboard 1 / 2 / 3 / 4 | Enter / Space / O / Y | Arrows / WASD / IJKL / TFGH |
| Gamepad | any face or shoulder button | d-pad or stick; face buttons by position (bottom = down, right, left, top = up) |
| Touch | BUZZ button | the four arrow buttons or the joystick |

## The games (`src/js/28-minigames.js`)
| Game | What you do |
|---|---|
| Bolt Bash | whack-a-mole: press the button matching the hole a bot pops out of (gold = 3, spiky purple = -2) |
| Power Surge | mash the big red button to fill batteries |
| Rocket Dash | race: alternate left and right to run to the finish |
| Stamp Press | stop a marker in the green zone with the big button (middle = 3 points) |
| Copy Circuit | repeat a growing light pattern (Simon says) |
| Cargo Catch | slide along five lanes, catch bolts and gold gears, dodge sparks |
| **Bumper Bots** (shared screen) | sumo on a shrinking platform: dash into rivals, KO = +2, falling = -1; you respawn, nobody is eliminated |
| **Paint Panic** (shared screen) | drive over tiles to paint them, paint over rivals, paint bomb on the big button; most tiles wins |
| **Battery Rush** (shared screen) | grab batteries (gold = 3), bank up to 3 at your corner base, dash into a carrier to make them drop everything |

The three **shared-screen** games put everybody in one arena (stick or arrows to move, big red button for the special move). They use the existing sprite poses (run is flipped to face left or right; dizzy, power and zap show hits, dashes and falls), so they need no new art. Buzzer games give every robot its own stage.

**Boot Camp** plays a different game each round from all nine (Rounds = 1, 3 or 5 games, never repeating within a series). **Buzzer Rush** uses only the six buzzer games and **Arena Bash** only the three arena games and hands out rank points to every robot, CPUs included; the last results screen crowns the Robot of the Month. Each game can also be played on its own (Game row in the lobby). Length (Short / Normal / Long) changes the time, track or number of stamps.

## Difficulty (`LEVELS` in `src/js/10-levels-profiles.js`)
Tiny / Easy / Normal / Pro / Adaptive change four numbers: `win` (size of hit windows), `slow` (speed of targets), `pen` (penalties) and `aid` (power per press). Adaptive blends Normal towards Tiny for whoever trails the leader (`ADAPT.FULL_GAP` is in progress units, 100 = one point).

## Sprites
The game runs without any art: the robots are drawn in code (`procRobot` in `src/js/76-robot.js`). To use your own sprite sheet:
1. Read `sprites/robot-sprite-sheet-spec_skill.md`; `sprites/robot_master_guide_blank.png` shows every frame.
2. Paste the prompts from `sprites/robot-row-prompts.md` into an image AI one row at a time and save the results as `row_00.png` ... `row_08.png`.
3. If the images are JPEGs or have a checkerboard / white background baked in (common with AI output), clean them first: `python3 tools/clean_ai_rows.py <raw folder> <clean folder>` (needs Pillow, numpy, scipy). Row numbers are read from the file names.
4. `python3 tools/assemble_sprites.py <clean folder>` writes `art/robot_master_red.png`.
5. Rebuild. The sheet is embedded automatically and recoloured per player (red becomes blue, yellow, green).
To change poses or frames edit the table in `tools/make_sprite_guides.py` and rerun it (it regenerates the guide, prompts and spec).

## Layout of the code
`00-core` constants / config, `10-levels-profiles` difficulty + Adaptive, `20-world` round plan, **`28-minigames` the nine games**, **`30-modes` Boot Camp + mode wrappers**, `40-audio-devices` input (buzzer edges), `50-lobby-settings`, `60-play` round loop + results, `70-layout-maps` one stage per robot + standings bars, `76-robot` robot art, `80-draw` stages / HUD / menus, `90-main` loop. Tests: `tools/tests/shell.js` (shell) and `tools/tests/robo-jam.js` (game rules). The `skills/` folder is the unchanged template documentation.

## Adding a minigame
Add an object to `GAMES` in `28-minigames.js` (id, name, blurb, lens, plan, init, step, ai, draw; see the comment at the top). For a shared-screen game set `shared:true`, add `world(dt)` (runs once per tick: movement and collisions) and `drawShared(b)`; copy Bumper Bots as a starting point, add it to the array at the bottom, and it appears in the lobby and in Boot Camp. Add a test next to the others.
