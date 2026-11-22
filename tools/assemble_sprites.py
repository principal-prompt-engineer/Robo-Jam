#!/usr/bin/env python3
"""Assemble the robot master sheet from the row images the image AI made.
Usage:  python3 tools/assemble_sprites.py <folder with row_00.png ... row_08.png> [--no-align] [--out art/robot_master_red.png]
Each row image is cut into 8 equal cells (left to right), every cell is scaled to 128 x 128, optionally aligned
(feet to y=120, body centred on x=64), and written into the master sheet. Needs Pillow (pip install pillow).
Row layout comes from tools/make_sprite_guides.py, so the sheet always matches the guide and the game."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image
from make_sprite_guides import ROWS, FW, FH, COLS, FEET_Y

def place(frame, mode, row_bottom):
    bb = frame.getchannel('A').getbbox()
    if not bb: return frame
    w, h = bb[2] - bb[0], bb[3] - bb[1]
    out = Image.new('RGBA', (FW, FH), (0, 0, 0, 0))
    x = FW // 2 - (bb[0] + w // 2)                       # body centre to x = 64
    bottom = row_bottom if mode == 'rowground' else bb[3]
    y = FEET_Y - bottom                                  # feet to y = 120
    out.paste(frame, (x, y), frame)
    return out

def main():
    a = [x for x in sys.argv[1:] if not x.startswith('--')]
    if not a: print(__doc__); sys.exit(1)
    folder = a[0]; align = '--no-align' not in sys.argv
    out = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'art', 'robot_master_red.png')
    sheet = Image.new('RGBA', (COLS * FW, len(ROWS) * FH), (0, 0, 0, 0)); missing = []
    for r, row in enumerate(ROWS):
        p = os.path.join(folder, 'row_%02d.png' % r)
        if not os.path.exists(p): missing.append(r); print('row %d (%s): MISSING %s' % (r, row['name'], p)); continue
        im = Image.open(p).convert('RGBA'); cw = im.width / COLS
        cells = [im.crop((round(i * cw), 0, round((i + 1) * cw), im.height)).resize((FW, FH), Image.LANCZOS) for i in range(len(row['frames']))]
        scaled = []
        for c in cells:   # the AI's cell may be a different shape: scaled straight to 128 x 128 (ask for square cells)
            scaled.append(c)
        bottoms = [c.getchannel('A').getbbox()[3] for c in scaled if c.getchannel('A').getbbox()]
        row_bottom = max(bottoms) if bottoms else FEET_Y
        for i, c in enumerate(scaled):
            if not c.getchannel('A').getbbox(): print('row %d frame %d (%s): EMPTY cell' % (r, i, row['frames'][i][0]))
            sheet.paste(place(c, row['mode'], row_bottom) if align else c, (i * FW, r * FH))
        print('row %d (%s): %d frames' % (r, row['name'], len(row['frames'])))
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True); sheet.save(out)
    print('wrote %s (%d x %d)%s' % (out, sheet.width, sheet.height, '  -- missing rows: %s' % missing if missing else ''))
    print('Next: node tools/build.js   (or run_build.bat / run_build.sh)')

if __name__ == '__main__': main()
