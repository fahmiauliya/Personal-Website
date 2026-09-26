import vertical from '../../assets/about/guide-vertical.svg';
import fadeLeft from '../../assets/about/fade-left.png';
import fadeRight from '../../assets/about/fade-right.png';
import fadeTop from '../../assets/about/fade-top.png';
import fadeBottom from '../../assets/about/fade-bottom.png';

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

export default function CapabilityGuides() {
  return (
    <>
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
