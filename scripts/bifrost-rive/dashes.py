# Dashed strokes: Rive draws a dashed line as its dashes (many short straight pieces). From those,
# over a loop, rebuild the line (straight runs), its dash and gap, and its dash offset per frame;
# then re-create every frame's dashes from that and check them against the recording.
import math

def pieces(path):
    subs, cur = [], []
    for c in path:
        if c[0] == 'M':
            if cur: subs.append(cur)
            cur = [(c[1], c[2])]
        elif c[0] == 'L': cur.append((c[1], c[2]))
        else: return None
    if cur: subs.append(cur)
    return subs

def dash_like(paths):
    return all(p and len(p) >= 6 and (s := pieces(p)) is not None and all(len(x) <= 3 for x in s) for p in paths)

def _dir(a, b):
    dx, dy = b[0] - a[0], b[1] - a[1]; l = math.hypot(dx, dy)
    return (dx / l, dy / l) if l > 1e-9 else None
def _intersect(p, d, q, e):
    den = d[0] * e[1] - d[1] * e[0]
    if abs(den) < 1e-9: return None
    t = ((q[0] - p[0]) * e[1] - (q[1] - p[1]) * e[0]) / den
    return (p[0] + d[0] * t, p[1] + d[1] * t)

def merge(iv):
    """Intervals merged where they touch or overlap (for an opaque line, overlapping dashes look
    the same as one), without slivers under 0.01."""
    out = []
    for a, b in sorted(iv):
        if out and a <= out[-1][1] + 0.01: out[-1] = (out[-1][0], max(out[-1][1], b))
        else: out.append((a, b))
    return [(a, b) for a, b in out if b - a > 0.01]

def in_order(subs):
    """The dashes in path order: Rive lists them from the dash offset on, wrapping to the start, so
    the list is rotated to begin after its one big jump."""
    if len(subs) < 3: return subs
    jumps = [math.dist(subs[k][-1], subs[k + 1][0]) for k in range(len(subs) - 1)]
    typical = sorted(jumps)[len(jumps) // 2]
    k = max(range(len(jumps)), key=lambda j: jumps[j])
    return subs[k + 1:] + subs[:k + 1] if jumps[k] > 3 * typical + 0.5 else subs

def rebuild(paths):
    """(polyline points, dash, gap, offsets per frame) or None."""
    frame0 = in_order(pieces(paths[0]))
    runs = []   # [point, direction]
    for sub in frame0:
        for a, b in zip(sub, sub[1:]):
            d = _dir(a, b)
            if d is None: continue
            if runs and abs(runs[-1][1][0] * d[1] - runs[-1][1][1] * d[0]) < 1e-3 and runs[-1][1][0] * d[0] + runs[-1][1][1] * d[1] > 0: continue
            runs.append([a, d])
    corners = []
    for (p, d), (q, e) in zip(runs, runs[1:]):
        c = _intersect(p, d, q, e)
        if c is None: return None
        corners.append(c)
    proj = lambda pt, p, d: (pt[0] - p[0]) * d[0] + (pt[1] - p[1]) * d[1]
    starts = [in_order(pieces(p))[0][0] for p in paths]; ends = [in_order(pieces(p))[-1][-1] for p in paths]
    p0, d0 = runs[0]; pn, dn = runs[-1]
    t0 = min(proj(s, p0, d0) for s in starts); tn = max(proj(e, pn, dn) for e in ends)
    poly = [(p0[0] + d0[0] * t0, p0[1] + d0[1] * t0)] + corners + [(pn[0] + dn[0] * tn, pn[1] + dn[1] * tn)]
    cum = [0.0]
    for a, b in zip(poly, poly[1:]): cum.append(cum[-1] + math.hypot(b[0] - a[0], b[1] - a[1]))
    L = cum[-1]
    def arc(pt):
        best = None
        for k, (a, b) in enumerate(zip(poly, poly[1:])):
            seg = cum[k + 1] - cum[k]
            if seg < 1e-9: continue
            d = ((b[0] - a[0]) / seg, (b[1] - a[1]) / seg)
            t = max(0, min(seg, (pt[0] - a[0]) * d[0] + (pt[1] - a[1]) * d[1]))
            dist = math.hypot(a[0] + d[0] * t - pt[0], a[1] + d[1] * t - pt[1])
            if best is None or dist < best[0]: best = (dist, cum[k] + t)
        return best[1]
    def point(s):
        for k in range(len(poly) - 1):
            if s <= cum[k + 1] or k == len(poly) - 2:
                seg = cum[k + 1] - cum[k]; t = (s - cum[k]) / seg if seg else 0
                a, b = poly[k], poly[k + 1]; return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
    # dash and pitch from frame 0's whole dashes (not touching the ends)
    iv = [(arc(sub[0]), arc(sub[-1])) for sub in frame0]
    inner = sorted((a, b) for a, b in iv if a > 0.01 and b < L - 0.01)
    if len(inner) < 3: return None
    dash = sorted(b - a for a, b in inner)[len(inner) // 2]
    pitch = sorted(inner[k + 1][0] - inner[k][0] for k in range(len(inner) - 1))[(len(inner) - 1) // 2]
    # the pattern Rive lays from the offset point: whole dash+gap pairs until the length is used up,
    # the last cut short, so it repeats exactly once per length
    n_full = int(L // pitch); rem = L - n_full * pitch
    pattern = [dash, pitch - dash] * n_full + ([rem, 0] if rem <= dash else [dash, rem - dash])
    # the offset point per frame: where the first listed dash starts
    offsets, prev = [], None
    for p in paths:
        first = pieces(p)[0]; a0 = arc(first[0]); a1 = arc(first[-1])
        o = a0 if (a1 > L - 0.02 or a1 - a0 >= dash - 0.02) else a0 - (dash - (a1 - a0))
        if prev is not None:
            while o - prev > L / 2: o -= L
            while o - prev < -L / 2: o += L
        offsets.append(o); prev = o
    # check: re-create each frame's dashes from the pattern
    for p, o in zip(paths, offsets):
        want = sorted((a, b) for a, b in ((arc(sub[0]), arc(sub[-1])) for sub in pieces(p)) if b - a > 0.01)
        got, pos = [], 0.0
        for k in range(0, len(pattern), 2):
            a, b = o + pos, o + pos + pattern[k]; pos += pattern[k] + pattern[k + 1]
            a, b = a % L, a % L + (b - a)
            if b - a < 1e-6: continue
            if b > L + 1e-6: got += [(a, L), (0.0, b - L)]
            else: got.append((a, min(b, L)))
        got = merge(got); want = merge(want)
        if len(got) != len(want) or any(abs(x - y) > 0.03 for g, w in zip(got, want) for x, y in zip(g, w)): return None
    return poly, pattern, [L - o for o in offsets], L
