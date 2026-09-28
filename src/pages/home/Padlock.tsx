import type React from 'react';
import { useId } from 'react';
import { GRID } from './lockedGrid';

// The "coming soon" card's lock (Figma 261:141), drawn in code from its vectors.

/** The small lock beside a locked card's title (328:2606): 16px, 30% ink. */
export function LockIcon() {
  return <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <g opacity="0.3" stroke="#1C1F21" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 9.77778V10.6667" />
      <path d="M5.55556 6.78044V4C5.55556 2.64978 6.64978 1.55556 8 1.55556C9.35022 1.55556 10.4444 2.64978 10.4444 4V6.78133" />
      <path d="M8 14.4444C10.3319 14.4444 12.2222 12.5541 12.2222 10.2222C12.2222 7.89035 10.3319 6 8 6C5.66813 6 3.77778 7.89035 3.77778 10.2222C3.77778 12.5541 5.66813 14.4444 8 14.4444Z" />
    </g>
  </svg>;
}

const SHACKLE_OUTER = 'M35.7367 1.30362C48.2175 1.30362 58.3354 11.4214 58.3354 23.9023V55.1029L58.3334 55.3783V55.3859C58.177 67.7325 48.1201 77.6926 35.7367 77.6926H34.5295L34.2541 77.6911H34.2452C21.8986 77.5346 11.9385 67.4774 11.9385 55.094V23.9023C11.9385 11.5189 21.8987 1.46164 34.2452 1.30521H34.2541L34.5295 1.30362H35.7367ZM34.5371 9.91011C26.8095 9.91011 20.545 16.1746 20.545 23.9023V55.094C20.545 62.8216 26.8095 69.0862 34.5371 69.0862H35.7367C43.4643 69.0862 49.7289 62.8216 49.7289 55.094V23.9023C49.7289 16.1746 43.4643 9.91011 35.7367 9.91011H34.5371Z';
const SHACKLE_INNER = 'M35.7414 70.3905V76.389H34.5418V70.3905H35.7414ZM51.0375 55.0944V23.9026C51.0375 15.4548 44.1892 8.60649 35.7414 8.60649H34.5418C26.094 8.60649 19.2457 15.4548 19.2457 23.9026V55.0944C19.2457 63.5422 26.094 70.3905 34.5418 70.3905V76.389L34.2664 76.3874C22.6326 76.2401 13.2472 66.7631 13.2472 55.0944V23.9026C13.2472 12.2339 22.6326 2.75696 34.2664 2.60958L34.5418 2.60799H35.7414C47.502 2.60799 57.036 12.142 57.036 23.9026V55.0944L57.0341 55.3698C56.8867 67.0035 47.4101 76.389 35.7414 76.389V70.3905C44.1892 70.3905 51.0375 63.5422 51.0375 55.0944Z';
const LUG_LEFT = 'M18.6419 32.4428C22.0411 32.4428 24.7967 35.1984 24.7967 38.5976V65.5909C24.7967 68.9901 22.0411 71.7457 18.6419 71.7457H13.2432C9.844 71.7456 7.08842 68.9901 7.08837 65.5909V38.5976C7.08843 35.1984 9.844 32.4429 13.2432 32.4428H18.6419Z';
const LUG_RIGHT = 'M57.2012 32.4428C60.6004 32.4428 63.3559 35.1984 63.356 38.5976V65.5909C63.3559 68.9901 60.6004 71.7457 57.2012 71.7457H51.8024C48.4033 71.7456 45.6477 68.9901 45.6476 65.5909V38.5976C45.6477 35.1984 48.4033 32.4429 51.8024 32.4428H57.2012Z';
const KEYHOLE = 'M35.2173 63.939C38.6379 63.939 41.4109 66.712 41.411 70.1326C41.411 72.9193 39.5703 75.2759 37.0386 76.0538V81.3792C37.0386 82.3853 36.2231 83.2009 35.217 83.2009C34.2109 83.2009 33.3954 82.3853 33.3954 81.3792V76.0538C30.8639 75.2757 29.0237 72.9191 29.0237 70.1326C29.0237 66.712 31.7967 63.939 35.2173 63.939Z';
const STICKER = 'M42.2095 0C58.3333 0 71.4058 13.0709 71.4063 29.1952V33.7534C74.4567 36.0807 76.4264 39.7515 76.4268 43.8911V54.2896C80.8155 60.8933 83.3753 68.8245 83.3753 77.3385L83.3624 78.4144C82.7917 100.941 64.3518 119.026 41.6877 119.026C19.0236 119.026 0.583592 100.941 0.0128855 78.4144L0 77.3385C0 68.812 2.56685 60.8691 6.96781 54.259V43.8911L6.98069 43.3193C7.14949 39.4933 9.00321 36.1135 11.8143 33.8903V29.1952C11.8149 13.1969 24.6823 0.204159 40.6343 0.00161068H40.689L40.9645 0H42.2095ZM41.0112 21.8006C36.9279 21.8006 33.6169 25.1111 33.6165 29.1952V34.388C34.2126 34.9212 34.7578 35.5095 35.2449 36.1453C37.3478 35.819 39.4998 35.6508 41.6877 35.6508C43.8803 35.6508 46.0372 35.8209 48.1449 36.1485C48.586 35.5724 49.0748 35.0352 49.6058 34.5427V29.1952C49.6053 25.1121 46.2938 21.8006 42.2095 21.8006H41.0112Z';

/**
 * The padlock on a white sticker outline (328:2581), 83.4 × 119px at full size (`width` scales
 * it; over an image it is 53.35px wide, 328:3990): a shackle, two lugs and a
 * round body, each a dark base lit by a soft grey highlight, and a keyhole with an inner shadow.
 * Figma's background blurs under the highlights are left out; its foreground blurs are kept.
 */
export function Padlock({ width = 83.3753 }: { width?: number }) {
  const raw = useId().replace(/:/g, '');
  const id = (name: string) => `${raw}-${name}`;
  const url = (name: string) => `url(#${id(name)})`;
  // Every part is a dark base (faint: 20%, the shaded outer parts) under its gradient.
  const part = (shape: (fill: string, fillOpacity?: number) => React.JSX.Element, faint: boolean, gradient: string, filter?: string) =>
    <g filter={filter ? url(filter) : undefined}>{shape('#1B1B1B', faint ? 0.2 : undefined)}{shape(url(gradient))}</g>;
  return <svg width={width} height={width * 119.026 / 83.3753} viewBox="0 0 83.3753 119.026" fill="none" aria-hidden="true">
    <path d={STICKER} fill="#fff" />
    {/* The lock sits 6.47 × 5.3px inside the sticker, as placed in Figma. */}
    <g transform="translate(6.4712 5.2983)">
      {part((fill, fillOpacity) => <path d={SHACKLE_OUTER} fill={fill} fillOpacity={fillOpacity} />, true, 'shackleShade', 'rim')}
      {part(fill => <path d={SHACKLE_INNER} fill={fill} />, false, 'shackleLight', 'soft')}
      {part((fill, fillOpacity) => <path d={LUG_LEFT} fill={fill} fillOpacity={fillOpacity} />, true, 'lugLeftShade', 'rim')}
      {part((fill, fillOpacity) => <path d={LUG_RIGHT} fill={fill} fillOpacity={fillOpacity} />, true, 'lugRightShade', 'rim')}
      {part(fill => <rect x="9.0469" y="34.3998" width="13.7965" height="35.3909" rx="4.19886" fill={fill} />, false, 'lugLeftLight', 'soft')}
      {part(fill => <rect x="47.5999" y="34.3998" width="13.7965" height="35.3909" rx="4.19886" fill={fill} />, false, 'lugRightLight', 'soft')}
      {part((fill, fillOpacity) => <circle cx="35.2118" cy="72.0443" r="35.091" fill={fill} fillOpacity={fillOpacity} />, true, 'bodyShade')}
      {part(fill => <circle cx="35.2078" cy="72.0451" r="32.5999" fill={fill} />, false, 'bodyRing1', 'soft')}
      {part(fill => <circle cx="35.2022" cy="72.3232" r="28.8634" fill={fill} />, false, 'bodyRing2', 'soft')}
      {part(fill => <circle cx="35.2075" cy="72.3229" r="22.7869" fill={fill} />, false, 'bodyRing3', 'softer')}
      <path d={KEYHOLE} fill="#1B1B1B" filter={url('keyhole')} />
    </g>
    <defs>
      {/* A 0.16px white rim round the shaded parts. */}
      <filter id={id('rim')} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
        <feMorphology radius="0.162999" operator="dilate" in="SourceAlpha" result="grown" />
        <feComposite in="grown" in2="SourceAlpha" operator="out" result="edge" />
        <feColorMatrix in="edge" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0" result="white" />
        <feMerge><feMergeNode in="white" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id={id('soft')} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB"><feGaussianBlur stdDeviation="1.30399" /></filter>
      <filter id={id('softer')} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB"><feGaussianBlur stdDeviation="0.759563" /></filter>
      {/* The keyhole's inner shadow, mid grey. */}
      <filter id={id('keyhole')} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feGaussianBlur in="SourceAlpha" stdDeviation="1.36088" />
        <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.509465 0 0 0 0 0.509465 0 0 0 0 0.509465 0 0 0 1 0" result="inner" />
        <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="inner" /></feMerge>
      </filter>
      <linearGradient id={id('shackleShade')} x1="20.8734" y1="18.5389" x2="61.7018" y2="46.2867" gradientUnits="userSpaceOnUse"><stop stopColor="#6C6C6C" /><stop offset="1" /></linearGradient>
      <radialGradient id={id('shackleLight')} cx="0" cy="0" r="1" gradientTransform="matrix(47.7892 108.301 -61.8169 50.8338 19.1338 -14.9633)" gradientUnits="userSpaceOnUse"><stop stopColor="#B5B5B5" /><stop offset="0.39649" stopColor="#fff" stopOpacity="0" /></radialGradient>
      <linearGradient id={id('lugLeftShade')} x1="10.4986" y1="41.3105" x2="28.6624" y2="50.4679" gradientUnits="userSpaceOnUse"><stop stopColor="#6C6C6C" /><stop offset="1" /></linearGradient>
      <linearGradient id={id('lugRightShade')} x1="49.0578" y1="41.3105" x2="67.2217" y2="50.4679" gradientUnits="userSpaceOnUse"><stop stopColor="#6C6C6C" /><stop offset="1" /></linearGradient>
      <radialGradient id={id('lugLeftLight')} cx="0" cy="0" r="1" gradientTransform="matrix(13.6919 45.6398 -17.0265 21.882 8.64831 29.5028)" gradientUnits="userSpaceOnUse"><stop stopColor="#B5B5B5" /><stop offset="0.39649" stopColor="#fff" stopOpacity="0" /></radialGradient>
      <radialGradient id={id('lugRightLight')} cx="0" cy="0" r="1" gradientTransform="matrix(13.6919 45.6398 -17.0265 21.882 47.2013 29.5028)" gradientUnits="userSpaceOnUse"><stop stopColor="#B5B5B5" /><stop offset="0.39649" stopColor="#fff" stopOpacity="0" /></radialGradient>
      <linearGradient id={id('bodyShade')} x1="13.6362" y1="52.7882" x2="53.7263" y2="97.6467" gradientUnits="userSpaceOnUse"><stop stopColor="#6C6C6C" /><stop offset="1" /></linearGradient>
      <radialGradient id={id('bodyRing1')} cx="0" cy="0" r="1" gradientTransform="matrix(-39.9348 -83.9446 91.8411 -68.028 52.4858 105.949)" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#B5B5B5" /></radialGradient>
      <radialGradient id={id('bodyRing2')} cx="0" cy="0" r="1" gradientTransform="matrix(-35.3577 -74.3233 81.3147 -60.2309 50.4998 102.341)" gradientUnits="userSpaceOnUse"><stop stopColor="#B5B5B5" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
      <radialGradient id={id('bodyRing3')} cx="0" cy="0" r="1" gradientTransform="matrix(-27.914 -58.6763 64.1958 -47.5507 47.2846 96.0212)" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#B5B5B5" /></radialGradient>
    </defs>
  </svg>;
}

/**
 * The grid laid over a locked card's image (328:3756), at its Figma size. The card places it
 * so its centre sits 61.43px right of and 0.25px below the box's centre, as in Figma.
 */
export function LockedGrid({ className }: { className?: string }) {
  const { width, height } = GRID;
  return <svg className={className} width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none" aria-hidden="true">
    <g opacity="0.7" stroke="#fff" strokeWidth="0.319963">
      <g opacity="0.3">
        {GRID.fineX.map(x => <path key={`x${x}`} d={`M${x} 0V${height}`} />)}
        {GRID.fineY.map(y => <path key={`y${y}`} d={`M0 ${y}H${width}`} />)}
      </g>
      {GRID.majorX.map((x, index) => <path key={`X${index}`} d={`M${x} 0V${height}`} />)}
      {GRID.majorY.map((y, index) => <path key={`Y${index}`} d={`M0 ${y}H${width}`} />)}
      {GRID.dotX.flatMap(x => GRID.dotY.map(y => <rect key={`${x}-${y}`} x={x} y={y} width="1.27985" height="1.27985" fill="#fff" stroke="none" />))}
    </g>
  </svg>;
}
