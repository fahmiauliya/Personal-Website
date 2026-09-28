# Motion 14 — Upload Progress Loop

A looping, decorative upload bar: dots travel left → right with a calm trailing wake, ease into 100%, settle into a green glow with a check, then reset.

## Use it on a website

Copy this whole `motion-14` folder into your project (React 18+, bundled with Vite or any bundler that imports CSS, SVG, and font files). No other setup is needed.

```tsx
import UploadProgressLoop from './motion-14';

<UploadProgressLoop />
```

| Prop | Default | Meaning |
| --- | --- | --- |
| `fileCount` | `4` | Number in "Uploading N files" |
| `playing` | `true` | `false` freezes the loop on its current frame |
| `playbackRate` | `1` | Loop speed, 0.1–3 |
| `className`, `style` | — | Position the bar; it is `100%` wide up to `470px` |

The bar is visual only: its header icons cannot be clicked or focused.

## Files

| File | Role |
| --- | --- |
| `index.ts` | Entry point |
| `UploadProgressLoop.tsx` / `.css` | The bar, its styles, and the bundled font |
| `WalkingPattern.tsx` | Canvas dot field, completion glow, and loop clock hook |
| `patternLoop.ts` | Loop timeline: travel, ease into 100%, glow, reset |
| `patternCells.ts` | Per-dot arrival, blink, and trailing wake |
| `assets/` | Header icons and the TikTok Sans font |
| `preview.tsx` / `preview.css` | Motion Lab page only — skip these on the website |
