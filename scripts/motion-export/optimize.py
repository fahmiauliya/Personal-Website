"""Lightens the motion bundle's assets after an export (run by pack.mjs; needs Python 3 with
Pillow). Nothing here changes how a motion looks:

- Frame images (the backdrops behind the motions): re-encoded as the smallest WebP that stays
  within 0.8 (of 255) average difference of the original. Most are soft-focus gradients,
  which compress far better than they were saved. A JPEG becomes a WebP, and the bundle's
  code is pointed at the new name.
- SVGs: path coordinates rounded to 0.01 px (these frames are 531–1408 px wide), ids nothing
  refers to dropped, and embedded pictures scaled down to 4x the size they're drawn at (an
  SVG shown as an image can't load outside files, so they stay embedded).

Usage: python3 optimize.py <bundle folder>   (e.g. public/motions)
"""
import base64, io, os, re, sys
from PIL import Image, ImageChops, ImageStat

root = sys.argv[1]
assets = os.path.join(root, 'assets')
renamed = {}
saved = 0


def mean_difference(a, b):
    return sum(ImageStat.Stat(ImageChops.difference(a, b)).mean) / 3


def smallest_webp(image, limit=0.8):
    """The lowest quality (so smallest file) whose decode stays within `limit` of `image`."""
    best = None
    for quality in (40, 50, 60, 70, 78, 85, 90, 95):
        buffer = io.BytesIO()
        image.save(buffer, 'WEBP', quality=quality, method=6)
        decoded = Image.open(io.BytesIO(buffer.getvalue())).convert(image.mode)
        if mean_difference(image, decoded) <= limit:
            best = buffer.getvalue()
            break
    return best


# Frame images.
for name in sorted(os.listdir(assets)):
    if not name.startswith('frame-') or not name.endswith(('.webp', '.jpg', '.jpeg', '.png')):
        continue
    path = os.path.join(assets, name)
    before = os.path.getsize(path)
    image = Image.open(path)
    image = image.convert('RGBA' if image.mode in ('RGBA', 'LA', 'P') and 'A' in image.getbands() else 'RGB')
    data = smallest_webp(image)
    if not data or len(data) >= before * 0.95:
        continue  # already about as small as it gets
    target = os.path.splitext(name)[0] + '.webp'
    with open(os.path.join(assets, target), 'wb') as out:
        out.write(data)
    if target != name:
        os.remove(path)
        renamed[name] = target
    saved += before - len(data)
    print(f'  {name}: {before // 1024} KB -> {len(data) // 1024} KB')


def round_numbers(text):
    return re.sub(r'-?\d+\.\d{3,}', lambda m: (f'{float(m.group(0)):.2f}'.rstrip('0').rstrip('.') or '0'), text)


# SVGs.
for name in sorted(os.listdir(assets)):
    if not name.endswith('.svg'):
        continue
    path = os.path.join(assets, name)
    svg = open(path, encoding='utf8').read()
    before = len(svg.encode())
    # Path data only: transforms and gradient matrices keep their precision.
    svg = re.sub(r'(\sd|\spoints)="([^"]*)"', lambda m: f'{m.group(1)}="{round_numbers(m.group(2))}"', svg)
    referenced = set(re.findall(r'url\(#([^)]+)\)', svg)) | set(re.findall(r'href="#([^"]+)"', svg))
    svg = re.sub(r'\sid="([^"]+)"', lambda m: m.group(0) if m.group(1) in referenced else '', svg)
    svg = re.sub(r'\sdata-name="[^"]*"', '', svg)

    # Embedded pictures, drawn through a pattern on a shape: the shape's size (the larger
    # side) times 4 is the most they ever need.
    def shrink(match):
        image_id, width, height, data = match.group('id'), float(match.group('w')), float(match.group('h')), match.group('data')
        pattern = re.search(r'<pattern id="([^"]+)"[^>]*>\s*<use[^>]*href="#%s"' % re.escape(image_id), svg)
        shape = pattern and re.search(r'<(?:rect|path)[^>]*fill="url\(#%s\)"[^>]*>' % re.escape(pattern.group(1)), svg)
        if not shape:
            return match.group(0)
        box = re.search(r'width="([\d.]+)" height="([\d.]+)"', shape.group(0))
        if box:
            drawn = max(float(box.group(1)), float(box.group(2)))
        else:
            coords = [float(n) for n in re.findall(r'-?\d+\.?\d*', re.search(r'd="([^"]+)"', shape.group(0)).group(1))]
            drawn = max(max(coords[0::2]) - min(coords[0::2]), max(coords[1::2]) - min(coords[1::2]))
        need = max(16, round(drawn * 4))
        picture = Image.open(io.BytesIO(base64.b64decode(data)))
        if max(picture.size) <= need:
            return match.group(0)
        scale = need / max(picture.size)
        picture = picture.resize((max(1, round(picture.width * scale)), max(1, round(picture.height * scale))), Image.LANCZOS)
        buffer = io.BytesIO()
        picture.save(buffer, 'PNG', optimize=True)
        # Same picture, fewer pixels: keep the pattern's mapping by scaling its use to match.
        shrink.scales[image_id] = (width / picture.width, height / picture.height)
        return match.group(0).replace(data, base64.b64encode(buffer.getvalue()).decode()).replace(f'width="{match.group("w")}"', f'width="{picture.width}"').replace(f'height="{match.group("h")}"', f'height="{picture.height}"')
    shrink.scales = {}
    svg = re.sub(r'<image id="(?P<id>[^"]+)"[^>]*?width="(?P<w>[\d.]+)" height="(?P<h>[\d.]+)"[^>]*?href="data:image/png;base64,(?P<data>[A-Za-z0-9+/=]+)"', shrink, svg)
    for image_id, (sx, sy) in shrink.scales.items():
        def rescale(m):
            values = [float(v) for v in m.group(2).split()]
            if len(values) == 1:
                values = values * 2
            return f'{m.group(1)}scale({values[0] * sx:.8g} {values[1] * sy:.8g})'
        svg = re.sub(r'(<use[^>]*href="#%s"[^>]*transform=")scale\(([^)]+)\)' % re.escape(image_id), rescale, svg)
    after = len(svg.encode())
    if after < before:
        open(path, 'w', encoding='utf8').write(svg)
        saved += before - after
        print(f'  {name}: {before // 1024} KB -> {after // 1024} KB')

# Point the bundle's code at renamed files.
if renamed:
    for folder, _, files in os.walk(root):
        for name in files:
            if name.endswith(('.js', '.css')):
                path = os.path.join(folder, name)
                code = open(path, encoding='utf8').read()
                new = code
                for old, target in renamed.items():
                    new = new.replace(old, target)
                if new != code:
                    open(path, 'w', encoding='utf8').write(new)

print(f'Motion assets: {saved // 1024} KB lighter.')
