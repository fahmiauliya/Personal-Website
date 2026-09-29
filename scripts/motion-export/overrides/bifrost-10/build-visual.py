"""Builds Bifrost motion 10's isometric artwork (visual.svg) for the website's motion bundle.

Motion Lab's visual.svg is an older Figma export of the artwork (221:101581). Its "Adaptive
Load Balancing" layer (221:102202) shows the load-balancer readout from before the design
changed, and its emoji came out as plain boxes. This swaps that one layer for the current one,
exported from Figma with its text kept as text (load-balancer-layer.svg), and draws that text
as Geist Mono outlines, each letter shape written once and reused, so it loads no font. The
emoji Figma's export can't draw (it boxes them) are drawn as small vectors: ✅ and 🚀. The
other layers are Motion Lab's, byte for byte.

Usage (needs Python 3 with fontTools): python3 build-visual.py
Writes visual.svg beside this file; scripts/motion-export/pack.mjs uses it for motion 10.
"""
import html, os, re
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

here = os.path.dirname(os.path.abspath(__file__))
website = os.path.abspath(os.path.join(here, '../../../..'))
motion_lab = os.path.abspath(os.path.join(website, '..', 'Motion Lab'))
source = open(os.path.join(motion_lab, 'src/motion-lab/bifrost-content/motion-10/visual.svg'), encoding='utf8').read()
layer = open(os.path.join(here, 'load-balancer-layer.svg'), encoding='utf8').read()

# Where the layer sits in the artwork: its export's origin, found from the same backdrop
# element in both files (Motion Lab's at 44.6372 223.792, the layer's own at -13.4057 -5.55196).
OFFSET = (58.0429, 229.344)
# The old layer is exactly one group in Motion Lab's export (Figma names it after the node).
start = source.index('<g id="Group 1171275390">')
depth = 0
for tag in re.finditer(r'<(/?)g\b[^>]*?(/?)>', source[start:]):
    if tag.group(1):
        depth -= 1
    elif not tag.group(2):
        depth += 1
    if depth == 0:
        end = start + tag.end()
        break
assert '<foreignObject x="44.6372" y="223.792"' in source[start:end], 'not the load-balancer layer'

font = TTFont(os.path.join(website, 'public/motions/fonts/geist-mono-latin-400.woff2'))
upm = font['head'].unitsPerEm
cmap = font.getBestCmap()
glyph_set = font.getGlyphSet()
advance = {code: font['hmtx'][name][0] / upm for code, name in cmap.items()}


def number(value):
    text = f'{value:.4f}'.rstrip('0').rstrip('.')
    return '0' if text in ('-0', '') else text


# The two emoji, in em units with the baseline at 0, each 1 em wide (as Figma lays them out).
EMOJI = {
    '✅': ('bg-emoji-check', '<rect x="0.06" y="-0.78" width="0.88" height="0.88" rx="0.2" fill="#34C759"/>'
               '<path d="M0.25 -0.33L0.43 -0.15L0.76 -0.56" stroke="#fff" stroke-width="0.13" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'),
    '\U0001F680': ('bg-emoji-rocket', '<g transform="rotate(45 0.5 -0.34)">'
                   '<path d="M0.5 -0.86C0.66 -0.7 0.7 -0.45 0.66 -0.12H0.34C0.3 -0.45 0.34 -0.7 0.5 -0.86Z" fill="#D8DDE2"/>'
                   '<circle cx="0.5" cy="-0.5" r="0.08" fill="#3C87C8"/>'
                   '<path d="M0.34 -0.3L0.2 -0.08H0.36ZM0.66 -0.3L0.8 -0.08H0.64Z" fill="#E1473D"/>'
                   '<path d="M0.4 -0.1H0.6L0.5 0.14Z" fill="#F6A623"/></g>'),
}

used = set()


def outline(match):
    """One <text> as uses of shared glyphs, at the pen positions Figma's layout gives."""
    attrs, x, y, content = match.group(1), float(match.group(2)), float(match.group(3)), html.unescape(match.group(4))
    transform = re.search(r'transform="([^"]+)"', attrs).group(1)
    fill = re.search(r'fill="([^"]+)"', attrs).group(1)
    size = float(re.search(r'font-size="([\d.]+)"', attrs).group(1))
    spacing = float(re.search(r'letter-spacing="([\d.]+)em"', attrs).group(1))
    pen, uses = x, []
    for char in content:
        if char in EMOJI:
            uses.append(f'<use href="#{EMOJI[char][0]}" transform="translate({number(pen)} {number(y)}) scale({number(size)})"/>')
            used.add(char)
            pen += (1 + spacing) * size
            continue
        code = ord(char)
        if code not in cmap:
            raise SystemExit(f'Geist Mono has no glyph for {char!r}')
        if not char.isspace():
            used.add(char)
            uses.append(f'<use href="#bg-{code:x}" transform="translate({number(pen)} {number(y)}) scale({number(size)})"/>')
        pen += (advance[code] + spacing) * size
    return f'<g transform="{transform}" fill="{fill}">{"".join(uses)}</g>'


inner = layer[layer.index('>') + 1:layer.rindex('</svg>')]
inner = re.sub(r'<text([^>]*)><tspan x="([-\d.]+)" y="([-\d.]+)">([^<]*)</tspan></text>', outline, inner)
if '<text' in inner:
    raise SystemExit('a text element was not converted')

glyphs = []
for char in sorted(used):
    if char in EMOJI:
        glyphs.append(f'<g id="{EMOJI[char][0]}">{EMOJI[char][1]}</g>')
        continue
    pen = SVGPathPen(glyph_set, ntos=number)
    glyph_set[cmap[ord(char)]].draw(TransformPen(pen, (1 / upm, 0, 0, -1 / upm, 0, 0)))
    glyphs.append(f'<path id="bg-{ord(char):x}" d="{pen.getCommands()}"/>')
inner = inner.replace('<defs>', '<defs>' + ''.join(glyphs), 1)

svg = source[:start] + f'<g transform="translate({OFFSET[0]} {OFFSET[1]})">{inner}</g>' + source[end:]


# Drop what only the old layer used: definitions nothing refers to any more.
def top_level_defs(text):
    a = text.rindex('<defs>') + len('<defs>')
    b = text.rindex('</defs>')
    body, items, i = text[a:b], [], 0
    for m in re.finditer(r'<(/?)([A-Za-z][\w:-]*)([^>]*?)(/?)>', body):
        closing, tag, _, self_closing = m.groups()
        if not closing and i == 0:
            item_start = m.start()
        if closing:
            i -= 1
        elif not self_closing:
            i += 1
        if i == 0:
            items.append((a + item_start, a + m.end()))
    return items


while True:
    referenced = set(re.findall(r'url\(#([^)]+)\)', svg)) | set(re.findall(r'href="#([^"]+)"', svg))
    dead = []
    for a, b in top_level_defs(svg):
        ident = re.match(r'<[^>]*\sid="([^"]+)"', svg[a:b])
        if ident and ident.group(1) not in referenced:
            dead.append((a, b))
    if not dead:
        break
    for a, b in reversed(dead):
        svg = svg[:a] + svg[b:]

with open(os.path.join(here, 'visual.svg'), 'w', encoding='utf8') as out:
    out.write(svg)
print(f'visual.svg: {len(source) // 1024} KB -> {len(svg) // 1024} KB ({len(used)} shapes shared across {len(re.findall("<use ", inner))} characters)')
