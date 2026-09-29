import type { SVGProps } from "react";

// Lucide icons (lucide-react 0.446.0, ISC licence), as Motion Lab renders them: the 24px
// grid, currentColor strokes, width 2 (motion 01's CSS sets its own size and stroke width).
// Inlined, so the site needs no icon package.
type IconProps = SVGProps<SVGSVGElement>;
const base = { xmlns: "http://www.w3.org/2000/svg", width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export function CircleAlert({ className = "", ...props }: IconProps) {
  return <svg {...base} className={`lucide lucide-circle-alert${className ? " " + className : ""}`} {...props}><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>;
}

export function CircleCheck({ className = "", ...props }: IconProps) {
  return <svg {...base} className={`lucide lucide-circle-check${className ? " " + className : ""}`} {...props}><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>;
}

export function GitCommitHorizontal({ className = "", ...props }: IconProps) {
  return <svg {...base} className={`lucide lucide-git-commit-horizontal${className ? " " + className : ""}`} {...props}><circle cx="12" cy="12" r="3" /><line x1="3" x2="9" y1="12" y2="12" /><line x1="15" x2="21" y1="12" y2="12" /></svg>;
}

export function GitFork({ className = "", ...props }: IconProps) {
  return <svg {...base} className={`lucide lucide-git-fork${className ? " " + className : ""}`} {...props}><circle cx="12" cy="18" r="3" /><circle cx="6" cy="6" r="3" /><circle cx="18" cy="6" r="3" /><path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9" /><path d="M12 12v3" /></svg>;
}

export function LoaderCircle({ className = "", ...props }: IconProps) {
  return <svg {...base} className={`lucide lucide-loader-circle${className ? " " + className : ""}`} {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>;
}

export function LockKeyhole({ className = "", ...props }: IconProps) {
  return <svg {...base} className={`lucide lucide-lock-keyhole${className ? " " + className : ""}`} {...props}><circle cx="12" cy="16" r="1" /><rect x="3" y="10" width="18" height="12" rx="2" /><path d="M7 10V7a5 5 0 0 1 10 0v3" /></svg>;
}

export function Monitor({ className = "", ...props }: IconProps) {
  return <svg {...base} className={`lucide lucide-monitor${className ? " " + className : ""}`} {...props}><rect width="20" height="14" x="2" y="3" rx="2" /><line x1="8" x2="16" y1="21" y2="21" /><line x1="12" x2="12" y1="17" y2="21" /></svg>;
}

export function RotateCcw({ className = "", ...props }: IconProps) {
  return <svg {...base} className={`lucide lucide-rotate-ccw${className ? " " + className : ""}`} {...props}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>;
}
