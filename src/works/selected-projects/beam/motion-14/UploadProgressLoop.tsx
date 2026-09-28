import type { CSSProperties } from 'react';
import titleIcon from './assets/upload-progress-title.svg';
import pauseIcon from './assets/upload-pause.svg';
import checkIcon from './assets/upload-check.svg';
import chevronIcon from './assets/upload-chevron.svg';
import separatorIcon from './assets/upload-separator.svg';
import closeIcon from './assets/upload-close.svg';
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
        <span className="uploadProgressLoop__title"><img src={titleIcon} alt="" />{label}</span>
        <span className="uploadProgressLoop__percent">{percent}%</span>
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
