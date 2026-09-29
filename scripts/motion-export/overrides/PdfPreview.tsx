import { useEffect, useRef, useState } from 'react';
import styles from './HeroWorkspaceDemo.module.css';

// Website export override for Motion Lab's beam-content/motion-03/product-demo/PdfPreview.tsx
// (swapped in by scripts/sync-beam-motion.mjs; Motion Lab keeps the original). The original
// draws the demo PDF's first page with pdf.js, a 1.7 MB reader plus worker. The demo has one
// PDF (brand-guidelines.pdf, "Beam Typography Scales") and its loop never opens it, so this
// draws that same page in code: an SVG at the PDF's own size in points, every line, rule and
// shape at the coordinates in the PDF's content stream (flipped to top-left). The text is the
// TikTok Sans the motion already loads: the PDF's Regular and Medium cuts are the variable
// font at 400 / 500 with optical size 14 (their glyph widths match exactly). The four
// "32 / 38"-style values were stamped on in Helvetica, drawn here with the system's.
// Shown at the size pdf.js drew it: the container's width, at most 1.35x the page.
const PAGE = { width: 595.2756, height: 841.8898 };
const INK = '#0a0a0a';
const MUTED = '#737373';
const RULE = '#d9d9d9';

type Line = [text: string, x: number, y: number, size: number, weight: 400 | 500, color: string];
const LINES: Line[] = [
  ['Beam', 67, 57, 13, 500, INK],
  ['Brand foundation / 01', 445.2756, 56, 8, 400, MUTED],
  ['Typography', 48, 132, 34, 500, INK],
  ['Direct, calm, and useful.', 48, 159, 13, 400, MUTED],
  ["TikTok Sans is Beam's primary typeface, supported by Inter and system fallbacks.", 48, 186, 9, 400, MUTED],
  ['Aa', 70, 311, 68, 500, INK],
  ['One workspace.', 190, 284, 24, 500, INK],
  ['Everywhere.', 190, 318, 24, 500, INK],
  ['ABCDEFGHIJKLMNOPQRSTUVWXYZ', 190, 347, 8, 400, MUTED],
  ['abcdefghijklmnopqrstuvwxyz  0123456789', 190, 363, 8, 400, MUTED],
  ['TYPE SCALE', 48, 426, 8, 500, MUTED],
  ['Display', 48, 468, 24, 500, INK],
  ['Heading', 48, 515, 17, 500, INK],
  ['Body text keeps product communication clear and readable.', 48, 562, 11, 400, INK],
  ['Labels and interface metadata', 48, 608, 9, 400, INK],
  ['USE', 48, 754.8898, 7, 500, MUTED],
  ['Regular 400  /  Medium 500', 82, 754.8898, 8, 400, INK],
  ['PRINCIPLE', 268, 754.8898, 7, 500, MUTED],
  ['Clarity before decoration', 326, 754.8898, 8, 400, INK],
  ['beam.app', 505.2756, 813.8898, 7, 400, MUTED],
];
const SCALE_VALUES: [string, number][] = [['32 / 38', 464], ['20 / 26', 512], ['14 / 20', 560], ['12 / 18', 606]];
const RULES = [76, 483, 531, 579, 732.8898];
const LOGO = 'M4.08347 5.41566C5.24119 6.57341 5.24115 8.44388 4.08347 9.60166L2.31793 11.3672C1.52318 12.1285 .225559 11.669 .08506 10.6301C-.123525 7.64586 .5723 5.31402 2.10858 3.44097ZM3.43711 2.10471C5.37221 .521359 7.79315 -.168859 10.1557 .034803C11.672 .226655 12.1327 1.53545 11.4069 2.27398L9.57603 4.1091C8.45337 5.23176 6.64397 5.24972 5.49542 4.16159ZM12.7309 3.70032C13.7664 2.66495 15.3839 2.55221 16.544 3.37725C18.7078 5.25806 18.7038 9.6223 18.6786 9.98735C18.5534 11.8706 17.8556 13.7218 16.5934 15.2649L10.9772 9.64861C9.81946 8.49083 9.81944 6.61184 10.9772 5.45407ZM5.46243 10.9725C6.62021 9.81478 8.49066 9.81477 9.64843 10.9725L15.2698 16.5939C13.7259 17.8619 11.8728 18.5571 9.98778 18.6825C6.9254 18.5948 4.98371 17.8788 3.38134 16.5477C2.55569 15.3868 2.66132 13.7697 3.69994 12.735Z';

export function PdfPreview({ title }: { url: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (container) setWidth(Math.min(container.clientWidth, PAGE.width * 1.35));
    // Next frame: the page fades in like the rendered PDF did (pdfCanvas → pdfCanvasReady).
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className={styles.pdfDocument} ref={containerRef} aria-label={`${title}, page 1`}>
      {!ready && <span className={styles.pdfStatus}>Loading PDF…</span>}
      {width !== undefined && (
        <svg
          className={ready ? styles.pdfCanvasReady : styles.pdfCanvas}
          width={width}
          height={width * PAGE.height / PAGE.width}
          viewBox={`0 0 ${PAGE.width} ${PAGE.height}`}
          aria-hidden="true"
          style={{ fontFamily: "'TikTok Sans', sans-serif", fontVariationSettings: "'opsz' 14" }}
        >
          <rect width={PAGE.width} height={PAGE.height} fill="#fff" />
          <path d={LOGO} fill={INK} fillRule="evenodd" transform="matrix(.695027 0 0 .695027 48 47)" />
          <rect x="48" y="230" width="499.2756" height="148" rx="8" fill="#f5f5f5" />
          {RULES.map(y => <line key={y} x1="48" y1={y} x2="547.2756" y2={y} stroke={RULE} strokeWidth=".5" />)}
          {LINES.map(([text, x, y, size, weight, color]) => (
            <text key={text} x={x} y={y} fontSize={size} fontWeight={weight} fill={color} xmlSpace="preserve" style={{ whiteSpace: 'pre' }}>{text}</text>
          ))}
          {SCALE_VALUES.map(([text, y]) => (
            <text key={text} x="445" y={y} fontSize="8" fill={MUTED} style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontVariationSettings: 'normal' }}>{text}</text>
          ))}
        </svg>
      )}
    </div>
  );
}
