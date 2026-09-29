import { GLYPHS, TEXT, type OutlinedText } from './glyphs';
import './DeleteDialog.css';

// Content 07 (Figma Portfolio-2026, node 141:7067): Beam's "Delete file" confirmation dialog
// over a dimmed workspace, built in code at the frame's design size (593 × 473).
// BeamGallery scales it to the tile with SceneFit; the tile's guides are drawn above it.

// The dialog's text is drawn as outlines (glyphs.ts, traced from TikTok Sans at the positions
// the browser set it), so it loads no font. Each text box keeps its measured size.
const LINE = 15.854;
function Outlined({ text, lines = 1, className }: { text: OutlinedText; lines?: number; className?: string }) {
  return (
    <span className={`beam-delete__text${className ? ` ${className}` : ''}`} style={{ width: text.width, height: LINE * lines }}>
      <svg aria-hidden="true">
        <g fill="currentColor">
          {text.chars.map(([char, x, y], index) => <path key={index} d={GLYPHS[char]} transform={`translate(${x} ${y})`} />)}
        </g>
      </svg>
    </span>
  );
}

// The dialog's icons, as Figma exported them, drawn in the current text colour.
const STROKE = { stroke: 'currentColor', strokeWidth: 0.880761, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

function TrashIcon({ className }: { className: string }) {
  return (
    <svg className={className} width="9.68837" height="10.1288" viewBox="0 0 9.68837 10.1288" fill="none" aria-hidden="true">
      <path d="M0.44038 1.7615H9.24799" {...STROKE} />
      <path d="M3.74523 1.76152V0.880761C3.74523 0.637671 3.94252 0.44038 4.18561 0.44038H5.50675C5.74984 0.44038 5.94713 0.637671 5.94713 0.880761V1.76152" fill="currentColor" />
      <path d="M3.74523 1.76152V0.880761C3.74523 0.637671 3.94252 0.44038 4.18561 0.44038H5.50675C5.74984 0.44038 5.94713 0.637671 5.94713 0.880761V1.76152" {...STROKE} />
      <path d="M7.927 3.96345L7.75525 8.41834C7.72795 9.12735 7.14488 9.6884 6.43499 9.6884H3.2528C2.54291 9.6884 1.95984 9.12735 1.93254 8.41834L1.76079 3.96345" {...STROKE} />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="beam-delete__close-icon" width="7.48647" height="7.48647" viewBox="0 0 7.48647 7.48647" fill="none" aria-hidden="true">
      <path d="M0.44038 7.04609L7.04609 0.44038" {...STROKE} />
      <path d="M7.04609 7.04609L0.44038 0.44038" {...STROKE} />
    </svg>
  );
}

export default function DeleteDialog() {
  return (
    <div className="beam-delete" aria-hidden="true">
      <div className="beam-delete__overlay">
        <div className="beam-delete__dialog">
          <div className="beam-delete__header">
            <span className="beam-delete__title">
              <span className="beam-delete__icon"><TrashIcon className="beam-delete__trash" /></span>
              <Outlined text={TEXT.title} />
            </span>
            <span className="beam-delete__close"><span className="beam-delete__icon"><CloseIcon /></span></span>
          </div>
          <div className="beam-delete__body">
            <Outlined text={TEXT.message} lines={3} className="beam-delete__message" />
            <div className="beam-delete__footer">
              <span className="beam-delete__cancel"><Outlined text={TEXT.cancel} /></span>
              <span className="beam-delete__confirm">
                <span className="beam-delete__icon"><TrashIcon className="beam-delete__trash" /></span>
                <Outlined text={TEXT.confirm} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
