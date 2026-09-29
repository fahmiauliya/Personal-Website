import type { CSSProperties } from 'react';
import titleIcon from './assets/upload-progress-title.svg';
import pauseIcon from './assets/upload-pause.svg';
import checkIcon from './assets/upload-check.svg';
import chevronIcon from './assets/upload-chevron.svg';
import separatorIcon from './assets/upload-separator.svg';
import closeIcon from './assets/upload-close.svg';
import { GLYPHS, PERCENTS, PERCENT_BASELINE, TITLE } from './glyphs';
import { WalkingPattern, usePatternLoop } from './WalkingPattern';
import './UploadProgressLoop.css';

export type UploadProgressLoopProps = {
  /** Number shown in "Uploading N files". */
  fileCount?: number;
  /** Set to false to freeze the loop on its current frame. */
  playing?: boolean;
  /** Loop speed multiplier, 0.1–3. */
  playbackRate?: number;
  className?: string;
  style?: CSSProperties;
};

// The header text is drawn as outlines (glyphs.ts, traced from TikTok Sans at the positions
// the browser set it), so the motion loads no font. Both texts sit on the baseline of their
// 21.69px line box, 15px down.
function Glyphs({ chars, baseline, fromRight }: { chars: [string, number][]; baseline: number; fromRight?: number }) {
  return (
    <svg className="uploadProgressLoop__glyphs" aria-hidden="true">
      <g fill="currentColor" transform={`translate(${fromRight ?? 0} ${baseline})`}>
        {chars.map(([char, x], index) => <path key={index} d={GLYPHS[char]} transform={`translate(${x} 0)`} />)}
      </g>
    </svg>
  );
}

// Decorative, looping upload bar. The header controls are visuals only: they
// cannot be clicked or focused, so the loop always plays as designed.
export default function UploadProgressLoop({ fileCount = 4, playing = true, playbackRate = 1, className, style }: UploadProgressLoopProps) {
  const loop = usePatternLoop(playing, playbackRate);
  const percent = Math.floor(loop.progress);
  const label = `Uploading ${fileCount} ${fileCount === 1 ? 'file' : 'files'}`;

  return (
    <section
      className={`uploadProgressLoop${className ? ` ${className}` : ''}`}
      style={style}
      role="img"
      aria-label={`${label} animation`}
    >
      <WalkingPattern {...loop} />
      <div className="uploadProgressLoop__header" aria-hidden="true">
        <span className="uploadProgressLoop__title">
          <img src={titleIcon} alt="" />
          {/* Traced for the gallery's "Uploading 4 files"; any other count falls back to text. */}
          {fileCount === 4 ? <Glyphs chars={TITLE.chars} baseline={TITLE.baseline} /> : label}
        </span>
        <span className="uploadProgressLoop__percent">
          <Glyphs chars={PERCENTS[Math.min(100, Math.max(0, percent))]} baseline={PERCENT_BASELINE} fromRight={48.2} />
        </span>
        <span className="uploadProgressLoop__actions">
          <span className="uploadProgressLoop__action">
            {loop.progress >= 100 ? <img className="uploadProgressLoop__check" src={checkIcon} alt="" /> : <img src={pauseIcon} alt="" />}
          </span>
          <span className="uploadProgressLoop__action"><img src={chevronIcon} alt="" /></span>
          <img className="uploadProgressLoop__separator" src={separatorIcon} alt="" />
          <span className="uploadProgressLoop__action"><img src={closeIcon} alt="" /></span>
        </span>
      </div>
      <div className="uploadProgressLoop__track" aria-hidden="true">
        <span style={{ width: `${loop.progress}%`, opacity: loop.reset }} />
      </div>
    </section>
  );
}
