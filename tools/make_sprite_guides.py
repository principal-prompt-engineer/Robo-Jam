#!/usr/bin/env python3
"""Single source of truth for the robot sprite sheet (names, descriptions, layout).
Edit ROWS / CHARACTER here and rerun:  python3 tools/make_sprite_guides.py
It writes into sprites/:  robot_master_guide_blank.png, robot-row-prompts.md, robot-sprite-sheet-spec_skill.md
tools/assemble_sprites.py imports ROWS from here, so the guide, the prompts and the assembler can never disagree."""
import os
from PIL import Image, ImageDraw, ImageFont

FW, FH, COLS = 128, 128, 8
FEET_Y, STAND_H = 120, 84     # feet row inside a frame, standing height of the robot (must match SPR in src/js/76-robot.js)

CHARACTER = ("A cute, kid-friendly chibi cartoon ROBOT with a big square-ish head and a small round body. Standing height about 84 px in a 128 x 128 px frame "
 "(head about 46 px wide). HEAD: rounded-square head in light grey-blue metal (#C3CCD6) with a RED cap band across the top (#B60D18, darker red for shade, small light highlight), "
 "a dark navy face screen (#1B1F2E) showing two big round glowing CYAN eyes (#7FE8FF) and a small cyan smile, two small RED ear bolts at the sides, and a short antenna with a small RED ball on top. "
 "BODY: a rounded RED torso shell (same red as the head cap) with a dark navy chest panel showing three tiny lights (cyan, yellow, green). "
 "LIMBS: short grey metal arms and legs (#8895A6), dark navy ball hands and dark navy flat feet. "
 "STYLE: thick dark outline (#19131C, about 2 px at final size), flat colours with two shade tones, light from the top left, no gradients, no ground, no shadow, no text. "
 "Camera slightly above; the robot faces the viewer unless a frame says otherwise. "
 "RED appears on the head cap, ear bolts, antenna ball and torso shell ONLY (the game recolours red to each player's colour): no other red, pink or orange anywhere "
 "(no orange or red sparks, flames, props or lights; use cyan, white, yellow or purple for effects).")

RULES = ("Rules for every frame: transparent background (real alpha, no white halo); keep the same scale in every frame (standing robot about 84 px tall); "
 "grounded frames have the feet resting at the bottom centre of the frame (x = 64, y = 120 of 128 x 128); jumping frames lift the feet but keep the body centred on x = 64; "
 "leave at least 4 px free around the whole character, nothing cropped; no text, numbers, labels, grid lines or guide marks in the image.")

# mode: how tools/assemble_sprites.py aligns frames: 'ground' = each frame's feet to y=120, 'rowground' = the row's lowest feet to y=120 (keeps jump heights)
ROWS = [
 dict(name="IDLE + WAVE", mode="ground", note="Calm standing loop and a friendly wave. Used in the lobby and while waiting.", frames=[
  ("Idle 1","Standing relaxed, arms hanging, neutral smile. Idle loop frame 1."),
  ("Idle 2","Idle loop frame 2: body bobs up slightly, antenna ball a little higher."),
  ("Idle 3","Idle loop frame 3: top of the bob, eyes blink (thin cyan lines)."),
  ("Idle 4","Idle loop frame 4: settling back down, eyes open."),
  ("Wave 1","Right arm (viewer's right) raised out and up, hand open, big smile. Wave loop frame 1."),
  ("Wave 2","Wave loop frame 2: raised arm swings outward."),
  ("Wave 3","Wave loop frame 3: raised arm swings back inward, head tilts slightly."),
  ("Wave 4","Wave loop frame 4: arm at the outer position again, eyes happy (cyan arcs)."),
 ]),
 dict(name="CHEER + WIN", mode="rowground", note="Happy jumps for good moments and the winner's victory dance.", frames=[
  ("Cheer 1","Crouching slightly, both fists pulled down beside the hips, ready to jump. Cheer loop frame 1."),
  ("Cheer 2","Jumping: feet off the ground, both arms thrown straight up, mouth open and happy eyes."),
  ("Cheer 3","Top of the jump, arms up and wide in a V, little cyan sparkles around the head."),
  ("Cheer 4","Landing, knees bent, arms coming down. Loops back to frame 1."),
  ("Win 1","Winner pose: both arms straight up holding a small golden trophy cup (yellow, not orange) overhead, proud open smile."),
  ("Win 2","Win loop frame 2: slight bounce, trophy tilts to the left, cyan sparkle stars around."),
  ("Win 3","Win loop frame 3: bigger bounce, feet slightly off the ground, trophy overhead."),
  ("Win 4","Win loop frame 4: trophy tilts to the right, more sparkles."),
 ]),
 dict(name="SAD + ZAP", mode="ground", note="Disappointed slump, and a shocked electric zap (wrong move, bomb, spark).", frames=[
  ("Sad 1","Head drooping forward, arms hanging limp, sad eyes (slanted brows) and a small frown. Sad loop frame 1."),
  ("Sad 2","Sad loop frame 2: shoulders drop a little lower, antenna ball droops."),
  ("Sad 3","Sad loop frame 3: head sinks slightly more, a single cyan tear drop (blue, not red)."),
  ("Sad 4","Sad loop frame 4: small sigh, back toward frame 1."),
  ("Zap 1","Electric shock: whole body stiff, arms flung out sideways, eyes shown as cyan X marks, mouth a small round O, jagged white-yellow lightning lines around the body."),
  ("Zap 2","Zap loop frame 2: body shifted a little to the left, lightning in different places, same X eyes."),
  ("Zap 3","Zap loop frame 3: body shifted a little to the right, bigger lightning bolts."),
  ("Zap 4","Zap loop frame 4: body back to centre, smaller lightning, one little spark of smoke (grey)."),
 ]),
 dict(name="RUN (SIDE VIEW)", mode="rowground", note="Run cycle for Rocket Dash. SIDE VIEW facing the viewer's RIGHT (the game mirrors it if needed). Small cyan-white rocket flames on the boots are welcome (never orange or red).", frames=[
  ("Run 1","Side view facing right, contact pose: front leg stretched forward, back leg behind, arms swinging opposite, body leaning slightly forward, mouth open."),
  ("Run 2","Run cycle frame 2: down pose, body at its lowest, front foot landing."),
  ("Run 3","Run cycle frame 3: passing pose, one leg under the body, other leg bending up behind."),
  ("Run 4","Run cycle frame 4: up pose, both feet off the ground, body at its highest."),
  ("Run 5","Run cycle frame 5: contact pose mirrored: the other leg stretched forward, arms swapped."),
  ("Run 6","Run cycle frame 6: down pose on the other leg."),
  ("Run 7","Run cycle frame 7: passing pose on the other leg."),
  ("Run 8","Run cycle frame 8: up pose again, loops back to frame 1."),
 ]),
 dict(name="BONK + MASH", mode="ground", note="Mallet swing for Bolt Bash, and button-mashing arms for Power Surge. The mallet is grey metal with a CYAN head (no wood or orange).", frames=[
  ("Bonk 1","Facing the viewer, a small grey mallet with a cyan head raised high overhead in the right hand, determined face. Swing frame 1 (wind-up)."),
  ("Bonk 2","Swing frame 2: mallet coming down fast, motion arc lines, body leaning forward."),
  ("Bonk 3","Swing frame 3: impact, mallet at the bottom front, small white impact star, happy eyes."),
  ("Bonk 4","Swing frame 4: recovering, mallet lifting back up, proud smile."),
  ("Mash 1","Leaning forward over an imaginary button below the frame, left fist pressed down low, right fist raised, gritted flat mouth, focused eyes."),
  ("Mash 2","Mash loop frame 2: fists swap, right fist down, left fist up, body bounces."),
  ("Mash 3","Mash loop frame 3: like frame 1 with tiny cyan sparks near the lower fist."),
  ("Mash 4","Mash loop frame 4: like frame 2 with tiny cyan sparks near the lower fist."),
 ]),
 dict(name="CATCH", mode="ground", note="Cargo Catch: the robot holds a small grey metal basket high above its head. Eyes look up.", frames=[
  ("Catch 1","Both arms straight up holding a small grey basket overhead, eyes looking up, mouth slightly open. Catch loop frame 1."),
  ("Catch 2","Catch loop frame 2: slight knee bend, basket tilts a little to the left."),
  ("Catch 3","Catch loop frame 3: back up, basket level."),
  ("Catch 4","Catch loop frame 4: basket tilts a little to the right."),
  ("Catch joy 1","Basket overhead with a bolt inside, big happy eyes (cyan arcs), open smile, small hop."),
  ("Catch joy 2","Catch joy frame 2: feet off the ground, basket still overhead, tiny cyan sparkle."),
  ("Fumble 1","Zapped by a spark: basket tipping and a bolt falling out, arms wobbling out sideways, X eyes, round O mouth."),
  ("Fumble 2","Fumble frame 2: basket tipped the other way, body shifted, X eyes, a little white-yellow spark."),
 ]),
 dict(name="STAMP + THINK", mode="ground", note="Stamp Press, and a thinking pose for Copy Circuit. The stamp is a grey and cyan rubber stamp.", frames=[
  ("Stamp 1","Right hand raised holding a small grey-and-cyan rubber stamp high, left arm down, eyes focused on the spot below."),
  ("Stamp 2","Stamp frame 2: stamp swinging down, body leaning slightly forward."),
  ("Stamp 3","Stamp frame 3: stamp pressed down at the front, a small white 'thud' burst, happy eyes."),
  ("Stamp 4","Stamp frame 4: stamp lifting, proud smile."),
  ("Think 1","Right hand on the chin, head tilted, eyes glancing up to the upper right, flat mouth. Think loop frame 1."),
  ("Think 2","Think loop frame 2: eyes glance up to the upper left."),
  ("Think 3","Think loop frame 3: head tilts the other way, a small yellow light bulb appears above the antenna."),
  ("Think 4","Think loop frame 4: bulb glows brighter (yellow rays, no orange)."),
 ]),
 dict(name="LOOK + NOD + SHAKE", mode="ground", note="Copy Circuit: the head and eyes turn toward the pad that lights up. Body stays facing the viewer. 'Left' and 'right' are the VIEWER's left and right.", frames=[
  ("Look up","Standing, face screen and cyan eyes looking straight UP, head tilted slightly back."),
  ("Look left","Face screen and eyes looking to the viewer's LEFT, head turned slightly left."),
  ("Look right","Face screen and eyes looking to the viewer's RIGHT, head turned slightly right."),
  ("Look down","Face screen and eyes looking DOWN, head tilted slightly forward."),
  ("Nod 1","Head nodding yes: chin down, happy eyes (cyan arcs), small smile."),
  ("Nod 2","Nod frame 2: head back up, big smile."),
  ("Shake 1","Head shaking no: head turned to the left, sad slanted eyes, flat mouth."),
  ("Shake 2","Shake frame 2: head turned to the right, same sad face."),
 ]),
 dict(name="DIZZY + POWER", mode="ground", note="Dizzy wobble after a stumble, and a power-up pose when the battery is nearly full.", frames=[
  ("Dizzy 1","Wobbling, head tilted to the left, eyes shown as cyan spirals, wavy round mouth, three little yellow stars circling above the head."),
  ("Dizzy 2","Dizzy frame 2: body leaning to the right, stars moved around."),
  ("Dizzy 3","Dizzy frame 3: head tilted left again, arms out for balance, stars moved."),
  ("Dizzy 4","Dizzy frame 4: body leaning right, arms out, stars moved."),
  ("Power 1","Both fists clenched at the sides, knees slightly bent, determined happy eyes, a thin cyan glow ring around the whole body."),
  ("Power 2","Power loop frame 2: glow ring bigger, tiny cyan sparks rising from the shoulders."),
  ("Power 3","Power loop frame 3: fists raised a little, glow ring brightest, sparks at the head."),
  ("Power 4","Power loop frame 4: glow ring smaller again, loops back to frame 1."),
 ]),
]
NROWS=len(ROWS)

def slug(s): return s.lower().replace(' ','-')

def font(sz,bold=False):
    for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSans%s.ttf'%('-Bold' if bold else ''),'/usr/share/fonts/truetype/liberation/LiberationSans-%s.ttf'%('Bold' if bold else 'Regular')]:
        if os.path.exists(p): return ImageFont.truetype(p,sz)
    return ImageFont.load_default()

def make_guide(path):
    cell_w,cell_h,lab=186,116,40; row_h=cell_h+lab+26; W=COLS*cell_w; H=NROWS*row_h
    im=Image.new('RGB',(W,H),'white'); d=ImageDraw.Draw(im)
    for r,row in enumerate(ROWS):
        y0=r*row_h
        d.rectangle([0,y0,W,y0+24],fill='#26395f')
        d.text((6,y0+4),"ROW %d: %s   %s"%(r,row['name'],row['note'][:120]),fill='white',font=font(12,True))
        for c in range(COLS):
            x0=c*cell_w; y1=y0+26
            if c>=len(row['frames']):
                d.rectangle([x0,y1,x0+cell_w-2,y1+cell_h],fill='#dfe2e8',outline='#9fb4d6'); d.text((x0+6,y1+4),"unused",fill='#999',font=font(10)); continue
            d.rectangle([x0,y1,x0+cell_w-2,y1+cell_h],fill='#eef3fb',outline='#6f9bd1')
            cx,gy=x0+cell_w//2,y1+int(cell_h*FEET_Y/FH)
            d.line([x0,gy,x0+cell_w-2,gy],fill='#c3cde0'); d.line([cx-6,y1+cell_h//2,cx+6,y1+cell_h//2],fill='#c3cde0'); d.line([cx,y1+cell_h//2-6,cx,y1+cell_h//2+6],fill='#c3cde0')
            d.ellipse([cx-3,gy-3,cx+3,gy+3],outline='#e06060')
            d.rectangle([x0,y1+cell_h,x0+cell_w-2,y1+cell_h+lab],fill='white',outline='#6f9bd1')
            d.text((x0+4,y1+cell_h+3),"r%d c%d"%(r,c),fill='#888',font=font(10))
            d.text((x0+4,y1+cell_h+17),row['frames'][c][0],fill='#111',font=font(13,True))
    im.save(path)

def row_prompt(r):
    row=ROWS[r]; n=len(row['frames'])
    lines=["FRAMES, left to right:"]+["%d. %s: %s"%(i+1,f[0],f[1]) for i,f in enumerate(row['frames'])]
    return ("Draw ONE ROW of a sprite sheet for a kids' robot party game: %d frames side by side in a single transparent PNG made of 8 equal SQUARE cells "
      "(aspect 8:1, for example 2048 x 256); fill cells 1 to %d from the left and leave the remaining cells empty. Every cell is 128 x 128 pixels in proportion.\n\n"
      "CHARACTER: %s\n\n%s\n\nROW NOTE: %s\n\n%s")%(n,n,CHARACTER,RULES,row['note'],"\n".join(lines))

def make_prompts(path):
    out=["# Row prompts for the image AI (robot sheet)\n",
     "Paste ONE prompt at a time. Each prompt is complete on its own, so you do not need to send an example image. Generate the rows in order; keep using the same chat so the character stays consistent, and if the character drifts, say \"keep the same character as the first row\".\n",
     "Exact pixels are not needed: ask for 8 equal square cells in one row (aspect 8:1, for example 2048 x 256). `tools/assemble_sprites.py` cuts and resizes the cells. Save the results as `row_00.png` ... `row_%02d.png`.\n"%(NROWS-1)]
    for r,row in enumerate(ROWS): out.append("## Row %d: %s\n\n```\n%s\n```\n"%(r,row['name'],row_prompt(r)))
    open(path,'w').write("\n".join(out))

def make_spec(path):
    rows="\n".join("| %d | %s | %s |"%(r,row['name'],", ".join("%d %s"%(i,f[0]) for i,f in enumerate(row['frames']))) for r,row in enumerate(ROWS))
    used="\n".join("- **%s**: %s"%(k,v) for k,v in [
     ("Lobby","Idle / Wave (row 0)"),("Bolt Bash","Idle, Bonk (4), Zap (2)"),("Power Surge","Mash (4), Power (8), Cheer (1)"),("Rocket Dash","Run (3), Dizzy (8) on a stumble, Cheer (1) at the line"),
     ("Stamp Press","Stamp (6), Sad (2) on a miss"),("Copy Circuit","Look (7) toward the lit pad, Think (6), Nod / Shake (7)"),("Cargo Catch","Catch (5), Catch joy (5), Fumble (5)"),
     ("Results","Win (1) for 1st place, Cheer (1) for the middle, Sad (2) for last")])
    open(path,'w').write("""---
name: robot-sprite-sheet-spec
description: Complete text-only specification of the robot master sprite sheet for the Robo Jam game (every pose: idle, wave, cheer, win, sad, zap, run, bonk, mash, catch, stamp, think, look, nod, shake, dizzy, power) for an image-generation AI, with a labelled blank guide and one self-contained prompt per row. No example image needs to be sent. Use when generating, extending, checking or recolouring the robot sprites.
---

# Robot master sprite sheet (all sprites, text only)

## 0. What to send the image AI
- **Do not send an example image.** The robot is fully described in words (section 2) and every frame is described one by one (`robot-row-prompts.md`).
- Send **one row prompt at a time** from `robot-row-prompts.md`. Each prompt already contains the character description, the rules and that row's frames. Keep the same chat for all rows so the character stays consistent. If it drifts, say "keep the same character as the first row".
- `robot_master_guide_blank.png` is **for you** (and for the coding AI): the blank sheet with every frame's name under its cell, so you can see what each image represents. You may attach it to the image AI, but it is not needed. Nothing from it may appear in a sprite.

## 1. Layout
- Final master sheet: **%d x %d px = 8 columns x %d rows of 128 x 128 px frames**, transparent. Row and column positions are fixed, because the game looks sprites up by row and column (`POSE_FRAMES` in `src/js/76-robot.js`).
- The image AI does not have to hit exact pixels. Ask for one row at a time as 8 equal square cells (aspect 8:1, for example 2048 x 256). `tools/assemble_sprites.py` cuts the cells, scales them to 128 x 128, aligns the feet and writes `art/robot_master_red.png`.
- **Without the sheet the game still works**: the robots are then drawn in code with the same poses. With the sheet, `node tools/build.js` embeds it automatically.

## 2. The character (paste with every row; already inside each row prompt)
%s

%s

## 3. How colours and angles are handled
- **Red is the player colour.** The game shifts every red pixel (hue within 18 degrees of #B60D18, saturation above 0.45) to each player's hue at load, keeping saturation, brightness and alpha. That is why red is allowed on the head cap, ear bolts, antenna ball and torso shell only. Cyan, yellow, purple, grey and navy are never touched.
- **No rotated drawings.** Look up / left / right / down are separate head poses, flips and spins are not part of this game.
- **Run is the only side view**, facing the viewer's right.

## 4. Every row and frame
| Row | Name | Frames (left to right) |
|---|---|---|
%s

Full per-frame descriptions are in `robot-row-prompts.md`. `robot_master_guide_blank.png` shows these names under each cell.

## 5. Where each pose is used in the game
%s

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
- Master file: `art/robot_master_red.png` (8 x %d frames of 128 x 128, feet at y = %d, standing height %d px). `build.js` maps it to `EMBEDDED_ART.robot`; `src/js/76-robot.js` slices it by `POSE_FRAMES`, recolours it per player colour on a cached offscreen canvas and falls back to `procRobot()` when it is missing.
- To add a pose: add a row or frames to `ROWS`, add an entry to `POSE_FRAMES` and a matching case in `procRobot()`, rerun this script.
"""%(COLS*FW,NROWS*FH,NROWS,CHARACTER,RULES,rows,used,NROWS,FEET_Y,STAND_H))

if __name__=='__main__':
    out=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','sprites'); os.makedirs(out,exist_ok=True)
    make_guide(os.path.join(out,'robot_master_guide_blank.png')); make_prompts(os.path.join(out,'robot-row-prompts.md')); make_spec(os.path.join(out,'robot-sprite-sheet-spec_skill.md'))
    print("wrote guide, prompts and spec for %d rows / %d frames"%(NROWS,sum(len(r['frames']) for r in ROWS)))
