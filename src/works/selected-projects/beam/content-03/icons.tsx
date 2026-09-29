import type { SVGProps } from "react";

// Lucide icons (lucide-react 0.446.0, ISC licence), as Motion Lab renders them: the 24px grid,
// currentColor strokes of width 2, and lucide's `size` prop (width and height). Inlined, so the
// site needs no icon package.
type IconProps = SVGProps<SVGSVGElement> & { size?: number };
const base = { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;

export function Check({ size = 24, className = "", ...props }: IconProps) {
  return <svg {...base} width={size} height={size} className={`lucide lucide-check${className ? " " + className : ""}`} {...props}><path d="M20 6 9 17l-5-5" /></svg>;
}

export function ChevronDown({ size = 24, className = "", ...props }: IconProps) {
  return <svg {...base} width={size} height={size} className={`lucide lucide-chevron-down${className ? " " + className : ""}`} {...props}><path d="m6 9 6 6 6-6" /></svg>;
}

export function ChevronLeft({ size = 24, className = "", ...props }: IconProps) {
  return <svg {...base} width={size} height={size} className={`lucide lucide-chevron-left${className ? " " + className : ""}`} {...props}><path d="m15 18-6-6 6-6" /></svg>;
}

export function Download({ size = 24, className = "", ...props }: IconProps) {
  return <svg {...base} width={size} height={size} className={`lucide lucide-download${className ? " " + className : ""}`} {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>;
}

export function File({ size = 24, className = "", ...props }: IconProps) {
  return <svg {...base} width={size} height={size} className={`lucide lucide-file${className ? " " + className : ""}`} {...props}><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" /><path d="M14 2v4a2 2 0 0 0 2 2h4" /></svg>;
}

export function Folder({ size = 24, className = "", ...props }: IconProps) {
  return <svg {...base} width={size} height={size} className={`lucide lucide-folder${className ? " " + className : ""}`} {...props}><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" /></svg>;
}

export function MoreHorizontal({ size = 24, className = "", ...props }: IconProps) {
  return <svg {...base} width={size} height={size} className={`lucide lucide-ellipsis${className ? " " + className : ""}`} {...props}><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" /></svg>;
}

export function Search({ size = 24, className = "", ...props }: IconProps) {
  return <svg {...base} width={size} height={size} className={`lucide lucide-search${className ? " " + className : ""}`} {...props}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>;
}

export function Share2({ size = 24, className = "", ...props }: IconProps) {
  return <svg {...base} width={size} height={size} className={`lucide lucide-share-2${className ? " " + className : ""}`} {...props}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" x2="15.42" y1="13.51" y2="17.49" /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" /></svg>;
}

export function X({ size = 24, className = "", ...props }: IconProps) {
  return <svg {...base} width={size} height={size} className={`lucide lucide-x${className ? " " + className : ""}`} {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>;
}
