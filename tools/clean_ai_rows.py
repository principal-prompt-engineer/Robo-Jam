#!/usr/bin/env python3
"""Turn raw AI row images into clean transparent rows for tools/assemble_sprites.py.
Handles the usual AI problems: JPEG files, a checkerboard or white background BAKED INTO the picture (no real alpha),
thin dark divider lines between cells, and different robot sizes per row.
Usage:  python3 tools/clean_ai_rows.py <folder with the raw rows> <output folder>
Row numbers are read from the file names ("row_03.png.jpg", "Row 4_ BONK + MASH.jpg" -> 3, 4). Needs Pillow, numpy, scipy."""
import os, re, sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi
CELLS = 8; OUT = 256; TARGET_H = 176      # output cell size; median robot height inside a cell (88 px at 128)

def bg_mask(a):                 # neutral light grey / white pixels = checkerboard or white background
    rgb = a[..., :3].astype(int); mx = rgb.max(2); mn = rgb.min(2)
    return (mx - mn <= 12) & (mn >= 168)

def cell_edges(lum, w):         # find the thin dark divider lines near the nominal cell borders
    cw = w / CELLS; edges = [0]
    for i in range(1, CELLS):
        x0 = int(i * cw); lo, hi = max(0, x0 - 24), min(w - 1, x0 + 24)
        col = lum[:, lo:hi].mean(0); k = int(col.argmin())
        edges.append(lo + k if col[k] < 110 else x0)
    edges.append(w); return edges

def clean_cell(c):
    a = np.array(c.convert('RGBA')); m = bg_mask(a)
    lab, n = ndi.label(m, structure=np.ones((3, 3)))
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    sizes = ndi.sum(m, lab, range(n + 1))
    kill = np.zeros_like(m)
    for l in range(1, n + 1):
        if l in border or sizes[l] >= 400: kill |= lab == l      # background, or a big enclosed gap (between arm and body)
    alpha = np.where(kill, 0, 255).astype(np.uint8)
    for _ in range(2):          # remove the light fringe left around dark outlines
        near = ndi.binary_dilation(alpha == 0, structure=np.ones((3, 3))) & (alpha > 0)
        rgb = a[..., :3].astype(int); light = (rgb.max(2) - rgb.min(2) <= 40) & (rgb.min(2) >= 120)
        alpha[near & light] = 0
    lab2, n2 = ndi.label(alpha > 0, structure=np.ones((3, 3)))     # drop tiny specks
    for l, s in enumerate(ndi.sum(alpha > 0, lab2, range(n2 + 1))):
        if l and s < 25: alpha[lab2 == l] = 0
    for sl, l in zip(ndi.find_objects(lab2), range(1, n2 + 1)):   # leftover divider lines: very thin and very tall
        if sl and (sl[1].stop - sl[1].start) <= 8 and (sl[0].stop - sl[0].start) >= 0.4 * alpha.shape[0]: alpha[lab2 == l] = 0
    a[..., 3] = alpha
    return Image.fromarray(a)

def main():
    if len(sys.argv) < 3: print(__doc__); sys.exit(1)
    src, dst = sys.argv[1], sys.argv[2]; os.makedirs(dst, exist_ok=True)
    for f in sorted(os.listdir(src)):
        m = re.search(r'[Rr]ow[ _]?0*(\d+)', f)
        if not m or not f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')): continue
        r = int(m.group(1)); im = Image.open(os.path.join(src, f)).convert('RGB')
        lum = np.array(im.convert('L')).astype(float); e = cell_edges(lum, im.width)
        cells = [clean_cell(im.crop((e[i] + 5, 0, e[i + 1] - 5, im.height))) for i in range(CELLS)]
        boxes = [c.getchannel('A').getbbox() for c in cells]
        hs = sorted(b[3] - b[1] for b in boxes if b)
        if not hs: print('row %d: nothing found' % r); continue
        k = TARGET_H / hs[len(hs) // 2]
        k = min(k, *[min((OUT - 12) / (b[3] - b[1]), (OUT - 12) / (b[2] - b[0])) for b in boxes if b])   # never crop a wide or tall pose
        row = Image.new('RGBA', (OUT * CELLS, OUT), (0, 0, 0, 0))
        for i, (c, b) in enumerate(zip(cells, boxes)):
            if not b: continue
            s = c.crop(b); s = s.resize((max(1, round(s.width * k)), max(1, round(s.height * k))), Image.LANCZOS)
            row.paste(s, (i * OUT + (OUT - s.width) // 2, OUT - 8 - s.height), s)   # centred, feet near the bottom (assembler aligns exactly)
        row.save(os.path.join(dst, 'row_%02d.png' % r)); print('row %d: %s  scale %.2f' % (r, f, k))
    print('Next: python3 tools/assemble_sprites.py %s' % dst)
if __name__ == '__main__': main()
