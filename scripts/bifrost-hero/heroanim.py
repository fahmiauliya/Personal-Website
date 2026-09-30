# python3 heroanim.py — Hero-bg-home.riv (Bifrost motion 02/03's background) as two layers, from
# the Rive runtime's own drawing (record.mjs):
#   static.svg    everything that never moves (an image: drawn once)
#   animated.svg  everything that moves, as SMIL, each piece on its own loop:
#     - the 20 wind lines (main timeline, frames 16–46 at speed 0.5: 2s), sliding and wrapping
#     - the nested artboards, each defined once in its own coordinates and placed per instance:
#       Corong ×2 (the funnels: rim ticks, flowing curves, a mask), Number ×2 (code blocks),
#       Binary ×2 (the 0/1 circles), recorded frame by frame at 60fps over their loops.
# Every id starts with "hb", so a page can make them unique per copy.
import json, collections, math, os, re

W, H = 1200, 538
MAIN = json.load(open('rec-main0.json'))[0]
HF = json.load(open('hero-frames.json'))['frames']
NESTED = {name: json.load(open(f'rec-{name.lower()}.json')) for name in ('Corong', 'Number', 'Binary')}
CANDIDATE_LOOPS = [18, 28, 41, 80, 120, 900]   # 60fps frames

def num(v, p=1):
    s = f'{v:.{p}f}'.rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s
def d_of(cmds, p=1):
    return ''.join('Z' if c[0] == 'Z' else c[0] + ' '.join(num(v, p) for v in c[1:]) for c in cmds)
def mat(t): return ' '.join(num(v, 3) for v in t)
def tf(t): return '' if t == [1, 0, 0, 1, 0, 0] else f' transform="matrix({mat(t)})"'
def mul(A, B): return [A[0]*B[0] + A[2]*B[1], A[1]*B[0] + A[3]*B[1], A[0]*B[2] + A[2]*B[3], A[1]*B[2] + A[3]*B[3], A[0]*B[4] + A[2]*B[5] + A[4], A[1]*B[4] + A[3]*B[5] + A[5]]
def inv(m):
    det = m[0]*m[3] - m[1]*m[2]
    return [m[3]/det, -m[1]/det, -m[2]/det, m[0]/det, (m[2]*m[5] - m[3]*m[4])/det, (m[1]*m[4] - m[0]*m[5])/det]
def bake(cmds, t):
    """A path's commands with the affine matrix t applied to every point."""
    out = []
    for c in cmds:
        if c[0] == 'Z': out.append(['Z']); continue
        new = [c[0]]
        for j in range(1, len(c), 2): new += [t[0]*c[j] + t[2]*c[j+1] + t[4], t[1]*c[j] + t[3]*c[j+1] + t[5]]
        out.append(new)
    return out
def paint(o):
    if not isinstance(o.get('style'), str) or o.get('alpha', 1) != 1 or o.get('comp') not in (None, 'source-over'): raise SystemExit(f'unexpected paint {o}')
    if o['op'] == 'fill': return f'fill="{o["style"]}"' + (' fill-rule="evenodd"' if o.get('rule') == 'evenodd' else '')
    return (f'fill="none" stroke="{o["style"]}" stroke-width="{num(o["width"], 2)}"' + (f' stroke-linecap="{o["cap"]}"' if o.get('cap', 'butt') != 'butt' else '')
            + (f' stroke-linejoin="{o["join"]}"' if o.get('join', 'miter') != 'miter' else ''))
def invisible(o): return isinstance(o.get('style'), str) and o['style'].replace(' ', '').endswith(',0)')
def rkey(v): return json.dumps(json.loads(json.dumps(v), parse_float=lambda s: round(float(s), 2)))
def md(a, b):
    """Largest numeric difference between two recorded values (999: different shape)."""
    if isinstance(a, (int, float)) and isinstance(b, (int, float)): return abs(a - b)
    if isinstance(a, list) and isinstance(b, list): return 999 if len(a) != len(b) else max([md(x, y) for x, y in zip(a, b)] or [0])
    return 0 if a == b else 999

def glyphs_of(cmds):
    """A text row's outline split into glyphs (a contour and the contours inside its box, e.g. a
    0's counter), each as (its outline moved to start at 0,0, dx, dy)."""
    subs, cur = [], []
    for c in cmds:
        if c[0] == 'M' and cur: subs.append(cur); cur = []
        cur.append(c)
    if cur: subs.append(cur)
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
    out = []
    for g in glyphs:
        x0, y0 = g[0][0][1], g[0][0][2]
        moved = [[c[0]] + [v - (x0 if k % 2 == 0 else y0) for k, v in enumerate(c[1:])] for sp in g for c in sp]
        out.append((d_of(moved, 2), x0, y0))
    return out

# ---- where each nested artboard is drawn in the main artboard. The nested recordings keep
# drawing and clip ops only (no save/restore), so they're matched against the main list without
# them; MF maps those positions back to main indices.
MF = [i for i, o in enumerate(MAIN) if o['op'] not in ('save', 'restore')]
def same_shape(a, b): return a['op'] == b['op'] and rkey(a.get('path')) == rkey(b.get('path')) and a.get('style') == b.get('style')
instances = []   # (name, main indices of its ops in order, M)
for name, frames in NESTED.items():
    L = frames[0]; s = 0
    while s + len(L) <= len(MF):
        if all(same_shape(MAIN[MF[s + j]], L[j]) for j in range(len(L))):
            M = mul(MAIN[MF[s]]['t'], inv(L[0]['t']))
            err = max(abs(a - b) for j in range(len(L)) for a, b in zip(mul(M, L[j]['t']), MAIN[MF[s + j]]['t']))
            if err > 0.01: raise SystemExit(f'{name} at {s}: transform mismatch {err}')
            instances.append((name, [MF[s + j] for j in range(len(L))], M)); s += len(L)
        else: s += 1
print('instances', [(n, idx[0], idx[-1], [round(v, 2) for v in M]) for n, idx, M in instances])
inst_of = {i: (k, j) for k, (name, idx, M) in enumerate(instances) for j, i in enumerate(idx)}

# ---- which ops move: the wind lines on the main timeline; in nested artboards, from their frames
wind = [i for i in range(len(MAIN)) if i not in inst_of and any(rkey(f[i]) != rkey(HF[0][i]) for f in HF)]
moving = {name: {j for j in range(len(fr[0])) if any(rkey(f[j].get('path')) != rkey(fr[0][j].get('path')) or rkey(f[j].get('t')) != rkey(fr[0][j].get('t')) for f in fr)} for name, fr in NESTED.items()}
print('wind lines', len(wind), 'moving', {n: len(m) for n, m in moving.items()})

# ---- clip stacks: for each main op, the clips (main indices) active when it's drawn
stacks, clips, saves = {}, [], []
for i, o in enumerate(MAIN):
    if o['op'] == 'save': saves.append(len(clips))
    elif o['op'] == 'restore': del clips[saves.pop():]
    elif o['op'] == 'clip': stacks[i] = list(clips); clips.append(i)
    else: stacks[i] = list(clips)
def local_stacks(name):
    """A nested artboard's own clip stack per op (local indices), from its first instance."""
    idx = next(ix for n, ix, M in instances if n == name); local = {i: j for j, i in enumerate(idx)}
    return {j: [local[c] for c in stacks[i] if c in local] for j, i in enumerate(idx)}
# ops that don't move themselves but are drawn under a clip that does: drawn with the moving parts
under_moving = {name: {j for j, cs in local_stacks(name).items() if j not in moving[name] and any(c in moving[name] for c in cs)} for name in NESTED}
print('under a moving clip', {n: len(u) for n, u in under_moving.items()})
def clipdef(pid, o): return f'<clipPath id="{pid}"><path{tf(o["t"])} d="{d_of(o["path"])}"/></clipPath>'

# ---- static layer
def static_layer():
    defs, body, used, shared = [], [], set(), {}
    counts = collections.Counter(d_of(o['path']) for o in MAIN if o['op'] in ('fill', 'stroke'))
    for i, o in enumerate(MAIN):
        if o['op'] not in ('fill', 'stroke') or invisible(o) or i in wind: continue
        if i in inst_of:
            k, j = inst_of[i]; name = instances[k][0]
            if j in moving[name] or j in under_moving[name]: continue
        key = d_of(o['path'])
        if counts[key] > 1:
            if key not in shared: shared[key] = f's{len(shared)}'; defs.append(f'<path id="{shared[key]}" d="{key}"/>')
            el = f'<use href="#{shared[key]}"{tf(o["t"])} {paint(o)}/>'
        else: el = f'<path{tf(o["t"])} {paint(o)} d="{key}"/>'
        for c in reversed(stacks[i]): el = f'<g clip-path="url(#sc{c})">{el}</g>'; used.add(c)
        body.append(el)
    cdefs = [clipdef(f'sc{c}', MAIN[c]) for c in sorted(used)]
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}"><defs>{"".join(cdefs + defs)}</defs>{"".join(body)}</svg>'

# ---- SMIL: one value per 60fps frame over the loop, consecutive repeats merged
def discrete(attr, values, period):
    keys, vals = [], []
    for k, v in enumerate(values):
        if not vals or v != vals[-1]: keys.append(k / period); vals.append(v)
    if len(vals) == 1: return ''
    tag = 'animateTransform' if attr == 'translate' else 'animate'
    kind = ' attributeName="transform" type="translate"' if attr == 'translate' else f' attributeName="{attr}"'
    return (f'<{tag}{kind} dur="{num(period / 60, 4)}s" repeatCount="indefinite" calcMode="discrete" '
            f'keyTimes="{";".join(num(k, 5) for k in keys)}" values="{";".join(vals)}"/>')

# ---- a nested artboard's moving parts, in its own coordinates, as one <g>
def nested_group(name, pre):
    fr = NESTED[name]; L = fr[0]; mv = moving[name]; st = local_stacks(name)
    defs, body, used, shared_states, rows, glyph_ids = [], [], set(), {}, {}, {}
    def own_period(j):
        seq = [[f[j].get('path'), f[j].get('t')] for f in fr]
        for p in CANDIDATE_LOOPS:
            # a few frames a loop may differ (float jitter where a trim wraps)
            if p < len(seq) and sum(md(seq[k], seq[k + p]) > 0.05 for k in range(1, len(seq) - p)) <= 3 * ((len(seq) - p) // p + 1): return p
        raise SystemExit(f'{name} op {j}: no loop found')
    def clipped(el, j):
        for c in reversed(st[j]): el = f'<g clip-path="url(#{pre}c{c})">{el}</g>'; used.add(c)
        return el
    # consecutive moving drawing ops with the same paint and clip stack form a group
    groups, cur = [], []
    for j, o in enumerate(L):
        if j in mv and o['op'] in ('fill', 'stroke'):
            if cur and paint(L[cur[-1]]) == paint(o) and st[cur[-1]] == st[j] and cur[-1] == j - 1: cur.append(j)
            else:
                if cur: groups.append(cur)
                cur = [j]
    if cur: groups.append(cur)
    for g in groups:
        o = L[g[0]]
        same_path = all(rkey(f[j]['path']) == rkey(L[j]['path']) and rkey(f[j]['t'][:4]) == rkey(L[j]['t'][:4]) for j in g for f in fr)
        if same_path and all(len(L[j]['path']) > 200 for j in g):
            # large shapes that only move (Binary's rows): each row once, as its glyphs (each digit
            # shape stored once), moved by a translate
            for j in g:
                p = own_period(j); key = d_of(L[j]['path'])
                if key not in rows:
                    uses = []
                    for gd, gx, gy in glyphs_of(L[j]['path']):
                        if gd not in glyph_ids: glyph_ids[gd] = f'{pre}g{len(glyph_ids)}'; defs.append(f'<path id="{glyph_ids[gd]}" d="{gd}"/>')
                        uses.append(f'<use href="#{glyph_ids[gd]}" x="{num(gx, 2)}" y="{num(gy, 2)}"/>')
                    rows[key] = f'{pre}p{len(rows)}'; defs.append(f'<g id="{rows[key]}">{"".join(uses)}</g>')
                vals = [f'{num(f[j]["t"][4] - L[j]["t"][4], 2)} {num(f[j]["t"][5] - L[j]["t"][5], 2)}' for f in fr[:p]]
                body.append((j, clipped(f'<g>{discrete("translate", vals, p)}<use href="#{rows[key]}"{tf(L[j]["t"])} {paint(o)}/></g>', j)))
            continue
        if all(len({rkey(f[j]['path']) for f in fr}) <= 12 and len(L[j]['path']) > 60 for j in g) and all(rkey(f[j]['t']) == rkey(L[j]['t']) for j in g for f in fr):
            # shapes that swap between a few states (Number's rows): each state once, shown in turn
            for j in g:
                p = own_period(j); states = []
                for f in fr[:p]:
                    k = d_of(f[j]['path'])
                    if k not in states: states.append(k)
                for sd in states:
                    if sd not in shared_states: shared_states[sd] = f'{pre}n{len(shared_states)}'; defs.append(f'<path id="{shared_states[sd]}" d="{sd}"/>')
                    vis = ['visible' if d_of(f[j]['path']) == sd else 'hidden' for f in fr[:p]]
                    body.append((j, clipped(f'<use href="#{shared_states[sd]}"{tf(L[j]["t"])} {paint(o)} visibility="{vis[0]}">{discrete("visibility", vis, p)}</use>', j)))
            continue
        if same_path and len(g) > 2:
            # the rim ticks: one shape on one track, each a fixed number of frames behind the first.
            # Those evenly spaced (every `gap` frames) repeat as a set every `gap` frames: one path
            # of them all, `gap` frames long. Any other is moved on its own.
            track = [(f[g[0]]['t'][4], f[g[0]]['t'][5]) for f in fr]
            def phase(j):
                x, y = L[j]['t'][4], L[j]['t'][5]
                return min(range(len(track) - 1), key=lambda k: math.hypot(track[k][0] - x, track[k][1] - y))
            ph = {j: phase(j) for j in g}; sp = sorted(ph.values())
            gap = collections.Counter(b - a for a, b in zip(sp, sp[1:])).most_common(1)[0][0]
            even = [j for j in g if ph[j] % gap == 0]; odd = [j for j in g if j not in even]
            per_frame = [''.join(sorted(d_of(bake(f[j]['path'], f[j]['t'])) for j in even)) for f in fr]
            vals = per_frame[1:gap + 1]; vals = [vals[-1]] + vals[:-1]   # frame 0 is the loop's end state
            print(f'  {name}: {len(even)} ticks every {gap} frames, {len(odd)} moved alone')
            body.append((g[0], clipped(f'<path {paint(o)} d="{vals[0]}">{discrete("d", vals, gap)}</path>', g[0])))
            for j in odd:
                p = len(fr) - 1
                vals = [f'{num(f[j]["t"][4] - L[j]["t"][4], 2)} {num(f[j]["t"][5] - L[j]["t"][5], 2)}' for f in fr[1:p + 1]]; vals = [vals[-1]] + vals[:-1]
                body.append((j, clipped(f'<g>{discrete("translate", vals, p)}<path{tf(L[j]["t"])} {paint(o)} d="{d_of(L[j]["path"])}"/></g>', j)))
            continue
        # the rest (the funnel curves): one path, its outline given per frame (points baked in the
        # artboard's coordinates), over the group's loop
        periods = {own_period(j) for j in g}
        if len(periods) != 1: raise SystemExit(f'{name}: group loops differ {periods}')
        p = periods.pop()
        per_frame = [''.join(d_of(bake(f[j]['path'], f[j]['t'])) for j in g) for f in fr]
        vals = per_frame[1:p + 1]; vals = [vals[-1]] + vals[:-1]
        print(f'  {name}: group of {len(g)} ({o["op"]}), loop {p} frames')
        body.append((g[0], clipped(f'<path {paint(o)} d="{vals[0]}">{discrete("d", vals, p)}</path>', g[0])))
    # ops under a moving clip, as they are
    for j in sorted(under_moving[name]):
        o = L[j]
        if o['op'] in ('fill', 'stroke') and not invisible(o): body.append((j, clipped(f'<path{tf(o["t"])} {paint(o)} d="{d_of(o["path"])}"/>', j)))
    body = [el for j, el in sorted(body, key=lambda x: x[0])]
    # clips, the moving ones over their loop
    cdefs = []
    for c in sorted(used):
        if c in mv:
            p = own_period(c)
            vals = [d_of(bake(f[c]['path'], f[c]['t'])) for f in fr[1:p + 1]]; vals = [vals[-1]] + vals[:-1]
            cdefs.append(f'<clipPath id="{pre}c{c}"><path d="{vals[0]}">{discrete("d", vals, p)}</path></clipPath>')
        else: cdefs.append(clipdef(f'{pre}c{c}', L[c]))
    return cdefs + defs, f'<g id="{pre}">{"".join(body)}</g>'

# ---- the wind lines: each dash slides at its constant speed, wrapping off the artboard, over the
# main timeline's loop (30 timeline frames at speed 0.5)
def wind_lines():
    FR = len(HF) - 1; DUR = FR / 30 / 0.5; out = {}
    for i in wind:
        xs = [f[i]['path'][0][1] for f in HF]; ends = [f[i]['path'][1][1] for f in HF]
        length = max(e - s for s, e in zip(xs, ends)); steps = [b - a for a, b in zip(xs, xs[1:])]
        v = collections.Counter(round(s, 1) for s in steps).most_common(1)[0][0]
        v = sum(s for s in steps if abs(s - v) < 0.1) / sum(1 for s in steps if abs(s - v) < 0.1)
        period = max(abs(s - v) for s in steps)
        full = next(k for k in range(len(HF)) if abs((ends[k] - xs[k]) - length) < 0.01 and all(abs(s - v) < 0.1 for s in steps[:k]))
        s0 = xs[full] - v * full; tx = HF[0][i]['t'][4]; lo = -tx - length - 1; s0 = lo + (s0 - lo) % period
        for k in range(len(HF)):   # the model against every frame where the dash is whole and on the artboard
            s = lo + (s0 + v * k - lo) % period
            if abs((ends[k] - xs[k]) - length) < 0.01 and -length < xs[k] + tx < W and abs(s - xs[k]) > 0.02: raise SystemExit(f'wind {i} frame {k}: {s} vs {xs[k]}')
        keys, vals = [0], [0]; travel = v * FR
        edge = lo - s0 if v < 0 else lo + period - s0
        if abs(edge) < abs(travel):
            t = edge / travel; keys += [t, t]; vals += [edge, edge + (period if v < 0 else -period)]
        keys.append(1); vals.append(travel + (period if v < 0 else -period) * (len(keys) > 2))
        o = HF[0][i]
        anim = (f'<animateTransform attributeName="transform" type="translate" additive="sum" dur="{num(DUR, 3)}s" repeatCount="indefinite" '
                f'keyTimes="{";".join(num(k, 4) for k in keys)}" values="{";".join(num(x, 2) for x in vals)}"/>')
        out[i] = f'<path{tf(o["t"])} {paint(o)} d="M{num(s0, 2)} 0H{num(s0 + length, 2)}">{anim}</path>'
    return out

def animated_layer():
    defs, body, used, groups = [], [], set(), {}
    for name in NESTED:
        pre = name[0].lower(); d, g = nested_group(name, pre); groups[name] = pre; defs += d + [g]
    lines = wind_lines(); placed = set()
    for i, o in enumerate(MAIN):   # drawing order: each instance where its first op is, each wind line where it is
        if i in inst_of:
            k, _ = inst_of[i]
            if k in placed: continue
            placed.add(k); name, idx, M = instances[k]
            el = f'<use href="#{groups[name]}" transform="matrix({mat(M)})"/>'
            for c in reversed(stacks[idx[0]]):
                if c not in idx: el = f'<g clip-path="url(#mc{c})">{el}</g>'; used.add(c)
            body.append(el)
        elif i in lines:
            el = lines[i]
            for c in reversed(stacks[i]): el = f'<g clip-path="url(#mc{c})">{el}</g>'; used.add(c)
            body.append(el)
    cdefs = [clipdef(f'mc{c}', MAIN[c]) for c in sorted(used)]
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}"><defs>{"".join(cdefs + defs)}</defs>{"".join(body)}</svg>'

def prefixed(svg): return re.sub(r'(id="|url\(#|href="#)', r'\1hb', svg)
os.makedirs('hero2', exist_ok=True)
for name, svg in (('static', prefixed(static_layer())), ('animated', prefixed(animated_layer()))):
    open(f'hero2/{name}.svg', 'w').write(svg); print(name, len(svg) // 1024, 'KB')
