import { useLayoutEffect, useRef, useState } from 'react';
import vertical from './assets/guide-vertical.svg';
import fadeLeft from './assets/fade-left.png';
import fadeRight from './assets/fade-right.png';
import fadeTop from './assets/fade-top.png';
import fadeBottom from './assets/fade-bottom.png';

// Figma 275:966: construction grid remains decorative; skill labels stay live text.
const fineLines = [
  ...Array.from({ length: 22 }, (_, i) => -37 + i * 11),
  ...Array.from({ length: 14 }, (_, i) => 220 + i * 11),
  ...Array.from({ length: 14 }, (_, i) => 389 + i * 11),
  ...Array.from({ length: 14 }, (_, i) => 558 + i * 11),
];

const majorLines = [40, 205, 209, 374, 378, 543];
const highlightLines = [39.5, 205.5, 208.5, 374.5, 377.5, 543.5];
const verticalLines = [40, 230, 234, 424, 428, 618, 622, 812];
const verticalHighlights = [39.5, 230.5, 233.5, 424.5, 427.5, 618.5, 621.5, 812.5];
const dotColumns = [39, 229, 233, 423, 427, 617, 621, 811];
const dotRows = [39, 204, 208, 373, 377, 542];

// Measure layout coordinates, not transformed screen coordinates, so guides stay
// attached to the cards during the page's zoom transition and on rotation.
function MobileCapabilityGuides() {
  const anchor = useRef<HTMLSpanElement>(null);
  const [layout, setLayout] = useState<{ width: number; height: number; xs: number[]; ys: number[] }>();

  useLayoutEffect(() => {
    const grid = anchor.current?.parentElement?.querySelector<HTMLElement>('.capabilities-grid');
    if (!grid) return;
    const media = window.matchMedia('(max-width: 900px)');
    const measure = () => {
      if (!media.matches) return;
      const cells = Array.from(grid.children) as HTMLElement[];
      const edges = (axis: 'x' | 'y') => Array.from(new Set(cells.flatMap(cell => {
        const style = getComputedStyle(cell);
        const start = axis === 'x' ? cell.offsetLeft : cell.offsetTop;
        const size = parseFloat(axis === 'x' ? style.width : style.height);
        return [start + 24, start + size + 24];
      }))).sort((a, b) => a - b);
      setLayout({ width: grid.clientWidth + 48, height: grid.clientHeight + 48, xs: edges('x'), ys: edges('y') });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    media.addEventListener('change', measure);
    measure();
    return () => {
      observer.disconnect();
      media.removeEventListener('change', measure);
    };
  }, []);

  return <>
    <span ref={anchor} hidden />
    {layout && <>
      <svg className="capability-mobile-guides capability-mobile-grid" aria-hidden="true"
        width={layout.width} height={layout.height}>
        <g stroke="#ccc" strokeOpacity="0.3" strokeWidth="0.5">
          {Array.from({ length: Math.ceil(layout.width / 11) }, (_, i) =>
            <path key={`x${i}`} d={`M${i * 11 + 2} 0V${layout.height}`} />)}
          {Array.from({ length: Math.ceil(layout.height / 11) }, (_, i) =>
            <path key={`y${i}`} d={`M0 ${i * 11 + 2}H${layout.width}`} />)}
        </g>
      </svg>
      <svg className="capability-mobile-guides capability-mobile-outlines" aria-hidden="true"
        width={layout.width} height={layout.height}>
        <g stroke="#fff" strokeWidth="0.5">
          {layout.xs.map((x, i) => <path key={x} d={`M${x + (i % 2 ? 0.5 : -0.5)} 0V${layout.height}`} />)}
          {layout.ys.map((y, i) => <path key={y} d={`M0 ${y + (i % 2 ? 0.5 : -0.5)}H${layout.width}`} />)}
        </g>
        <g stroke="#ccc" strokeWidth="0.5">
          {layout.xs.map(x => <path key={x} d={`M${x} 0V${layout.height}`} />)}
          {layout.ys.map(y => <path key={y} d={`M0 ${y}H${layout.width}`} />)}
        </g>
        <g fill="#ccc">
          {layout.xs.flatMap(x => layout.ys.map(y =>
            <rect key={`${x}-${y}`} x={x - 1} y={y - 1} width="2" height="2" />))}
        </g>
      </svg>
    </>}
  </>;
}

export default function CapabilityGuides() {
  return (
    <>
      <MobileCapabilityGuides />
      <div className="capability-guides capability-guide-lines" aria-hidden="true">
        <img className="capability-guide-vertical" src={vertical} alt="" />
        <svg className="capability-guide-horizontal-pattern" viewBox="0 0 894 583" preserveAspectRatio="none">
          {fineLines.map((y) => (
            <line key={`fine-${y}`} x1="0" x2="894" y1={y} y2={y} stroke="#ccc" strokeOpacity="0.3" strokeWidth="0.5" />
          ))}
        </svg>
      </div>
      <div className="capability-guides capability-guide-overlay" aria-hidden="true">
        {/* One centered stroke per edge, above card fills and below corner dots. */}
        <svg className="capability-guide-outlines" viewBox="0 0 852 583" fill="none">
          <g stroke="#fff" strokeWidth="0.5">
            {verticalHighlights.map((x) => <path key={`v-${x}`} d={`M${x} 0V583`} />)}
            {highlightLines.map((y) => <path key={`h-${y}`} d={`M0 ${y}H852`} />)}
          </g>
          <g stroke="#ccc" strokeWidth="0.5">
            {verticalLines.map((x) => <path key={`v-${x}`} d={`M${x} 0V583`} />)}
            {majorLines.map((y) => <path key={`h-${y}`} d={`M0 ${y}H852`} />)}
          </g>
        </svg>
        {dotColumns.flatMap((left) => dotRows.map((top) => (
          <span className="capability-guide-dot" key={`${left}-${top}`} style={{ left, top }} />
        )))}
        <img className="capability-fade capability-fade-left" src={fadeLeft} alt="" />
        <img className="capability-fade capability-fade-right" src={fadeRight} alt="" />
        <img className="capability-fade capability-fade-bottom" src={fadeBottom} alt="" />
        <img className="capability-fade capability-fade-top" src={fadeTop} alt="" />
      </div>
    </>
  );
}
