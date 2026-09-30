# python3 rive2smil.py <name> <out.svg> [loop frames,...] — a Rive file's recorded playback
# (rec2-<name>.json: every frame at 60fps, as the site plays it) as one SVG animated with SMIL.
#   - Shapes are lined up across frames by their order; a shape missing from a frame was not drawn
#     (hidden), so its visibility is animated.
#   - Each shape moves on its own loop (the file's candidate loop lengths, in frames), or plays once
#     and holds (an intro), from the start.
#   - Its transform is split into translate / rotate / scale groups; each part, its outline (when
#     it keeps its commands), colour and opacity are keyframed, keeping only the frames needed for
#     straight-line interpolation to stay within a small tolerance. Outlines that change their
#     commands are given per frame.
#   - Clips that move are animated the same way; drawing order is kept.
import sys, json, math, difflib, base64, io, collections
from rec2lib import load, md
from PIL import Image
import dashes

name, out = sys.argv[1], sys.argv[2]
# `timeline` (third argument): the recording is one timeline scrubbed frame by frame; every
# moving shape is keyframed across all of it (once, holding at the end), for a page to set the
# SVG's time itself.
TIMELINE = len(sys.argv) > 3 and sys.argv[3] == 'timeline'
info, F, images, empty = load(name)
W, H = info['w'], info['h']
N = len(F)

def num(v, p=2):
    s = f'{v:.{p}f}'.rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s
def d_of(cmds, p=2): return ''.join('Z' if c[0] == 'Z' else c[0] + ' '.join(num(v, p) for v in c[1:]) for c in cmds)
def bake(cmds, t):
    out = []
    for c in cmds:
        if c[0] == 'Z': out.append(['Z']); continue
        new = [c[0]]
        for j in range(1, len(c), 2): new += [t[0]*c[j] + t[2]*c[j+1] + t[4], t[1]*c[j] + t[3]*c[j+1] + t[5]]
        out.append(new)
    return out

# ---- line the frames up with the fullest one
def sig(o): return (o['op'], o.get('image')) if o['op'] in ('drawImage',) else (o['op'], isinstance(o.get('style'), str) if o['op'] in ('fill', 'stroke') else None)
master = max(F, key=len); msig = [sig(o) for o in master]
series = [[None] * N for _ in master]
for k, f in enumerate(F):
    if len(f) == len(master) and [sig(o) for o in f] == msig:
        for i, o in enumerate(f): series[i][k] = o
        continue
    sm = difflib.SequenceMatcher(a=msig, b=[sig(o) for o in f], autojunk=False)
    matched = 0
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == 'equal':
            for d in range(i2 - i1): series[i1 + d][k] = f[j1 + d]; matched += 1
    if matched != len(f): raise SystemExit(f'frame {k}: {len(f) - matched} ops not in the fullest frame')

# clip stacks from the fullest frame's save/restore structure
stacks, clips, saves = {}, [], []
for i, o in enumerate(master):
    if o['op'] == 'save': saves.append(len(clips))
    elif o['op'] == 'restore': del clips[saves.pop():]
    elif o['op'] == 'clip': stacks[i] = list(clips); clips.append(i)
    else: stacks[i] = list(clips)

# ---- loops
def same(a, b, tol=0.05):
    if a is None or b is None: return a is None and b is None
    return md(a, b) <= tol
def fingerprint(o):
    if o is None: return None
    return json.dumps([o.get('path'), o.get('t'), o.get('style'), o.get('alpha')], default=str, separators=(',', ':')) if False else \
        hash(json.dumps(json.loads(json.dumps([o.get('path'), o.get('t'), o.get('style'), o.get('alpha')]), parse_float=lambda x: round(float(x), 1))))
def loop_of(seq):
    """('static',), ('loop', P) or ('once', S): the smallest loop length in frames (up to 12s), or the
    frame after which it holds."""
    if all(same(s, seq[0], 0.01) for s in seq): return ('static',)
    if TIMELINE: return ('once', N - 1)
    # an intro that then holds: from the first frame after which it stays at its final value
    settle = 1 + max(k for k in range(N) if not same(seq[k], seq[-1], 0.0005))
    if settle < N - 300: return ('once', settle)
    for P in range(2, min(721, N - 300)):
        limit = 3 + (N - P) // 200; bad = 0
        for k in range(N - P):
            if not same(seq[k], seq[k + P]):
                bad += 1
                if bad > limit: break
        if bad <= limit:
            # of this length and the next few, the one that repeats most exactly
            score = lambda Q: sum(md(seq[k], seq[k + Q]) if seq[k] is not None and seq[k + Q] is not None else (0 if seq[k] is seq[k + Q] else 99) for k in range(N - Q))
            return ('loop', min(range(P, min(P + 4, N - 300)), key=score))
    last = max(k for k in range(1, N) if not same(seq[k], seq[k - 1], 0.01))
    if last < N - 300: return ('once', last + 1)
    raise SystemExit(f'no loop for {seq[0]["op"]} {seq[0].get("style")}')

# ---- keyframes
def reduce(vals, tol):
    """Indices of the frames to keep so straight lines between them stay within tol."""
    keys = [0]; i = 0; n = len(vals)
    while i < n - 1:
        j = i + 1
        while j + 1 < n:
            ok = True
            for m in range(i + 1, j + 1):
                t = (m - i) / (j + 1 - i)
                if any(abs(a + (b - a) * t - c) > tol for a, b, c in zip(vals[i], vals[j + 1], vals[m])): ok = False; break
            if not ok: break
            j += 1
        keys.append(j); i = j
    return keys
def anim(attr, frames, render, span, mode, tol, kind='animate', extra=''):
    """frames: numeric vectors (or strings for discrete) per frame over `span` frames (+1 closing)."""
    dur = num(span / 60, 4)
    rep = 'repeatCount="indefinite"' if mode == 'loop' else 'fill="freeze"'
    if tol is None:   # discrete
        keys, vals = [], []
        for k, v in enumerate(frames[:span]):
            if not vals or v != vals[-1]: keys.append(k / span); vals.append(v)
        if mode == 'once' and frames[span] != vals[-1]: keys.append(1); vals.append(frames[span])
        if len(vals) == 1: return None, vals[0]
        return (f'<{kind} attributeName="{attr}"{extra} dur="{dur}s" {rep} calcMode="discrete" keyTimes="{";".join(num(k, 5) for k in keys)}" values="{";".join(vals)}"/>'), vals[0]
    ks = reduce(frames[:span + 1], tol)
    vals = [render(frames[k]) for k in ks]
    if len(set(vals)) == 1: return None, vals[0]
    return (f'<{kind} attributeName="{attr}"{extra} dur="{dur}s" {rep} keyTimes="{";".join(num(k / span, 5) for k in ks)}" values="{";".join(vals)}"/>'), vals[0]

def decompose(t):
    a, b, c, d, e, f = t
    sx = math.hypot(a, b); rot = math.degrees(math.atan2(b, a)) if sx > 1e-9 else 0.0
    det = a * d - b * c; sy = det / sx if sx > 1e-9 else math.hypot(c, d)
    # rebuild and check there's no skew
    r = math.radians(rot)
    if abs(-math.sin(r) * sy - c) > 1e-3 or abs(math.cos(r) * sy - d) > 1e-3: return None
    return e, f, rot, sx, sy
def unwrap(angles):
    out = []
    for a in angles:
        if out:
            while a - out[-1] > 180: a -= 360
            while a - out[-1] < -180: a += 360
        out.append(a)
    return out

gradients = {}
def gradient(g):
    """A canvas gradient as an SVG gradient (in the shape's own coordinates), stored once."""
    key = json.dumps(g, sort_keys=True)
    if key not in gradients:
        gid = f'rvg{len(gradients)}'
        stops = ''
        for off, col in g['stops']:
            m = __import__('re').match(r'rgba?\(([^)]*)\)', col.replace(' ', ''))
            if m:
                parts = m.group(1).split(','); rgb = f'rgb({parts[0]},{parts[1]},{parts[2]})'; a = float(parts[3]) if len(parts) > 3 else 1
            else: rgb, a = col, 1
            stops += f'<stop offset="{num(off, 4)}" stop-color="{rgb}"' + ('' if a == 1 else f' stop-opacity="{num(a, 4)}"') + '/>'
        x = [num(v, 3) for v in g['args']]
        if g['type'] == 'linear': el = f'<linearGradient id="{gid}" gradientUnits="userSpaceOnUse" x1="{x[0]}" y1="{x[1]}" x2="{x[2]}" y2="{x[3]}">{stops}</linearGradient>'
        else: el = f'<radialGradient id="{gid}" gradientUnits="userSpaceOnUse" fx="{x[0]}" fy="{x[1]}" fr="{x[2]}" cx="{x[3]}" cy="{x[4]}" r="{x[5]}">{stops}</radialGradient>'
        gradients[key] = (gid, el)
    return f'url(#{gradients[key][0]})'
def colour(style): return style if isinstance(style, str) else gradient(style)
def paint(o):
    if o.get('comp') not in (None, 'source-over'): raise SystemExit(f'composite {o["comp"]}')
    if o['op'] == 'fill': return f'fill="{colour(o["style"])}"' + (' fill-rule="evenodd"' if o.get('rule') == 'evenodd' else '')
    return (f'fill="none" stroke="{colour(o["style"])}" stroke-width="{num(o["width"], 3)}"' + (f' stroke-linecap="{o["cap"]}"' if o.get('cap', 'butt') != 'butt' else '')
            + (f' stroke-linejoin="{o["join"]}"' if o.get('join', 'miter') != 'miter' else ''))

image_uris = []
for u in images:
    im = Image.open(io.BytesIO(base64.b64decode(u.split(',', 1)[1]))); buf = io.BytesIO()
    # small images lossless; a large photographic one (a render) at high quality
    if im.width * im.height > 1_000_000: im.save(buf, 'WEBP', quality=92, method=6)
    else: im.save(buf, 'WEBP', lossless=True, quality=100, method=6)
    image_uris.append('data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode())

stats = collections.Counter()
def element(i, clip_pid=None):
    """The SVG for drawing op i (or, with clip_pid, the <clipPath> for clip op i)."""
    seq = series[i]; o0 = next(o for o in seq if o)
    lp = loop_of(seq)
    if lp[0] == 'static':
        stats['static'] += 1
        if clip_pid: return f'<clipPath id="{clip_pid}"><path d="{d_of(bake(o0["path"], o0["t"]))}"/></clipPath>'
        body = image_el(o0) if o0['op'] == 'drawImage' else (glyph_el(o0) or f'<path {paint(o0)} d="{d_of(o0["path"])}"/>')
        return wrap_t(body, o0['t'], o0.get('alpha', 1))
    mode, span = ('once', N - 1) if TIMELINE else ('loop', lp[1]) if lp[0] == 'loop' else ('once', lp[1])
    stats[f'{mode} {span}'] += 1
    dashed = dashed_el(seq, span, mode)
    if dashed: stats['dashed'] += 1; return dashed
    fr = seq[:span + 1] if mode == 'loop' else seq[:span + 1]
    # hidden frames: hold the nearest drawn value for everything else
    filled, last = [], o0
    for o in fr: last = o or last; filled.append(last)
    anims = []
    vis = ['visible' if o else 'hidden' for o in fr]
    if 'hidden' in vis:
        a, v0 = anim('visibility', vis, None, span, mode, None, extra='')
        anims_vis = (a, v0)
    else: anims_vis = (None, 'visible')
    if clip_pid:
        paths = [bake(o['path'], o['t']) for o in filled]
        pieces = split_pieces(paths)
        if pieces:
            stats['clip in pieces'] += 1
            return f'<clipPath id="{clip_pid}">{"".join(piece_el(p, span, mode) for p in pieces)}</clipPath>'
        return f'<clipPath id="{clip_pid}">{path_el(paths, span, mode, "")}</clipPath>'
    # transform parts
    parts = [decompose(o['t']) for o in filled]
    if any(p is None for p in parts):
        # skewed: bake the transform into the outline per frame
        paths = [bake(o['path'], o['t']) for o in filled]
        body = path_el(paths, span, mode, paint(o0), style_anims(filled, span, mode), anims_vis)
        stats['baked'] += 1
        return body
    tr = [(p[0], p[1]) for p in parts]; rot = unwrap([p[2] for p in parts]); sc = [(p[3], p[4]) for p in parts]
    inner = image_el(o0) if o0['op'] == 'drawImage' else path_el([o['path'] for o in filled], span, mode, paint(o0), style_anims(filled, span, mode), anims_vis, alpha_of(filled, span, mode))
    if o0['op'] == 'drawImage' and (anims_vis[0] or alpha_of(filled, span, mode)[0]):
        a = alpha_of(filled, span, mode)
        inner = inner.replace('/>', f' opacity="{a[1]}" visibility="{anims_vis[1]}">{a[0] or ""}{anims_vis[0] or ""}</image>', 1)
    g = inner
    a, v = anim('transform', [list(s) for s in sc], lambda s: f'{num(s[0], 4)} {num(s[1], 4)}', span, mode, 0.0005, 'animateTransform', ' type="scale"')
    if a or v != '1 1': g = f'<g transform="scale({v})">{a or ""}{g}</g>'
    a, v = anim('transform', [[r] for r in rot], lambda r: num(r[0], 3), span, mode, 0.05, 'animateTransform', ' type="rotate"')
    if a or v != '0': g = f'<g transform="rotate({v})">{a or ""}{g}</g>'
    a, v = anim('transform', [list(x) for x in tr], lambda x: f'{num(x[0])} {num(x[1])}', span, mode, 0.02, 'animateTransform', ' type="translate"')
    if a or v != '0 0': g = f'<g transform="translate({v})">{a or ""}{g}</g>'
    return g


def subpaths(p):
    out, cur = [], []
    for c in p:
        if c[0] == 'M' and cur: out.append(cur); cur = []
        cur.append(c)
    if cur: out.append(cur)
    return out
def split_pieces(paths):
    """A large moving outline made of many separate pieces (text, used as a mask) as its pieces,
    each over the frames — when every frame has the same pieces with the same commands."""
    frames = [subpaths(p) for p in paths]
    if len(frames[0]) < 20 or any(len(f) != len(frames[0]) for f in frames): return None
    shape = [tuple(c[0] for c in sp) for sp in frames[0]]
    if any([tuple(c[0] for c in sp) for sp in f] != shape for f in frames): return None
    return [[f[n] for f in frames] for n in range(len(frames[0]))]
def piece_el(frames, span, mode):
    """One piece: its outline once and a moving position if it only moves, else its outline keyframed."""
    ref = frames[0]
    pts = lambda sp: [(c[j], c[j + 1]) for c in sp if c[0] != 'Z' for j in range(1, len(c), 2)]
    r = pts(ref); moves = []
    for sp in frames:
        q = pts(sp); dx, dy = q[0][0] - r[0][0], q[0][1] - r[0][1]
        if max(max(abs(a[0] + dx - b[0]), abs(a[1] + dy - b[1])) for a, b in zip(r, q)) > 0.02: moves = None; break
        moves.append([dx, dy])
    if moves is not None:
        a, v = anim('transform', moves, lambda x: f'{num(x[0])} {num(x[1])}', span, mode, 0.02, 'animateTransform', ' type="translate"')
        if not a and v == '0 0': return f'<path d="{d_of(ref)}"/>'
        return f'<path transform="translate({v})" d="{d_of(ref)}">{a or ""}</path>'
    stats['clip piece reshaped'] += 1
    return path_el(frames, span, mode, '')

def alpha_of(filled, span, mode):
    al = [[o.get('alpha', 1)] for o in filled]
    if all(x == al[0] for x in al): return None, num(al[0][0], 3)
    return anim('opacity', al, lambda x: num(x[0], 3), span, mode, 0.005)
def style_anims(filled, span, mode):
    attr = 'fill' if filled[0]['op'] == 'fill' else 'stroke'
    out = ''
    st = [colour(o['style']) for o in filled]
    if any(s != st[0] for s in st):
        a, _ = anim(attr, st, None, span, mode, None); out += a or ''
    if attr == 'stroke':
        widths = [[o['width']] for o in filled]
        if any(abs(w[0] - widths[0][0]) > 1e-4 for w in widths):
            a, _ = anim('stroke-width', widths, lambda w: num(w[0], 3), span, mode, 0.005); out += a or ''
    return out
def path_el(paths, span, mode, paint_attrs, extra='', vis=(None, 'visible'), alpha=(None, '1')):
    if all(md(p, paths[0]) <= 0.005 for p in paths):
        g = glyph_el({'path': paths[0]}, paint_attrs)
        if g:
            attrs = ('' if alpha[1] == '1' else f' opacity="{alpha[1]}"') + ('' if vis[1] == 'visible' else f' visibility="{vis[1]}"')
            kids = extra + (alpha[0] or '') + (vis[0] or '')
            return g.replace('<g ', f'<g{attrs} ', 1).replace('>', '>' + kids, 1)
    structure = {tuple((c[0], len(c)) for c in p) for p in paths}
    if len(structure) == 1:
        flat = [[v for c in p for v in c[1:]] for p in paths]
        tmpl = paths[0]
        def render(vec):
            it = iter(vec); return d_of([[c[0]] + [next(it) for _ in c[1:]] for c in tmpl])
        a, d0 = anim('d', flat, render, span, mode, 0.02)
    else:
        a, d0 = anim('d', [d_of(p) for p in paths], None, span, mode, None)
    attrs = paint_attrs + ('' if alpha[1] == '1' else f' opacity="{alpha[1]}"') + ('' if vis[1] == 'visible' else f' visibility="{vis[1]}"')
    kids = (a or '') + extra + (alpha[0] or '') + (vis[0] or '')
    return f'<path {attrs} d="{d0}">{kids}</path>' if kids else f'<path {attrs} d="{d0}"/>'
def dashed_el(seq, span, mode):
    """A dashed stroke (its dashes moving along it) as one line with an animated dash offset."""
    fr = seq[:span + 1]
    if any(o is None for o in fr) or fr[0]['op'] != 'stroke' or not isinstance(fr[0]['style'], str): return None
    if 'rgba' in fr[0]['style'] and not fr[0]['style'].replace(' ', '').endswith(',1)'): return None
    if any(md(o['t'], fr[0]['t']) > 1e-6 or o['style'] != fr[0]['style'] for o in fr): return None
    paths = [o['path'] for o in fr]
    if not dashes.dash_like(paths): return None
    r = dashes.rebuild(paths)
    if r is None: return None
    poly, pattern, offsets, L = r
    a, v = anim('stroke-dashoffset', [[x] for x in offsets], lambda x: num(x[0], 3), span, mode, 0.01)
    d = 'M' + 'L'.join(f'{num(x)} {num(y)}' for x, y in poly)
    el = f'<path {paint(fr[0])} stroke-dasharray="{" ".join(num(x, 3) for x in pattern)}" stroke-dashoffset="{v}" d="{d}">{a or ""}</path>'
    return wrap_t(el, fr[0]['t'], fr[0].get('alpha', 1))

glyph_ids = {}
def glyph_el(o, paint_attrs=None):
    """A large static fill made of many small contours (text) as its glyphs, each shape stored once."""
    p = o['path']
    if len(p) < 150: return None
    subs, cur = [], []
    for c in p:
        if c[0] == 'M' and cur: subs.append(cur); cur = []
        cur.append(c)
    if cur: subs.append(cur)
    if len(subs) < 8: return None
    def box(sp):
        xs = [v for c in sp if c[0] != 'Z' for v in c[1::2]]; ys = [v for c in sp if c[0] != 'Z' for v in c[2::2]]
        return min(xs), min(ys), max(xs), max(ys)
    glyphs = []
    for sp in subs:
        b = box(sp)
        if glyphs:
            gb = box(glyphs[-1][0])
            if b[0] >= gb[0] - 0.01 and b[1] >= gb[1] - 0.01 and b[2] <= gb[2] + 0.01 and b[3] <= gb[3] + 0.01: glyphs[-1].append(sp); continue
        glyphs.append([sp])
    uses = []
    for g in glyphs:
        x0, y0 = g[0][0][1], g[0][0][2]
        moved = d_of([[c[0]] + [v - (x0 if k % 2 == 0 else y0) for k, v in enumerate(c[1:])] for sp in g for c in sp])
        if moved not in glyph_ids: glyph_ids[moved] = f'rvp{len(glyph_ids)}'
        uses.append(f'<use href="#{glyph_ids[moved]}" x="{num(x0)}" y="{num(y0)}"/>')
    return f'<g {paint_attrs or paint(o)}>{"".join(uses)}</g>'

def image_el(o):
    return f'<image href="{image_uris[o["image"]]}" width="{o["w"]}" height="{o["h"]}"/>'
def wrap_t(body, t, alpha):
    if alpha != 1: body = body.replace(' d="', f' opacity="{num(alpha, 3)}" d="', 1) if body.startswith('<path') else body.replace('<image ', f'<image opacity="{num(alpha, 3)}" ', 1)
    return body if t == [1, 0, 0, 1, 0, 0] else f'<g transform="matrix({" ".join(num(v, 4) for v in t)})">{body}</g>'

defs, body, clip_ids = [], [], {}
for i, o in enumerate(master):
    if o['op'] == 'clip':
        clip_ids[i] = f'rvc{i}'; defs.append(element(i, clip_ids[i]))
    elif o['op'] in ('fill', 'stroke', 'drawImage'):
        el = element(i)
        for c in reversed(stacks[i]): el = f'<g clip-path="url(#{clip_ids[c]})">{el}</g>'
        body.append(el)
defs += [el for gid, el in gradients.values()] + [f'<path id="{gid}" d="{d}"/>' for d, gid in glyph_ids.items()]
svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}"><defs>{"".join(defs)}</defs>{"".join(body)}</svg>'
open(out, 'w').write(svg)
print(name, f'{W}×{H}', dict(stats), len(svg) // 1024, 'KB')
