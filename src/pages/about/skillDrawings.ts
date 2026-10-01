// The small line drawings under each skill's title on the About page's skills board, in the
// board's blueprint language (SkillsFocus.tsx draws them stroke by stroke on hover). Each is a
// list of strokes in a 166 × 110 box, drawn in order; `live` is the one element that keeps
// moving, very slowly, once the drawing is complete.
//
// No skill has a drawing at present: each cell gets the frame alone. (Fahmi took the drawings
// out; the mechanism stays, for when one is wanted.)
export type Stroke = { d: string; weight?: 'hair' | 'line' | 'ink'; dashed?: boolean };
export type Live =
  | { kind: 'cursor'; path: string } // an arrow cursor drifting along `path`
  | { kind: 'ball'; path: string }; // a dot travelling along `path`
export type Drawing = { strokes: Stroke[]; live?: Live };

const W = 166, H = 110;

export const drawings: Partial<Record<string, Drawing>> = {};
export const DRAWING_BOX = { width: W, height: H };
