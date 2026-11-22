# Row prompts for the image AI (robot sheet)

Paste ONE prompt at a time. Each prompt is complete on its own, so you do not need to send an example image. Generate the rows in order; keep using the same chat so the character stays consistent, and if the character drifts, say "keep the same character as the first row".

Exact pixels are not needed: ask for 8 equal square cells in one row (aspect 8:1, for example 2048 x 256). `tools/assemble_sprites.py` cuts and resizes the cells. Save the results as `row_00.png` ... `row_08.png`.

## Row 0: IDLE + WAVE

```
Draw ONE ROW of a sprite sheet for a kids' robot party game: 8 frames side by side in a single transparent PNG made of 8 equal SQUARE cells (aspect 8:1, for example 2048 x 256); fill cells 1 to 8 from the left and leave the remaining cells empty. Every cell is 128 x 128 pixels in proportion.

CHARACTER: A cute, kid-friendly chibi cartoon ROBOT with a big square-ish head and a small round body. Standing height about 84 px in a 128 x 128 px frame (head about 46 px wide). HEAD: rounded-square head in light grey-blue metal (#C3CCD6) with a RED cap band across the top (#B60D18, darker red for shade, small light highlight), a dark navy face screen (#1B1F2E) showing two big round glowing CYAN eyes (#7FE8FF) and a small cyan smile, two small RED ear bolts at the sides, and a short antenna with a small RED ball on top. BODY: a rounded RED torso shell (same red as the head cap) with a dark navy chest panel showing three tiny lights (cyan, yellow, green). LIMBS: short grey metal arms and legs (#8895A6), dark navy ball hands and dark navy flat feet. STYLE: thick dark outline (#19131C, about 2 px at final size), flat colours with two shade tones, light from the top left, no gradients, no ground, no shadow, no text. Camera slightly above; the robot faces the viewer unless a frame says otherwise. RED appears on the head cap, ear bolts, antenna ball and torso shell ONLY (the game recolours red to each player's colour): no other red, pink or orange anywhere (no orange or red sparks, flames, props or lights; use cyan, white, yellow or purple for effects).

Rules for every frame: transparent background (real alpha, no white halo); keep the same scale in every frame (standing robot about 84 px tall); grounded frames have the feet resting at the bottom centre of the frame (x = 64, y = 120 of 128 x 128); jumping frames lift the feet but keep the body centred on x = 64; leave at least 4 px free around the whole character, nothing cropped; no text, numbers, labels, grid lines or guide marks in the image.

ROW NOTE: Calm standing loop and a friendly wave. Used in the lobby and while waiting.

FRAMES, left to right:
1. Idle 1: Standing relaxed, arms hanging, neutral smile. Idle loop frame 1.
2. Idle 2: Idle loop frame 2: body bobs up slightly, antenna ball a little higher.
3. Idle 3: Idle loop frame 3: top of the bob, eyes blink (thin cyan lines).
4. Idle 4: Idle loop frame 4: settling back down, eyes open.
5. Wave 1: Right arm (viewer's right) raised out and up, hand open, big smile. Wave loop frame 1.
6. Wave 2: Wave loop frame 2: raised arm swings outward.
7. Wave 3: Wave loop frame 3: raised arm swings back inward, head tilts slightly.
8. Wave 4: Wave loop frame 4: arm at the outer position again, eyes happy (cyan arcs).
```

## Row 1: CHEER + WIN

```
Draw ONE ROW of a sprite sheet for a kids' robot party game: 8 frames side by side in a single transparent PNG made of 8 equal SQUARE cells (aspect 8:1, for example 2048 x 256); fill cells 1 to 8 from the left and leave the remaining cells empty. Every cell is 128 x 128 pixels in proportion.

CHARACTER: A cute, kid-friendly chibi cartoon ROBOT with a big square-ish head and a small round body. Standing height about 84 px in a 128 x 128 px frame (head about 46 px wide). HEAD: rounded-square head in light grey-blue metal (#C3CCD6) with a RED cap band across the top (#B60D18, darker red for shade, small light highlight), a dark navy face screen (#1B1F2E) showing two big round glowing CYAN eyes (#7FE8FF) and a small cyan smile, two small RED ear bolts at the sides, and a short antenna with a small RED ball on top. BODY: a rounded RED torso shell (same red as the head cap) with a dark navy chest panel showing three tiny lights (cyan, yellow, green). LIMBS: short grey metal arms and legs (#8895A6), dark navy ball hands and dark navy flat feet. STYLE: thick dark outline (#19131C, about 2 px at final size), flat colours with two shade tones, light from the top left, no gradients, no ground, no shadow, no text. Camera slightly above; the robot faces the viewer unless a frame says otherwise. RED appears on the head cap, ear bolts, antenna ball and torso shell ONLY (the game recolours red to each player's colour): no other red, pink or orange anywhere (no orange or red sparks, flames, props or lights; use cyan, white, yellow or purple for effects).

Rules for every frame: transparent background (real alpha, no white halo); keep the same scale in every frame (standing robot about 84 px tall); grounded frames have the feet resting at the bottom centre of the frame (x = 64, y = 120 of 128 x 128); jumping frames lift the feet but keep the body centred on x = 64; leave at least 4 px free around the whole character, nothing cropped; no text, numbers, labels, grid lines or guide marks in the image.

ROW NOTE: Happy jumps for good moments and the winner's victory dance.

FRAMES, left to right:
1. Cheer 1: Crouching slightly, both fists pulled down beside the hips, ready to jump. Cheer loop frame 1.
2. Cheer 2: Jumping: feet off the ground, both arms thrown straight up, mouth open and happy eyes.
3. Cheer 3: Top of the jump, arms up and wide in a V, little cyan sparkles around the head.
4. Cheer 4: Landing, knees bent, arms coming down. Loops back to frame 1.
5. Win 1: Winner pose: both arms straight up holding a small golden trophy cup (yellow, not orange) overhead, proud open smile.
6. Win 2: Win loop frame 2: slight bounce, trophy tilts to the left, cyan sparkle stars around.
7. Win 3: Win loop frame 3: bigger bounce, feet slightly off the ground, trophy overhead.
8. Win 4: Win loop frame 4: trophy tilts to the right, more sparkles.
```

## Row 2: SAD + ZAP

```
Draw ONE ROW of a sprite sheet for a kids' robot party game: 8 frames side by side in a single transparent PNG made of 8 equal SQUARE cells (aspect 8:1, for example 2048 x 256); fill cells 1 to 8 from the left and leave the remaining cells empty. Every cell is 128 x 128 pixels in proportion.

CHARACTER: A cute, kid-friendly chibi cartoon ROBOT with a big square-ish head and a small round body. Standing height about 84 px in a 128 x 128 px frame (head about 46 px wide). HEAD: rounded-square head in light grey-blue metal (#C3CCD6) with a RED cap band across the top (#B60D18, darker red for shade, small light highlight), a dark navy face screen (#1B1F2E) showing two big round glowing CYAN eyes (#7FE8FF) and a small cyan smile, two small RED ear bolts at the sides, and a short antenna with a small RED ball on top. BODY: a rounded RED torso shell (same red as the head cap) with a dark navy chest panel showing three tiny lights (cyan, yellow, green). LIMBS: short grey metal arms and legs (#8895A6), dark navy ball hands and dark navy flat feet. STYLE: thick dark outline (#19131C, about 2 px at final size), flat colours with two shade tones, light from the top left, no gradients, no ground, no shadow, no text. Camera slightly above; the robot faces the viewer unless a frame says otherwise. RED appears on the head cap, ear bolts, antenna ball and torso shell ONLY (the game recolours red to each player's colour): no other red, pink or orange anywhere (no orange or red sparks, flames, props or lights; use cyan, white, yellow or purple for effects).

Rules for every frame: transparent background (real alpha, no white halo); keep the same scale in every frame (standing robot about 84 px tall); grounded frames have the feet resting at the bottom centre of the frame (x = 64, y = 120 of 128 x 128); jumping frames lift the feet but keep the body centred on x = 64; leave at least 4 px free around the whole character, nothing cropped; no text, numbers, labels, grid lines or guide marks in the image.

ROW NOTE: Disappointed slump, and a shocked electric zap (wrong move, bomb, spark).

FRAMES, left to right:
1. Sad 1: Head drooping forward, arms hanging limp, sad eyes (slanted brows) and a small frown. Sad loop frame 1.
2. Sad 2: Sad loop frame 2: shoulders drop a little lower, antenna ball droops.
3. Sad 3: Sad loop frame 3: head sinks slightly more, a single cyan tear drop (blue, not red).
4. Sad 4: Sad loop frame 4: small sigh, back toward frame 1.
5. Zap 1: Electric shock: whole body stiff, arms flung out sideways, eyes shown as cyan X marks, mouth a small round O, jagged white-yellow lightning lines around the body.
6. Zap 2: Zap loop frame 2: body shifted a little to the left, lightning in different places, same X eyes.
7. Zap 3: Zap loop frame 3: body shifted a little to the right, bigger lightning bolts.
8. Zap 4: Zap loop frame 4: body back to centre, smaller lightning, one little spark of smoke (grey).
```

## Row 3: RUN (SIDE VIEW)

```
Draw ONE ROW of a sprite sheet for a kids' robot party game: 8 frames side by side in a single transparent PNG made of 8 equal SQUARE cells (aspect 8:1, for example 2048 x 256); fill cells 1 to 8 from the left and leave the remaining cells empty. Every cell is 128 x 128 pixels in proportion.

CHARACTER: A cute, kid-friendly chibi cartoon ROBOT with a big square-ish head and a small round body. Standing height about 84 px in a 128 x 128 px frame (head about 46 px wide). HEAD: rounded-square head in light grey-blue metal (#C3CCD6) with a RED cap band across the top (#B60D18, darker red for shade, small light highlight), a dark navy face screen (#1B1F2E) showing two big round glowing CYAN eyes (#7FE8FF) and a small cyan smile, two small RED ear bolts at the sides, and a short antenna with a small RED ball on top. BODY: a rounded RED torso shell (same red as the head cap) with a dark navy chest panel showing three tiny lights (cyan, yellow, green). LIMBS: short grey metal arms and legs (#8895A6), dark navy ball hands and dark navy flat feet. STYLE: thick dark outline (#19131C, about 2 px at final size), flat colours with two shade tones, light from the top left, no gradients, no ground, no shadow, no text. Camera slightly above; the robot faces the viewer unless a frame says otherwise. RED appears on the head cap, ear bolts, antenna ball and torso shell ONLY (the game recolours red to each player's colour): no other red, pink or orange anywhere (no orange or red sparks, flames, props or lights; use cyan, white, yellow or purple for effects).

Rules for every frame: transparent background (real alpha, no white halo); keep the same scale in every frame (standing robot about 84 px tall); grounded frames have the feet resting at the bottom centre of the frame (x = 64, y = 120 of 128 x 128); jumping frames lift the feet but keep the body centred on x = 64; leave at least 4 px free around the whole character, nothing cropped; no text, numbers, labels, grid lines or guide marks in the image.

ROW NOTE: Run cycle for Rocket Dash. SIDE VIEW facing the viewer's RIGHT (the game mirrors it if needed). Small cyan-white rocket flames on the boots are welcome (never orange or red).

FRAMES, left to right:
1. Run 1: Side view facing right, contact pose: front leg stretched forward, back leg behind, arms swinging opposite, body leaning slightly forward, mouth open.
2. Run 2: Run cycle frame 2: down pose, body at its lowest, front foot landing.
3. Run 3: Run cycle frame 3: passing pose, one leg under the body, other leg bending up behind.
4. Run 4: Run cycle frame 4: up pose, both feet off the ground, body at its highest.
5. Run 5: Run cycle frame 5: contact pose mirrored: the other leg stretched forward, arms swapped.
6. Run 6: Run cycle frame 6: down pose on the other leg.
7. Run 7: Run cycle frame 7: passing pose on the other leg.
8. Run 8: Run cycle frame 8: up pose again, loops back to frame 1.
```

## Row 4: BONK + MASH

```
Draw ONE ROW of a sprite sheet for a kids' robot party game: 8 frames side by side in a single transparent PNG made of 8 equal SQUARE cells (aspect 8:1, for example 2048 x 256); fill cells 1 to 8 from the left and leave the remaining cells empty. Every cell is 128 x 128 pixels in proportion.

CHARACTER: A cute, kid-friendly chibi cartoon ROBOT with a big square-ish head and a small round body. Standing height about 84 px in a 128 x 128 px frame (head about 46 px wide). HEAD: rounded-square head in light grey-blue metal (#C3CCD6) with a RED cap band across the top (#B60D18, darker red for shade, small light highlight), a dark navy face screen (#1B1F2E) showing two big round glowing CYAN eyes (#7FE8FF) and a small cyan smile, two small RED ear bolts at the sides, and a short antenna with a small RED ball on top. BODY: a rounded RED torso shell (same red as the head cap) with a dark navy chest panel showing three tiny lights (cyan, yellow, green). LIMBS: short grey metal arms and legs (#8895A6), dark navy ball hands and dark navy flat feet. STYLE: thick dark outline (#19131C, about 2 px at final size), flat colours with two shade tones, light from the top left, no gradients, no ground, no shadow, no text. Camera slightly above; the robot faces the viewer unless a frame says otherwise. RED appears on the head cap, ear bolts, antenna ball and torso shell ONLY (the game recolours red to each player's colour): no other red, pink or orange anywhere (no orange or red sparks, flames, props or lights; use cyan, white, yellow or purple for effects).

Rules for every frame: transparent background (real alpha, no white halo); keep the same scale in every frame (standing robot about 84 px tall); grounded frames have the feet resting at the bottom centre of the frame (x = 64, y = 120 of 128 x 128); jumping frames lift the feet but keep the body centred on x = 64; leave at least 4 px free around the whole character, nothing cropped; no text, numbers, labels, grid lines or guide marks in the image.

ROW NOTE: Mallet swing for Bolt Bash, and button-mashing arms for Power Surge. The mallet is grey metal with a CYAN head (no wood or orange).

FRAMES, left to right:
1. Bonk 1: Facing the viewer, a small grey mallet with a cyan head raised high overhead in the right hand, determined face. Swing frame 1 (wind-up).
2. Bonk 2: Swing frame 2: mallet coming down fast, motion arc lines, body leaning forward.
3. Bonk 3: Swing frame 3: impact, mallet at the bottom front, small white impact star, happy eyes.
4. Bonk 4: Swing frame 4: recovering, mallet lifting back up, proud smile.
5. Mash 1: Leaning forward over an imaginary button below the frame, left fist pressed down low, right fist raised, gritted flat mouth, focused eyes.
6. Mash 2: Mash loop frame 2: fists swap, right fist down, left fist up, body bounces.
7. Mash 3: Mash loop frame 3: like frame 1 with tiny cyan sparks near the lower fist.
8. Mash 4: Mash loop frame 4: like frame 2 with tiny cyan sparks near the lower fist.
```

## Row 5: CATCH

```
Draw ONE ROW of a sprite sheet for a kids' robot party game: 8 frames side by side in a single transparent PNG made of 8 equal SQUARE cells (aspect 8:1, for example 2048 x 256); fill cells 1 to 8 from the left and leave the remaining cells empty. Every cell is 128 x 128 pixels in proportion.

CHARACTER: A cute, kid-friendly chibi cartoon ROBOT with a big square-ish head and a small round body. Standing height about 84 px in a 128 x 128 px frame (head about 46 px wide). HEAD: rounded-square head in light grey-blue metal (#C3CCD6) with a RED cap band across the top (#B60D18, darker red for shade, small light highlight), a dark navy face screen (#1B1F2E) showing two big round glowing CYAN eyes (#7FE8FF) and a small cyan smile, two small RED ear bolts at the sides, and a short antenna with a small RED ball on top. BODY: a rounded RED torso shell (same red as the head cap) with a dark navy chest panel showing three tiny lights (cyan, yellow, green). LIMBS: short grey metal arms and legs (#8895A6), dark navy ball hands and dark navy flat feet. STYLE: thick dark outline (#19131C, about 2 px at final size), flat colours with two shade tones, light from the top left, no gradients, no ground, no shadow, no text. Camera slightly above; the robot faces the viewer unless a frame says otherwise. RED appears on the head cap, ear bolts, antenna ball and torso shell ONLY (the game recolours red to each player's colour): no other red, pink or orange anywhere (no orange or red sparks, flames, props or lights; use cyan, white, yellow or purple for effects).

Rules for every frame: transparent background (real alpha, no white halo); keep the same scale in every frame (standing robot about 84 px tall); grounded frames have the feet resting at the bottom centre of the frame (x = 64, y = 120 of 128 x 128); jumping frames lift the feet but keep the body centred on x = 64; leave at least 4 px free around the whole character, nothing cropped; no text, numbers, labels, grid lines or guide marks in the image.

ROW NOTE: Cargo Catch: the robot holds a small grey metal basket high above its head. Eyes look up.

FRAMES, left to right:
1. Catch 1: Both arms straight up holding a small grey basket overhead, eyes looking up, mouth slightly open. Catch loop frame 1.
2. Catch 2: Catch loop frame 2: slight knee bend, basket tilts a little to the left.
3. Catch 3: Catch loop frame 3: back up, basket level.
4. Catch 4: Catch loop frame 4: basket tilts a little to the right.
5. Catch joy 1: Basket overhead with a bolt inside, big happy eyes (cyan arcs), open smile, small hop.
6. Catch joy 2: Catch joy frame 2: feet off the ground, basket still overhead, tiny cyan sparkle.
7. Fumble 1: Zapped by a spark: basket tipping and a bolt falling out, arms wobbling out sideways, X eyes, round O mouth.
8. Fumble 2: Fumble frame 2: basket tipped the other way, body shifted, X eyes, a little white-yellow spark.
```

## Row 6: STAMP + THINK

```
Draw ONE ROW of a sprite sheet for a kids' robot party game: 8 frames side by side in a single transparent PNG made of 8 equal SQUARE cells (aspect 8:1, for example 2048 x 256); fill cells 1 to 8 from the left and leave the remaining cells empty. Every cell is 128 x 128 pixels in proportion.

CHARACTER: A cute, kid-friendly chibi cartoon ROBOT with a big square-ish head and a small round body. Standing height about 84 px in a 128 x 128 px frame (head about 46 px wide). HEAD: rounded-square head in light grey-blue metal (#C3CCD6) with a RED cap band across the top (#B60D18, darker red for shade, small light highlight), a dark navy face screen (#1B1F2E) showing two big round glowing CYAN eyes (#7FE8FF) and a small cyan smile, two small RED ear bolts at the sides, and a short antenna with a small RED ball on top. BODY: a rounded RED torso shell (same red as the head cap) with a dark navy chest panel showing three tiny lights (cyan, yellow, green). LIMBS: short grey metal arms and legs (#8895A6), dark navy ball hands and dark navy flat feet. STYLE: thick dark outline (#19131C, about 2 px at final size), flat colours with two shade tones, light from the top left, no gradients, no ground, no shadow, no text. Camera slightly above; the robot faces the viewer unless a frame says otherwise. RED appears on the head cap, ear bolts, antenna ball and torso shell ONLY (the game recolours red to each player's colour): no other red, pink or orange anywhere (no orange or red sparks, flames, props or lights; use cyan, white, yellow or purple for effects).

Rules for every frame: transparent background (real alpha, no white halo); keep the same scale in every frame (standing robot about 84 px tall); grounded frames have the feet resting at the bottom centre of the frame (x = 64, y = 120 of 128 x 128); jumping frames lift the feet but keep the body centred on x = 64; leave at least 4 px free around the whole character, nothing cropped; no text, numbers, labels, grid lines or guide marks in the image.

ROW NOTE: Stamp Press, and a thinking pose for Copy Circuit. The stamp is a grey and cyan rubber stamp.

FRAMES, left to right:
1. Stamp 1: Right hand raised holding a small grey-and-cyan rubber stamp high, left arm down, eyes focused on the spot below.
2. Stamp 2: Stamp frame 2: stamp swinging down, body leaning slightly forward.
3. Stamp 3: Stamp frame 3: stamp pressed down at the front, a small white 'thud' burst, happy eyes.
4. Stamp 4: Stamp frame 4: stamp lifting, proud smile.
5. Think 1: Right hand on the chin, head tilted, eyes glancing up to the upper right, flat mouth. Think loop frame 1.
6. Think 2: Think loop frame 2: eyes glance up to the upper left.
7. Think 3: Think loop frame 3: head tilts the other way, a small yellow light bulb appears above the antenna.
8. Think 4: Think loop frame 4: bulb glows brighter (yellow rays, no orange).
```

## Row 7: LOOK + NOD + SHAKE

```
Draw ONE ROW of a sprite sheet for a kids' robot party game: 8 frames side by side in a single transparent PNG made of 8 equal SQUARE cells (aspect 8:1, for example 2048 x 256); fill cells 1 to 8 from the left and leave the remaining cells empty. Every cell is 128 x 128 pixels in proportion.

CHARACTER: A cute, kid-friendly chibi cartoon ROBOT with a big square-ish head and a small round body. Standing height about 84 px in a 128 x 128 px frame (head about 46 px wide). HEAD: rounded-square head in light grey-blue metal (#C3CCD6) with a RED cap band across the top (#B60D18, darker red for shade, small light highlight), a dark navy face screen (#1B1F2E) showing two big round glowing CYAN eyes (#7FE8FF) and a small cyan smile, two small RED ear bolts at the sides, and a short antenna with a small RED ball on top. BODY: a rounded RED torso shell (same red as the head cap) with a dark navy chest panel showing three tiny lights (cyan, yellow, green). LIMBS: short grey metal arms and legs (#8895A6), dark navy ball hands and dark navy flat feet. STYLE: thick dark outline (#19131C, about 2 px at final size), flat colours with two shade tones, light from the top left, no gradients, no ground, no shadow, no text. Camera slightly above; the robot faces the viewer unless a frame says otherwise. RED appears on the head cap, ear bolts, antenna ball and torso shell ONLY (the game recolours red to each player's colour): no other red, pink or orange anywhere (no orange or red sparks, flames, props or lights; use cyan, white, yellow or purple for effects).

Rules for every frame: transparent background (real alpha, no white halo); keep the same scale in every frame (standing robot about 84 px tall); grounded frames have the feet resting at the bottom centre of the frame (x = 64, y = 120 of 128 x 128); jumping frames lift the feet but keep the body centred on x = 64; leave at least 4 px free around the whole character, nothing cropped; no text, numbers, labels, grid lines or guide marks in the image.

ROW NOTE: Copy Circuit: the head and eyes turn toward the pad that lights up. Body stays facing the viewer. 'Left' and 'right' are the VIEWER's left and right.

FRAMES, left to right:
1. Look up: Standing, face screen and cyan eyes looking straight UP, head tilted slightly back.
2. Look left: Face screen and eyes looking to the viewer's LEFT, head turned slightly left.
3. Look right: Face screen and eyes looking to the viewer's RIGHT, head turned slightly right.
4. Look down: Face screen and eyes looking DOWN, head tilted slightly forward.
5. Nod 1: Head nodding yes: chin down, happy eyes (cyan arcs), small smile.
6. Nod 2: Nod frame 2: head back up, big smile.
7. Shake 1: Head shaking no: head turned to the left, sad slanted eyes, flat mouth.
8. Shake 2: Shake frame 2: head turned to the right, same sad face.
```

## Row 8: DIZZY + POWER

```
Draw ONE ROW of a sprite sheet for a kids' robot party game: 8 frames side by side in a single transparent PNG made of 8 equal SQUARE cells (aspect 8:1, for example 2048 x 256); fill cells 1 to 8 from the left and leave the remaining cells empty. Every cell is 128 x 128 pixels in proportion.

CHARACTER: A cute, kid-friendly chibi cartoon ROBOT with a big square-ish head and a small round body. Standing height about 84 px in a 128 x 128 px frame (head about 46 px wide). HEAD: rounded-square head in light grey-blue metal (#C3CCD6) with a RED cap band across the top (#B60D18, darker red for shade, small light highlight), a dark navy face screen (#1B1F2E) showing two big round glowing CYAN eyes (#7FE8FF) and a small cyan smile, two small RED ear bolts at the sides, and a short antenna with a small RED ball on top. BODY: a rounded RED torso shell (same red as the head cap) with a dark navy chest panel showing three tiny lights (cyan, yellow, green). LIMBS: short grey metal arms and legs (#8895A6), dark navy ball hands and dark navy flat feet. STYLE: thick dark outline (#19131C, about 2 px at final size), flat colours with two shade tones, light from the top left, no gradients, no ground, no shadow, no text. Camera slightly above; the robot faces the viewer unless a frame says otherwise. RED appears on the head cap, ear bolts, antenna ball and torso shell ONLY (the game recolours red to each player's colour): no other red, pink or orange anywhere (no orange or red sparks, flames, props or lights; use cyan, white, yellow or purple for effects).

Rules for every frame: transparent background (real alpha, no white halo); keep the same scale in every frame (standing robot about 84 px tall); grounded frames have the feet resting at the bottom centre of the frame (x = 64, y = 120 of 128 x 128); jumping frames lift the feet but keep the body centred on x = 64; leave at least 4 px free around the whole character, nothing cropped; no text, numbers, labels, grid lines or guide marks in the image.

ROW NOTE: Dizzy wobble after a stumble, and a power-up pose when the battery is nearly full.

FRAMES, left to right:
1. Dizzy 1: Wobbling, head tilted to the left, eyes shown as cyan spirals, wavy round mouth, three little yellow stars circling above the head.
2. Dizzy 2: Dizzy frame 2: body leaning to the right, stars moved around.
3. Dizzy 3: Dizzy frame 3: head tilted left again, arms out for balance, stars moved.
4. Dizzy 4: Dizzy frame 4: body leaning right, arms out, stars moved.
5. Power 1: Both fists clenched at the sides, knees slightly bent, determined happy eyes, a thin cyan glow ring around the whole body.
6. Power 2: Power loop frame 2: glow ring bigger, tiny cyan sparks rising from the shoulders.
7. Power 3: Power loop frame 3: fists raised a little, glow ring brightest, sparks at the head.
8. Power 4: Power loop frame 4: glow ring smaller again, loops back to frame 1.
```
