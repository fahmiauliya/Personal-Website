import sys
from PIL import Image, ImageChops
import numpy as np
frames = sys.argv[2:]
for f in sys.argv[1].split(','):
    row = []
    for fr in frames:
        a = Image.open(f'shots/r-{f}-{fr}-rive.png').convert('RGB'); b = Image.open(f'shots/r-{f}-{fr}-svg.png').convert('RGB')
        d = np.asarray(ImageChops.difference(a, b)).astype(int).max(axis=2)
        row.append(f'{d.mean():.2f}/{int((d > 40).sum())}')
    print(f'{f:22} mean / strong px at frames {", ".join(frames)}:', '  '.join(row))
