# python3 gen.py measured.json out/glyphs.ts "header comment" — traces a coded tile's text (measured
# live by measure.cjs) from the fonts it used, and writes its glyphs.ts (see
# src/components/outlined/Outlined.tsx). Needs fontTools and brotli (pip install fonttools brotli).
import json, sys, os
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

SITE = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..'))
data = json.load(open(sys.argv[1])); M = data['res']
# Live text left untraced is an error, unless ALLOW_LIVE=1 (text deliberately left as live text).
if data.get('liveText') and not os.environ.get('ALLOW_LIVE'): raise SystemExit(f'untraced text: {data["liveText"]}')
HERE = os.path.dirname(os.path.abspath(__file__))
# The fonts traced from are kept here (the site itself loads none of them).
TIKTOK = HERE + '/tiktok-sans-variable.woff2'
GEIST_MONO = HERE + '/geist-mono-latin-400.woff2'
fonts = {}

def font_for(v):
    # Cards load a font under a name of their own ('Career Agent Inter', 'Finova Inter' ...).
    for base in ('TikTok Sans', 'Geist Mono', 'Inter'):
        if v['family'] != base and v['family'].endswith(' ' + base): v = {**v, 'family': base}
    # An explicit optical size ("opsz" N) is the only variation setting handled.
    import re as _re
    fixed_opsz = None
    var = v.get('variation', 'normal')
    if var != 'normal':
        m = _re.fullmatch(r'"opsz" ([\d.]+)', var.strip())
        if not m: raise SystemExit(f'unexpected font settings {v}')
        fixed_opsz = float(m.group(1))
    if v.get('style', 'normal') != 'normal' or v.get('stretch', '100%') != '100%': raise SystemExit(f'unexpected font settings {v}')
    if v['family'] == 'TikTok Sans':
        axes = {a.axisTag: (a.minValue, a.maxValue) for a in TTFont(TIKTOK)['fvar'].axes}
        lo, hi = axes['opsz']
        if fixed_opsz is not None: opsz = round(max(lo, min(hi, fixed_opsz)), 4)
        elif v['optical'] != 'auto': raise SystemExit('expected font-optical-sizing auto')
        else: opsz = round(max(lo, min(hi, v['size'])), 4)
        key = f'tiktok-{v["weight"]}-{opsz:g}'
        if key not in fonts: fonts[key] = instantiateVariableFont(TTFont(TIKTOK), {'wght': int(v['weight']), 'opsz': opsz, 'wdth': 100, 'slnt': 0})
    elif v['family'] == 'Inter':
        INTER = HERE + '/inter-variable.woff2'
        iaxes = {a.axisTag: (a.minValue, a.defaultValue, a.maxValue) for a in TTFont(INTER)['fvar'].axes}
        lo, default, hi = iaxes['opsz']
        # auto: the optical size follows the font size; none: the axis default (the text cut).
        opsz = round(max(lo, min(hi, fixed_opsz)), 4) if fixed_opsz is not None else round(max(lo, min(hi, v['size'])), 4) if v['optical'] == 'auto' else default
        key = f'inter-{v["weight"]}-{opsz:g}'
        if key not in fonts: fonts[key] = instantiateVariableFont(TTFont(INTER), {'wght': int(v['weight']), 'opsz': opsz})
    elif v['family'] == 'Geist Mono':
        # One static 400 file (the lab's face spans 400–600, so its 500 and 600 text draw it too, unsynthesised).
        if v['weight'] not in ('400', '500', '600'): raise SystemExit('Geist Mono is traced at 400 only')
        key = 'geist-mono-400'
        if key not in fonts: fonts[key] = TTFont(GEIST_MONO)
    elif v['family'] == 'Geist':
        # The site's one static 400 file (its 500 text draws it too, unsynthesised).
        if v['weight'] not in ('400', '500'): raise SystemExit('Geist is traced at 400 only')
        key = 'geist-400'
        if key not in fonts: fonts[key] = TTFont(SITE + '/src/assets/fonts/geist-regular.woff2')
    else: raise SystemExit(f'unexpected font {v["family"]}')
    return key

def num(v):
    s = f'{v:.4f}'.rstrip('0').rstrip('.')
    return '0' if s in ('-0', '') else s

def tnum_map(f):
    gsub = f['GSUB'].table if 'GSUB' in f else None
    out = {}
    if not gsub: return out
    for rec in gsub.FeatureList.FeatureRecord:
        if rec.FeatureTag != 'tnum': continue
        for li in rec.Feature.LookupListIndex:
            for sub in gsub.LookupList.Lookup[li].SubTable:
                sub = getattr(sub, 'ExtSubTable', sub)
                if hasattr(sub, 'mapping'): out.update(sub.mapping)
    return out

texts = {}; used = {}; tabular = set()
for key, v in M.items():
    if v.get('conflict'): raise SystemExit(f'{key}: pieces sharing a key differ')
    fk = font_for(v)
    if 'tabular-nums' in v.get('numeric', ''):
        base = fk; fk = fk + '-tnum'; tabular.add(fk); fonts[fk] = fonts[base]
    chars = []
    for c, x, y, s, *own in v['chars']:
        # A character in a font of its own (a span in another family or weight): its font key last.
        ck = font_for({**v, **own[0], 'size': s}) if own else fk
        used.setdefault(ck, set()).add(c)
        entry = [c, x, y] if abs(s - v['size']) < 1e-3 and not own else [c, x, y, s]
        if own: entry.append(ck)
        chars.append(entry)
    texts[key] = {'width': v['width'], 'height': v['height'], 'size': v['size'], 'weight': fk, 'chars': chars}
glyphs = {}
for fk, chars in used.items():
    f = fonts[fk]; upm = f['head'].unitsPerEm; cmap = f.getBestCmap(); gs = f.getGlyphSet(); glyphs[fk] = {}
    swap = tnum_map(f) if fk in tabular else {}
    for c in sorted(chars):
        if ord(c) not in cmap: raise SystemExit(f'{fk}: no glyph for {c!r}')
        name = swap.get(cmap[ord(c)], cmap[ord(c)])
        pen = SVGPathPen(gs, ntos=num); gs[name].draw(TransformPen(pen, (1 / upm, 0, 0, -1 / upm, 0, 0))); glyphs[fk][c] = pen.getCommands()
header = ''.join(f'// {line}\n' for line in sys.argv[3].split('\n'))
rel = os.path.relpath(SITE + '/src/components/outlined/Outlined', os.path.dirname(os.path.abspath(sys.argv[2])))
src = (header + f"import type {{ Glyphs, OutlinedText }} from '{rel if rel.startswith('.') else './' + rel}';\n\n"
       f"export const GLYPHS: Glyphs = {json.dumps(glyphs, ensure_ascii=False, separators=(',', ':'))};\n"
       f"export const TEXT: Record<string, OutlinedText> = {json.dumps(texts, ensure_ascii=False, separators=(',', ':'))};\n")
open(sys.argv[2], 'w').write(src)
print(len(texts), 'pieces;', {k: len(v) for k, v in glyphs.items()}, len(src.encode()) // 1024, 'KB')
