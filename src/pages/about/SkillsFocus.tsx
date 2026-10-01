import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { DRAWING_BOX, drawings, type Drawing, type Stroke } from './skillDrawings';

// The skills board's hover: each cell is a plate in a draughtsman's portfolio.
//
// Hovering a cell draws its frame in by hand, and the pen is yours: two lines start where the
// cursor came in and run round the cell each way (in from the left: up and along the top, down
// and along the bottom), slowing into each corner and settling a crosshair there, to meet on the
// far side; ruler ticks follow the lines on the board's 11px construction grid; then the
// fine grid, the plate — pressed, and lit where the cursor is — and the dimension lines come in.
// Under the title the skill's own line drawing (skillDrawings.ts) is drawn stroke by stroke, one
// element of it kept moving very slowly once complete. Leaving un-draws it: the strokes retract
// in reverse, then the pen runs back to where it started, taking the ticks and crosshairs with
// it. (A cell left before its frame was even drawn just fades, so a fast pass over the board
// stays clean.)
//
// The board remembers: a cell once visited keeps its index in its corner, in light grey
// (remembered for the page, not stored).
//
// Desktop pointers only; about.css hides it where the board becomes a plain two-column list.
const CELL = { width: 190, height: 165, gap: 4, left: 40, top: 40, columns: 4 };
const OVER = 10; // how far the edges run past the corners
const TICK = 11;
const PERIMETER = 2 * (CELL.width + CELL.height);
// The pen's timing: the frame's line, then the drawing.
const LINE_MS = 520;
const STROKE_MS = 170;
const STROKE_GAP_MS = 50;
// Un-drawing is a little quicker than drawing.
const LINE_BACK_MS = 400;
const STROKE_BACK_MS = 120;
const STROKE_BACK_GAP_MS = 30;
const QUICK_OUT_MS = 160;
const PEN_EASE = 'cubic-bezier(0.45, 0, 0.3, 1)';

/** Where along the perimeter (0–1, clockwise from the top-left) each corner is. */
const CORNERS = [0, CELL.width / PERIMETER, (CELL.width + CELL.height) / PERIMETER, (2 * CELL.width + CELL.height) / PERIMETER];
/** The perimeter point nearest to (x, y) in the cell: where the pen starts. */
function entryAt(x: number, y: number) {
  const { width, height } = CELL;
  const edges = [[y, x / PERIMETER], [width - x, (width + y) / PERIMETER], [height - y, (2 * width + height - x) / PERIMETER], [x, (2 * width + 2 * height - y) / PERIMETER]];
  return edges.sort((a, b) => a[0] - b[0])[0][1] % 1;
}
const pointAt = (s: number) => {
  const { width, height } = CELL;
  const d = ((s % 1) + 1) % 1 * PERIMETER;
  if (d <= width) return [d, 0];
  if (d <= width + height) return [width, d - width];
  if (d <= 2 * width + height) return [2 * width + height - d, height];
  return [0, PERIMETER - d];
};
const relative = (at: number, start: number) => ((at - start) % 1 + 1) % 1;
/** One pen's half of the frame: from `start` clockwise (or the other way) to the far side. */
function halfPath(start: number, clockwise: boolean) {
  const corners = halfCorners(start, clockwise);
  const points = [pointAt(start), ...corners.map(([c]) => pointAt(c)), pointAt(start + 0.5)];
  return `M${points.map(([x, y]) => `${x} ${y}`).join('L')}`;
}
/** The corners on one pen's way, each with how far along that way (0–1) it is. */
function halfCorners(start: number, clockwise: boolean): [number, number][] {
  return CORNERS.map(c => [c, relative(c, start)] as [number, number])
    .filter(([, r]) => (clockwise ? r > 0.001 && r < 0.499 : r > 0.501 && r < 0.999))
    .map(([c, r]) => [c, clockwise ? r / 0.5 : (1 - r) / 0.5] as [number, number])
    .sort((a, b) => a[1] - b[1]);
}
/** A pen's keyframes along its way, each edge eased on its own (forward or back). */
function penKeyframes(start: number, clockwise: boolean, back: boolean) {
  const stops = [0, ...halfCorners(start, clockwise).map(([, along]) => along), 1];
  return stops.map(s => ({ offset: s, strokeDashoffset: `${back ? s : 1 - s}`, easing: PEN_EASE }));
}
/** When (0–1 of the pens' time) the pens reach the perimeter point `at`: the nearer pen's arrival. */
const reach = (at: number, start: number) => { const r = relative(at, start); return Math.min(r, 1 - r) * 2; };

const strokeDelay = (at: number) => LINE_MS + 120 + at * (STROKE_MS + STROKE_GAP_MS);
const backStart = (drawing?: Drawing) => (drawing ? drawing.strokes.length * (STROKE_BACK_MS + STROKE_BACK_GAP_MS) : 0) + 140;
/** How long the un-drawing takes, from the moment the pointer leaves. */
const leaveMs = (drawing?: Drawing) => backStart(drawing) + LINE_BACK_MS + 60;

function Frame({ index, count, start, leaving, drawing }: { index: number; count: number; start: number; leaving: 'draw' | 'quick' | null; drawing?: Drawing }) {
  const { width, height } = CELL;
  const pens = useRef<(SVGPathElement | null)[]>([]);
  const ticks = (length: number) => Array.from({ length: Math.floor(length / TICK) + 1 }, (_, at) => at * TICK);
  const drawingDone = drawing ? strokeDelay(drawing.strokes.length) : 0;

  // The pens: forward when the frame appears, back (after the drawing has retracted) on leaving.
  useEffect(() => {
    if (leaving === 'quick') return;
    const back = leaving === 'draw';
    const animations = pens.current.map((path, pen) => path?.animate(penKeyframes(start, pen === 0, back), { duration: back ? LINE_BACK_MS : LINE_MS, delay: back ? backStart(drawing) : 0, fill: 'both' }));
    return () => animations.forEach(animation => animation?.cancel());
  }, [start, leaving, drawing]);

  const at = (s: number) => ({ '--at': reach(s, start) } as CSSProperties);
  return (
    <div
      className="skills-card"
      style={{ '--line-ms': `${LINE_MS}ms`, '--done-ms': `${drawingDone}ms`, '--line-back-ms': `${LINE_BACK_MS}ms`, '--stroke-back-ms': `${STROKE_BACK_MS}ms`, '--back-start': `${backStart(drawing)}ms`, '--quick-ms': `${QUICK_OUT_MS}ms` } as CSSProperties}
    >
      <div className="skills-plate" aria-hidden="true">
        <span className="skills-plate__shade" />
        <span className="skills-plate__grid" />
        <svg className="skills-plate__lines" viewBox={`${-OVER} ${-OVER} ${width + 2 * OVER} ${height + 2 * OVER}`} width={width + 2 * OVER} height={height + 2 * OVER} fill="none">
          <path ref={path => { pens.current[0] = path; }} className="skills-plate__edge" pathLength={1} d={halfPath(start, true)} />
          <path ref={path => { pens.current[1] = path; }} className="skills-plate__edge" pathLength={1} d={halfPath(start, false)} />
          <g className="skills-plate__over">
            <path d={`M${-OVER} 0H0M0 ${-OVER}V0`} style={at(CORNERS[0])} />
            <path d={`M${width} 0H${width + OVER}M${width} ${-OVER}V0`} style={at(CORNERS[1])} />
            <path d={`M${width} ${height}V${height + OVER}M${width} ${height}H${width + OVER}`} style={at(CORNERS[2])} />
            <path d={`M0 ${height}V${height + OVER}M${-OVER} ${height}H0`} style={at(CORNERS[3])} />
          </g>
          <g className="skills-plate__marks">
            {[[0, 0], [width, 0], [width, height], [0, height]].map(([cx, cy], corner) => (
              <path key={corner} d={`M${cx - 4.5} ${cy}h9M${cx} ${cy - 4.5}v9`} style={at(CORNERS[corner])} />
            ))}
          </g>
          <g className="skills-plate__ticks">
            {ticks(width).map(t => <path key={`x${t}`} d={`M${t} 0v${t % (TICK * 5) ? 3 : 6}`} style={at(t / PERIMETER)} />)}
            {ticks(height).map(t => <path key={`y${t}`} d={`M0 ${t}h${t % (TICK * 5) ? 3 : 6}`} style={at((PERIMETER - t) / PERIMETER)} />)}
          </g>
          <g className="skills-plate__dims">
            <path pathLength={1} d={`M0 ${-OVER - 7}H${width}M0 ${-OVER - 10}v6M${width} ${-OVER - 10}v6`} />
            <path pathLength={1} d={`M${-OVER - 7} 0V${height}M${-OVER - 10} 0h6M${-OVER - 10} ${height}h6`} />
          </g>
        </svg>
        <span className="skills-plate__dim skills-plate__dim--width">{width}</span>
        <span className="skills-plate__dim skills-plate__dim--height">{height}</span>
        <span className="skills-plate__note">{String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span>
        {/* The skill's drawing, under the title, fitted to the space above the note. */}
        {drawing && (
          <svg className="skills-plate__drawing" viewBox={`0 0 ${DRAWING_BOX.width} ${DRAWING_BOX.height}`} width={DRAWING_BOX.width} height={96} preserveAspectRatio="xMinYMin meet" fill="none">
            {drawing.strokes.map((stroke: Stroke, n) => (
              <path
                key={n}
                className={`skills-stroke skills-stroke--${stroke.weight ?? 'line'}${stroke.dashed ? ' skills-stroke--dashed' : ''}`}
                pathLength={1}
                d={stroke.d}
                style={{ '--delay': `${strokeDelay(n)}ms`, '--back-delay': `${(drawing.strokes.length - 1 - n) * (STROKE_BACK_MS + STROKE_BACK_GAP_MS)}ms` } as CSSProperties}
              />
            ))}
            {drawing.live?.kind === 'cursor' && (
              <path className="skills-live" d="M0 0l0 11l3-2.6l2.2 4.6l1.9-.9l-2.2-4.5l3.8-.4Z" fill="#fff" stroke="#141414" strokeWidth="0.9" strokeLinejoin="round">
                <animateMotion dur="14s" repeatCount="indefinite" path={drawing.live.path} calcMode="spline" keyTimes="0;0.5;1" keySplines="0.45 0 0.55 1;0.45 0 0.55 1" />
              </path>
            )}
            {drawing.live?.kind === 'ball' && (
              <circle className="skills-live" r="2.6" fill="#141414">
                <animateMotion dur="9s" repeatCount="indefinite" path={drawing.live.path} calcMode="spline" keyTimes="0;0.5;1" keySplines="0.65 0 0.35 1;0.65 0 0.35 1" />
              </circle>
            )}
          </svg>
        )}
      </div>
    </div>
  );
}

type Leaving = { at: number; how: 'draw' | 'quick' };

export default function SkillsFocus({ titles }: { titles: readonly string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [start, setStart] = useState(0);
  // A cell just left, un-drawing: 'draw' runs the pen back, 'quick' (left before the frame was
  // drawn) just fades.
  const [leaving, setLeaving] = useState<Leaving | null>(null);
  const [visited, setVisited] = useState<Set<number>>(() => new Set());
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const layer = ref.current;
    const board = layer?.parentElement;
    const grid = board?.querySelector<HTMLElement>('.capabilities-grid');
    if (!layer || !board || !grid) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    const sync = () => setEnabled(fine.matches);
    sync();
    fine.addEventListener('change', sync);
    let raf = 0, x = 0, y = 0, current: HTMLElement | null = null;
    let at: number | null = null, entered = 0;
    let leaveTimer = 0;
    const light = () => { raf = 0; current?.style.setProperty('--light-x', `${x}px`); current?.style.setProperty('--light-y', `${y}px`); };
    const leaveCurrent = () => {
      if (at === null) return;
      const from = at;
      at = null;
      window.clearTimeout(leaveTimer);
      const how = performance.now() - entered < LINE_MS + 150 ? 'quick' : 'draw';
      setLeaving({ at: from, how });
      leaveTimer = window.setTimeout(() => setLeaving(was => (was?.at === from ? null : was)), how === 'quick' ? QUICK_OUT_MS : leaveMs(drawings[titles[from]]));
    };
    const move = (event: PointerEvent) => {
      if (!fine.matches || event.pointerType !== 'mouse') return;
      const cell = (event.target as Element).closest('li');
      const index = cell ? [...grid.children].indexOf(cell) : -1;
      if (index < 0) { leaveCurrent(); setActive(null); return; }
      const box = cell!.getBoundingClientRect();
      x = event.clientX - box.left;
      y = event.clientY - box.top;
      if (index !== at) {
        leaveCurrent();
        at = index;
        entered = performance.now();
        current = layer.children[index] as HTMLElement;
        window.clearTimeout(leaveTimer);
        setLeaving(was => (was?.at === index ? null : was));
        setStart(entryAt(x, y));
        setActive(index);
        setVisited(seen => (seen.has(index) ? seen : new Set(seen).add(index)));
      }
      if (!raf) raf = requestAnimationFrame(light);
    };
    const leave = () => { leaveCurrent(); setActive(null); };
    grid.addEventListener('pointermove', move, { passive: true });
    grid.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(leaveTimer);
      fine.removeEventListener('change', sync);
      grid.removeEventListener('pointermove', move);
      grid.removeEventListener('pointerleave', leave);
    };
  }, [titles]);

  const { width, height, gap, left, top, columns } = CELL;
  return (
    <div ref={ref} className="skills-focus" data-enabled={enabled || undefined} aria-hidden="true">
      {titles.map((title, index) => {
        const shown = active === index || leaving?.at === index;
        const how = active !== index && leaving?.at === index ? leaving.how : null;
        return (
          <div
            key={title}
            className="skills-cell"
            data-active={active === index || undefined}
            data-leaving={how ?? undefined}
            style={{ left: left + (index % columns) * (width + gap), top: top + Math.floor(index / columns) * (height + gap), width, height }}
          >
            {/* Mounted while active and while un-drawing, so each visit draws from the start. */}
            {shown && <Frame index={index} count={titles.length} start={start} leaving={how} drawing={drawings[title]} />}
            {!shown && visited.has(index) && <span className="skills-plate__trace">{String(index + 1).padStart(2, '0')}</span>}
          </div>
        );
      })}
    </div>
  );
}
