---
name: robot-sprite-sheet-spec
description: Complete text-only specification of the robot master sprite sheet for the Robo Jam game (every pose: idle, wave, cheer, win, sad, zap, run, bonk, mash, catch, stamp, think, look, nod, shake, dizzy, power) for an image-generation AI, with a labelled blank guide and one self-contained prompt per row. No example image needs to be sent. Use when generating, extending, checking or recolouring the robot sprites.
---

# Robot master sprite sheet (all sprites, text only)

## 0. What to send the image AI
- **Do not send an example image.** The robot is fully described in words (section 2) and every frame is described one by one (`robot-row-prompts.md`).
- Send **one row prompt at a time** from `robot-row-prompts.md`. Each prompt already contains the character description, the rules and that row's frames. Keep the same chat for all rows so the character stays consistent. If it drifts, say "keep the same character as the first row".
- `robot_master_guide_blank.png` is **for you** (and for the coding AI): the blank sheet with every frame's name under its cell, so you can see what each image represents. You may attach it to the image AI, but it is not needed. Nothing from it may appear in a sprite.

## 1. Layout
- Final master sheet: **1024 x 1152 px = 8 columns x 9 rows of 128 x 128 px frames**, transparent. Row and column positions are fixed, because the game looks sprites up by row and column (`POSE_FRAMES` in `src/js/76-robot.js`).
- The image AI does not have to hit exact pixels. Ask for one row at a time as 8 equal square cells (aspect 8:1, for example 2048 x 256). `tools/assemble_sprites.py` cuts the cells, scales them to 128 x 128, aligns the feet and writes `art/robot_master_red.png`.
- **Without the sheet the game still works**: the robots are then drawn in code with the same poses. With the sheet, `node tools/build.js` embeds it automatically.

## 2. The character (paste with every row; already inside each row prompt)
A cute, kid-friendly chibi cartoon ROBOT with a big square-ish head and a small round body. Standing height about 84 px in a 128 x 128 px frame (head about 46 px wide). HEAD: rounded-square head in light grey-blue metal (#C3CCD6) with a RED cap band across the top (#B60D18, darker red for shade, small light highlight), a dark navy face screen (#1B1F2E) showing two big round glowing CYAN eyes (#7FE8FF) and a small cyan smile, two small RED ear bolts at the sides, and a short antenna with a small RED ball on top. BODY: a rounded RED torso shell (same red as the head cap) with a dark navy chest panel showing three tiny lights (cyan, yellow, green). LIMBS: short grey metal arms and legs (#8895A6), dark navy ball hands and dark navy flat feet. STYLE: thick dark outline (#19131C, about 2 px at final size), flat colours with two shade tones, light from the top left, no gradients, no ground, no shadow, no text. Camera slightly above; the robot faces the viewer unless a frame says otherwise. RED appears on the head cap, ear bolts, antenna ball and torso shell ONLY (the game recolours red to each player's colour): no other red, pink or orange anywhere (no orange or red sparks, flames, props or lights; use cyan, white, yellow or purple for effects).

Rules for every frame: transparent background (real alpha, no white halo); keep the same scale in every frame (standing robot about 84 px tall); grounded frames have the feet resting at the bottom centre of the frame (x = 64, y = 120 of 128 x 128); jumping frames lift the feet but keep the body centred on x = 64; leave at least 4 px free around the whole character, nothing cropped; no text, numbers, labels, grid lines or guide marks in the image.

## 3. How colours and angles are handled
- **Red is the player colour.** The game shifts every red pixel (hue within 18 degrees of #B60D18, saturation above 0.45) to each player's hue at load, keeping saturation, brightness and alpha. That is why red is allowed on the head cap, ear bolts, antenna ball and torso shell only. Cyan, yellow, purple, grey and navy are never touched.
- **No rotated drawings.** Look up / left / right / down are separate head poses, flips and spins are not part of this game.
- **Run is the only side view**, facing the viewer's right.

## 4. Every row and frame
| Row | Name | Frames (left to right) |
|---|---|---|
| 0 | IDLE + WAVE | 0 Idle 1, 1 Idle 2, 2 Idle 3, 3 Idle 4, 4 Wave 1, 5 Wave 2, 6 Wave 3, 7 Wave 4 |
| 1 | CHEER + WIN | 0 Cheer 1, 1 Cheer 2, 2 Cheer 3, 3 Cheer 4, 4 Win 1, 5 Win 2, 6 Win 3, 7 Win 4 |
| 2 | SAD + ZAP | 0 Sad 1, 1 Sad 2, 2 Sad 3, 3 Sad 4, 4 Zap 1, 5 Zap 2, 6 Zap 3, 7 Zap 4 |
| 3 | RUN (SIDE VIEW) | 0 Run 1, 1 Run 2, 2 Run 3, 3 Run 4, 4 Run 5, 5 Run 6, 6 Run 7, 7 Run 8 |
| 4 | BONK + MASH | 0 Bonk 1, 1 Bonk 2, 2 Bonk 3, 3 Bonk 4, 4 Mash 1, 5 Mash 2, 6 Mash 3, 7 Mash 4 |
| 5 | CATCH | 0 Catch 1, 1 Catch 2, 2 Catch 3, 3 Catch 4, 4 Catch joy 1, 5 Catch joy 2, 6 Fumble 1, 7 Fumble 2 |
| 6 | STAMP + THINK | 0 Stamp 1, 1 Stamp 2, 2 Stamp 3, 3 Stamp 4, 4 Think 1, 5 Think 2, 6 Think 3, 7 Think 4 |
| 7 | LOOK + NOD + SHAKE | 0 Look up, 1 Look left, 2 Look right, 3 Look down, 4 Nod 1, 5 Nod 2, 6 Shake 1, 7 Shake 2 |
| 8 | DIZZY + POWER | 0 Dizzy 1, 1 Dizzy 2, 2 Dizzy 3, 3 Dizzy 4, 4 Power 1, 5 Power 2, 6 Power 3, 7 Power 4 |

Full per-frame descriptions are in `robot-row-prompts.md`. `robot_master_guide_blank.png` shows these names under each cell.

## 5. Where each pose is used in the game
- **Lobby**: Idle / Wave (row 0)
- **Bolt Bash**: Idle, Bonk (4), Zap (2)
- **Power Surge**: Mash (4), Power (8), Cheer (1)
- **Rocket Dash**: Run (3), Dizzy (8) on a stumble, Cheer (1) at the line
- **Stamp Press**: Stamp (6), Sad (2) on a miss
- **Copy Circuit**: Look (7) toward the lit pad, Think (6), Nod / Shake (7)
- **Cargo Catch**: Catch (5), Catch joy (5), Fumble (5)
- **Results**: Win (1) for 1st place, Cheer (1) for the middle, Sad (2) for last

## 6. Workflow
1. Open a new chat with the image AI. Paste the row 0 prompt.
2. Check the row against `robot_master_guide_blank.png`. Ask for fixes in the same chat ("frame 3 should look further to the left").
3. Continue row by row. Save each result as `row_00.png`, `row_01.png` and so on, all in one folder.
4. Run `python3 tools/assemble_sprites.py <folder>` (needs Pillow). Check `art/robot_master_red.png`, then `node tools/build.js` (or `run_build.bat` / `run_build.sh`).

## 7. Acceptance checklist
- [ ] Every row has the right number of frames in the right order (see the guide)
- [ ] Same robot, outline, colours and scale in every row
- [ ] Red only on the head cap, ear bolts, antenna ball and torso shell; no orange or pink effects
- [ ] Run row is a side view facing right; look rows differ clearly (up, left, right, down)
- [ ] Transparent background, nothing cropped, no text or guide marks
- [ ] In the game, all four colours (red, blue, yellow, green) look right, with no red speckles left on blue, yellow or green robots

## 8. For the coding AI
- Source of truth for names and descriptions: `tools/make_sprite_guides.py` (it generates the guide, the prompts and this file). Edit the data table there and rerun it.
- Master file: `art/robot_master_red.png` (8 x 9 frames of 128 x 128, feet at y = 120, standing height 84 px). `build.js` maps it to `EMBEDDED_ART.robot`; `src/js/76-robot.js` slices it by `POSE_FRAMES`, recolours it per player colour on a cached offscreen canvas and falls back to `procRobot()` when it is missing.
- To add a pose: add a row or frames to `ROWS`, add an entry to `POSE_FRAMES` and a matching case in `procRobot()`, rerun this script.
