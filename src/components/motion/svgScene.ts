// Draws one of the site's animated SVGs (the Rive recordings: scripts/bifrost-rive, bifrost-hero)
// on a canvas, at any time in its timeline. The SVG is never put in the page: it is parsed once,
// off the document, into the scene below. An inline SVG that animates makes the browser run a
// rendering pass over the whole page for every frame (and that pass grows with everything on the
// page); a canvas is one flat surface, so a frame costs only its own drawing — as it did when
// these were Rive canvases.
//
// It covers what those files use, not SVG at large: g, path, use (of a path or a group), image,
// clipPath (one path), linearGradient (userSpaceOnUse); fill, stroke and its width, join, cap and
// dashes, fill-rule, visibility, opacity (as each shape's own); and SMIL animate (d, fill, stroke,
// visibility, stroke-width, stroke-dashoffset, opacity) and animateTransform (translate, scale, rotate; replacing or additive="sum"),
// discrete or linear, looping or frozen at their end, all beginning at 0.

type Matrix = [number, number, number, number, number, number];
const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];
const multiply = (m: Matrix, n: Matrix): Matrix => [
  m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5],
];
const numbers = (text: string) => (text.match(/-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi) ?? []).map(Number);
function transformOf(kind: string, v: number[]): Matrix {
  if (kind === 'matrix') return [v[0], v[1], v[2], v[3], v[4], v[5]];
  if (kind === 'translate') return [1, 0, 0, 1, v[0] ?? 0, v[1] ?? 0];
  if (kind === 'scale') return [v[0] ?? 1, 0, 0, v[1] ?? v[0] ?? 1, 0, 0];
  if (kind === 'rotate') {
    const angle = (v[0] ?? 0) * Math.PI / 180, cos = Math.cos(angle), sin = Math.sin(angle), cx = v[1] ?? 0, cy = v[2] ?? 0;
    return [cos, sin, -sin, cos, cx - cos * cx + sin * cy, cy - sin * cx - cos * cy];
  }
  return IDENTITY;
}
function parseTransform(text: string | null): Matrix | null {
  if (!text) return null;
  let matrix = IDENTITY;
  for (const [, kind, args] of text.matchAll(/(\w+)\s*\(([^)]*)\)/g)) matrix = multiply(matrix, transformOf(kind, numbers(args)));
  return matrix;
}
const seconds = (value: string | null) => {
  const match = value?.trim().match(/^([\d.]+)(ms|s)?$/);
  return match ? Number(match[1]) / (match[2] === 'ms' ? 1000 : 1) : 0;
};

/** One SMIL animation: values at key times over a duration. */
type Track = {
  duration: number;
  loop: boolean;
  discrete: boolean;
  times: number[];
  values: string[];
  /** Each value's numbers, when they're interpolated (every value then has as many). */
  vectors: number[][] | null;
  /** For an interpolated path: the text between its numbers. */
  between: string[] | null;
};
function parseTrack(element: Element, interpolate: 'numbers' | 'path' | 'none'): Track {
  const values = (element.getAttribute('values') ?? '').split(';');
  const keyTimes = element.getAttribute('keyTimes');
  const times = keyTimes ? keyTimes.split(';').map(Number) : values.map((_, index) => index / Math.max(1, values.length - 1));
  let discrete = element.getAttribute('calcMode') === 'discrete' || interpolate === 'none';
  let vectors: number[][] | null = null;
  let between: string[] | null = null;
  if (!discrete || interpolate === 'numbers') {
    vectors = values.map(numbers);
    if (interpolate === 'path') {
      between = values[0].split(/-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/i);
      // Paths can only be blended number by number when they share one structure.
      const shape = between.join('#');
      if (values.some(value => value.split(/-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/i).join('#') !== shape)) { discrete = true; vectors = between = null; }
    }
  }
  return { duration: seconds(element.getAttribute('dur')), loop: element.getAttribute('repeatCount') === 'indefinite', discrete, times, values, vectors, between };
}
/** Where `time` falls in a track: the key at or before it, and how far on to the next (0–1). */
function locate(track: Track, time: number): [number, number] {
  const { duration, times } = track;
  const progress = duration > 0 ? (track.loop ? (time % duration) / duration : Math.min(1, time / duration)) : 1;
  let low = 0, high = times.length - 1;
  while (low < high) { const middle = (low + high + 1) >> 1; if (times[middle] <= progress) low = middle; else high = middle - 1; }
  if (track.discrete || low === times.length - 1) return [low, 0];
  const span = times[low + 1] - times[low];
  return [low, span > 0 ? (progress - times[low]) / span : 0];
}
const textAt = (track: Track, time: number) => track.values[locate(track, time)[0]];
function vectorAt(track: Track, time: number): number[] {
  const [index, part] = locate(track, time);
  const from = track.vectors![index];
  if (!part) return from;
  const to = track.vectors![index + 1];
  return from.map((value, at) => value + (to[at] - value) * part);
}

type Paint = string | { gradient: string } | null;
type Style = { fill: Paint; stroke: Paint; strokeWidth: number; join: CanvasLineJoin; cap: CanvasLineCap; dash: number[]; dashOffset: number };
// SVG's initial values.
const INITIAL: Style = { fill: '#000', stroke: null, strokeWidth: 1, join: 'miter', cap: 'butt', dash: [], dashOffset: 0 };
type Clip = { node: Node };
type Node = {
  kind: 'group' | 'path' | 'use' | 'image';
  base: Matrix | null;
  transforms: { kind: string; additive: boolean; track: Track }[];
  x: number;
  y: number;
  clip: Clip | null;
  /** What this element sets itself; the rest it inherits (from its parent, or the `use` drawing it). */
  style: Partial<Style>;
  evenOdd: boolean;
  /** Whether `style` holds anything. */
  styled: boolean;
  hidden: boolean;
  d: string;
  opacity: number;
  tracks: { d?: Track; fill?: Track; stroke?: Track; visibility?: Track; dashOffset?: Track; strokeWidth?: Track; opacity?: Track };
  children: Node[];
  /** A `use`'s target, resolved after parsing. */
  href: string;
  target: Node | null;
  image: HTMLImageElement | null;
  width: number;
  height: number;
};
type Gradient = { x1: number; y1: number; x2: number; y2: number; stops: [number, string][] };
export type SvgScene = {
  viewBox: [number, number, number, number];
  root: Node;
  gradients: Map<string, Gradient>;
  tracks: Track[];
  images: HTMLImageElement[];
  paths: Map<string, Path2D>;
};

const paintOf = (value: string | null): Paint => {
  if (value === null || value === 'none') return null;
  const reference = value.match(/^url\(#(.+)\)$/);
  return reference ? { gradient: reference[1] } : value;
};
const idOf = (value: string | null) => value?.match(/^url\(#(.+)\)$/)?.[1] ?? value?.replace(/^#/, '') ?? '';

/** Parses an SVG's markup into a scene. Costly for the large files, so done once per source. */
const scenes = new Map<string, SvgScene>();
export function parseSvg(source: string): SvgScene {
  const known = scenes.get(source);
  if (known) return known;
  const svg = new DOMParser().parseFromString(source, 'image/svg+xml').documentElement;
  const byId = new Map<string, Node>();
  const tracks: Track[] = [];
  const images: HTMLImageElement[] = [];
  const gradients = new Map<string, Gradient>();
  const clips = new Map<string, Clip>();
  const pendingClips: [Node, string][] = [];
  const uses: Node[] = [];
  const track = (element: Element, interpolate: 'numbers' | 'path' | 'none') => { const parsed = parseTrack(element, interpolate); tracks.push(parsed); return parsed; };

  const build = (element: Element): Node | null => {
    const tag = element.localName;
    if (tag !== 'g' && tag !== 'path' && tag !== 'use' && tag !== 'image' && tag !== 'svg') return null;
    const style: Partial<Style> = {};
    const attribute = (name: string) => element.getAttribute(name);
    if (attribute('fill') !== null) style.fill = paintOf(attribute('fill'));
    if (attribute('stroke') !== null) style.stroke = paintOf(attribute('stroke'));
    if (attribute('stroke-width') !== null) style.strokeWidth = Number(attribute('stroke-width'));
    if (attribute('stroke-linejoin') !== null) style.join = attribute('stroke-linejoin') as CanvasLineJoin;
    if (attribute('stroke-linecap') !== null) style.cap = attribute('stroke-linecap') as CanvasLineCap;
    if (attribute('stroke-dasharray') !== null) style.dash = attribute('stroke-dasharray') === 'none' ? [] : numbers(attribute('stroke-dasharray')!);
    if (attribute('stroke-dashoffset') !== null) style.dashOffset = Number(attribute('stroke-dashoffset'));
    const node: Node = {
      kind: tag === 'path' ? 'path' : tag === 'use' ? 'use' : tag === 'image' ? 'image' : 'group',
      base: tag === 'svg' ? null : parseTransform(element.getAttribute('transform')),
      transforms: [],
      x: Number(element.getAttribute('x') ?? 0),
      y: Number(element.getAttribute('y') ?? 0),
      clip: null,
      style,
      styled: Object.keys(style).length > 0,
      evenOdd: element.getAttribute('fill-rule') === 'evenodd',
      hidden: element.getAttribute('visibility') === 'hidden',
      opacity: Number(element.getAttribute('opacity') ?? 1),
      d: element.getAttribute('d') ?? '',
      tracks: {},
      children: [],
      href: tag === 'use' ? idOf(element.getAttribute('href')) : '',
      target: null,
      image: null,
      width: Number(element.getAttribute('width') ?? 0),
      height: Number(element.getAttribute('height') ?? 0),
    };
    const clip = element.getAttribute('clip-path');
    if (clip && tag !== 'svg') pendingClips.push([node, idOf(clip)]);
    if (tag === 'use') uses.push(node);
    if (tag === 'image') {
      const image = new Image();
      image.decoding = 'async';
      image.src = element.getAttribute('href') ?? '';
      node.image = image;
      images.push(image);
    }
    for (const child of element.children) {
      const name = child.localName;
      if (name === 'animateTransform') {
        node.transforms.push({ kind: child.getAttribute('type') ?? 'translate', additive: child.getAttribute('additive') === 'sum', track: track(child, 'numbers') });
      } else if (name === 'animate') {
        const animated = child.getAttribute('attributeName');
        if (animated === 'd') node.tracks.d = track(child, 'path');
        else if (animated === 'fill') node.tracks.fill = track(child, 'none');
        else if (animated === 'stroke') node.tracks.stroke = track(child, 'none');
        else if (animated === 'visibility') node.tracks.visibility = track(child, 'none');
        else if (animated === 'stroke-dashoffset') node.tracks.dashOffset = track(child, 'numbers');
        else if (animated === 'stroke-width') node.tracks.strokeWidth = track(child, 'numbers');
        else if (animated === 'opacity') node.tracks.opacity = track(child, 'numbers');
      } else if (name === 'defs') {
        for (const defined of child.children) define(defined);
      } else {
        const built = build(child);
        if (built) node.children.push(built);
      }
    }
    const id = element.getAttribute('id');
    if (id) byId.set(id, node);
    return node;
  };
  // What <defs> holds: clip paths and gradients, and the shapes and groups that `use` draws.
  const define = (element: Element) => {
    const id = element.getAttribute('id') ?? '';
    if (element.localName === 'clipPath') {
      const shape = element.firstElementChild && build(element.firstElementChild);
      if (shape) clips.set(id, { node: shape });
    } else if (element.localName === 'linearGradient') {
      const value = (name: string) => Number(element.getAttribute(name) ?? 0);
      gradients.set(id, {
        x1: value('x1'), y1: value('y1'), x2: value('x2'), y2: value('y2'),
        stops: [...element.children].map(stop => {
          const [red, green, blue] = numbers(stop.getAttribute('stop-color') ?? '');
          return [Number(stop.getAttribute('offset') ?? 0), `rgba(${red ?? 0}, ${green ?? 0}, ${blue ?? 0}, ${stop.getAttribute('stop-opacity') ?? 1})`] as [number, string];
        }),
      });
    } else build(element);
  };

  const root = build(svg)!;
  for (const [node, id] of pendingClips) node.clip = clips.get(id) ?? null;
  for (const node of uses) node.target = byId.get(node.href) ?? null;
  const box = numbers(svg.getAttribute('viewBox') ?? '');
  const scene: SvgScene = { viewBox: [box[0] ?? 0, box[1] ?? 0, box[2] ?? 1, box[3] ?? 1], root, gradients, tracks, images, paths: new Map() };
  scenes.set(source, scene);
  return scene;
}

/**
 * Seconds from `time` until the picture next changes: 0 when anything in the scene moves
 * continuously (it changes every frame), Infinity when nothing will change again. A scene whose
 * animations all step (the gauges) only needs drawing at their key times.
 */
export function untilNextChange(scene: SvgScene, time: number) {
  let wait = Infinity;
  for (const track of scene.tracks) {
    if (!track.discrete) return 0;
    const { duration, times } = track;
    if (!(duration > 0) || (!track.loop && time >= duration)) continue;
    const at = track.loop ? time % duration : time;
    const next = times.find(key => key * duration > at + 1e-4);
    wait = Math.min(wait, (next === undefined ? duration : next * duration) - at);
  }
  return wait;
}

function pathOf(scene: SvgScene, d: string) {
  let path = scene.paths.get(d);
  if (!path) { path = new Path2D(d); scene.paths.set(d, path); }
  return path;
}
function shapeAt(scene: SvgScene, node: Node, time: number) {
  const track = node.tracks.d;
  if (!track) return pathOf(scene, node.d);
  if (track.discrete) return pathOf(scene, textAt(track, time));
  // A blended path is new every frame: built, not kept.
  const vector = vectorAt(track, time);
  const between = track.between!;
  let d = between[0];
  for (let index = 0; index < vector.length; index += 1) d += vector[index].toFixed(3) + between[index + 1];
  return new Path2D(d);
}
function matrixAt(node: Node, parent: Matrix, time: number) {
  let local = node.base;
  for (const { kind, additive, track } of node.transforms) {
    const animated = transformOf(kind, vectorAt(track, time));
    local = additive && local ? multiply(local, animated) : animated;
  }
  let matrix = local ? multiply(parent, local) : parent;
  if (node.kind === 'use' && (node.x || node.y)) matrix = multiply(matrix, [1, 0, 0, 1, node.x, node.y]);
  return matrix;
}

/**
 * Draws the scene at `time` (seconds) into a canvas `width` × `height` px, its view box fitted
 * whole and centred (`cover`: filling the canvas, the overflow cropped), as the inline SVG was.
 */
export function drawSvg(context: CanvasRenderingContext2D, scene: SvgScene, time: number, width: number, height: number, cover = false) {
  const [left, top, boxWidth, boxHeight] = scene.viewBox;
  const scale = cover ? Math.max(width / boxWidth, height / boxHeight) : Math.min(width / boxWidth, height / boxHeight);
  const view: Matrix = [scale, 0, 0, scale, (width - boxWidth * scale) / 2 - left * scale, (height - boxHeight * scale) / 2 - top * scale];
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, width, height);
  context.miterLimit = 4; // SVG's default; a canvas starts at 10
  const gradientPaints = new Map<string, CanvasGradient>();
  const paintStyle = (paint: Paint): string | CanvasGradient => {
    if (typeof paint === 'string') return paint;
    const id = paint!.gradient;
    let made = gradientPaints.get(id);
    const gradient = scene.gradients.get(id);
    if (!made && gradient) {
      made = context.createLinearGradient(gradient.x1, gradient.y1, gradient.x2, gradient.y2);
      for (const [offset, color] of gradient.stops) made.addColorStop(Math.min(1, Math.max(0, offset)), color);
      gradientPaints.set(id, made);
    }
    return made ?? 'transparent';
  };

  const draw = (node: Node, parent: Matrix, inherited: Style, alpha: number) => {
    const { tracks } = node;
    if (tracks.visibility ? textAt(tracks.visibility, time) === 'hidden' : node.hidden) return;
    const matrix = matrixAt(node, parent, time);
    let style = inherited;
    // Opacity multiplies down to each shape: right for a shape or image, and for a group whose
    // shapes don't overlap (a true group opacity would need a layer of its own).
    alpha *= tracks.opacity ? vectorAt(tracks.opacity, time)[0] : node.opacity;
    if (alpha <= 0) return;
    if (node.styled || tracks.fill || tracks.stroke || tracks.dashOffset || tracks.strokeWidth) {
      style = { ...inherited, ...node.style };
      if (tracks.fill) style.fill = paintOf(textAt(tracks.fill, time));
      if (tracks.stroke) style.stroke = paintOf(textAt(tracks.stroke, time));
      if (tracks.dashOffset) style.dashOffset = vectorAt(tracks.dashOffset, time)[0];
      if (tracks.strokeWidth) style.strokeWidth = vectorAt(tracks.strokeWidth, time)[0];
    }
    const clip = node.clip;
    if (clip) {
      // The clip's shape is in the user space of the element it clips.
      context.save();
      const shape = matrixAt(clip.node, matrix, time);
      context.setTransform(shape[0], shape[1], shape[2], shape[3], shape[4], shape[5]);
      context.clip(shapeAt(scene, clip.node, time), clip.node.evenOdd ? 'evenodd' : 'nonzero');
    }
    if (node.kind === 'path') {
      const path = shapeAt(scene, node, time);
      context.setTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
      context.globalAlpha = alpha;
      if (style.fill) { context.fillStyle = paintStyle(style.fill); context.fill(path, node.evenOdd ? 'evenodd' : 'nonzero'); }
      if (style.stroke && style.strokeWidth > 0) {
        context.strokeStyle = paintStyle(style.stroke);
        context.lineWidth = style.strokeWidth;
        context.lineJoin = style.join;
        context.lineCap = style.cap;
        context.setLineDash(style.dash);
        context.lineDashOffset = style.dashOffset;
        context.stroke(path);
      }
    } else if (node.kind === 'image') {
      const image = node.image!;
      if (image.complete && image.naturalWidth) {
        context.setTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
        context.globalAlpha = alpha;
        context.drawImage(image, node.x, node.y, node.width || image.naturalWidth, node.height || image.naturalHeight);
      }
    } else if (node.kind === 'use') {
      if (node.target) draw(node.target, matrix, style, alpha);
    } else {
      for (const child of node.children) draw(child, matrix, style, alpha);
    }
    if (clip) context.restore();
  };
  draw(scene.root, view, INITIAL, 1);
  context.globalAlpha = 1;
}
