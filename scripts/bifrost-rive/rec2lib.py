import json
def load(name):
    """Frames rebuilt from a rec2 recording (unchanged ops shared between frames)."""
    d = json.load(open(f'rec2-{name}.json'))
    frames, prev = [], None
    for f in d['frames']:
        if 'full' in f: cur = f['full']
        elif 'same' in f or 'empty' in f: cur = prev
        else:
            cur = list(prev)
            for entry in f['diff']:
                k, o = entry[0], entry[1]
                cur[k] = {**cur[k], **o} if len(entry) > 2 else o
        frames.append(cur); prev = cur
    return d['info'], frames, d.get('images', []), [('empty' in f) for f in d['frames']]
def md(a, b):
    if isinstance(a, (int, float)) and isinstance(b, (int, float)): return abs(a - b)
    if isinstance(a, list) and isinstance(b, list): return 999 if len(a) != len(b) else max([md(x, y) for x, y in zip(a, b)] or [0])
    if isinstance(a, dict) and isinstance(b, dict): return 999 if a.keys() != b.keys() else max([md(a[k], b[k]) for k in a] or [0])
    return 0 if a == b else 999
def period(seq, cands, start=0, tol=0.05):
    for p in cands:
        if p < len(seq) - start:
            bad = 0; limit = 3 + (len(seq) - p - start) // 200
            for k in range(start, len(seq) - p):
                if md(seq[k], seq[k + p]) > tol:
                    bad += 1
                    if bad > limit: break
            if bad <= limit: return p
    return None
