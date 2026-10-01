
// Geometry from Figma frame 142:95. The summary (left) and story (right) are final copy;
// replace the gallery's empty media areas here when final assets are ready.
export const beamProject = {
  url: 'https://beam.host/',
  title: 'Beam',
  category: 'Product Design · Web App · Website · Implementation',
  details: [
    { label: 'Year', lines: ['2026'] },
    { label: 'Type', lines: ['Product + Marketing Website'] },
    { label: 'Role', lines: ['Product Designer + Front-end Implementation'] },
    { label: 'Deliverables', lines: ['Product UI · Design System · Website · Responsive Design · Implementation'] },
  ],
  description: [
    'Beam is a shared workspace that keeps files and context available across laptops, cloud environments, CI, sandboxes, and AI agents.',
    'It helps humans and agents work from the same up-to-date files without repeatedly copying, syncing, or rebuilding setup.',
  ],
  // The cover is ./cover/BeamCover (Figma 248:3595); the home page's Works card shows the same one.
};

export interface BeamVisual {
  id: number;
  width: number;
  height: number;
  dark?: boolean;
  labelTop: number;
  verticalGuides?: number[];
  horizontalGuides?: number[];
  overlappingLabel?: string;
  preview?: {
    x: number;
    y: number;
    width: number;
    height: number;
    background: string;
    src?: string;
    alt?: string;
  };
}

const squareHeight = 593 * 394 / 494;

export const beamVisuals: BeamVisual[] = [
  { id: 1, width: 593, height: squareHeight, dark: true, labelTop: 19.65, verticalGuides: [60.05, 531], horizontalGuides: [99.14, 371.53], preview: { x: 47, y: 79.92, width: 500, height: 314.685, background: '#fafafa' } },
  { id: 2, width: 593, height: squareHeight, labelTop: 19.65, verticalGuides: [60.05, 531], horizontalGuides: [99.14, 371.53], preview: { x: 47, y: 86.17, width: 500, height: 298.472, background: '#fafafa' } },
  { id: 3, width: 802, height: 479, labelTop: 19.69, verticalGuides: [60, 665], horizontalGuides: [79.04], preview: { x: 46.5, y: 70.603, width: 709.17, height: 408.397, background: '#fafafa' } },
  // Content 04 is built in code (./content-04, Figma 339:4983); its guides are Figma's.
  { id: 4, width: 384, height: 479, labelTop: 19.69, verticalGuides: [63, 322], horizontalGuides: [79.04, 399.04] },
  { id: 5, width: 593, height: squareHeight, labelTop: 19.69, verticalGuides: [60.05, 531], horizontalGuides: [98.78, 371.17], preview: { x: 46.2, y: 80.058, width: 500, height: 311.766, background: '#292929' } },
  { id: 6, width: 593, height: squareHeight, dark: true, labelTop: 19.69, verticalGuides: [60.05, 531], horizontalGuides: [99.14, 371.53], preview: { x: 47, y: 82.402, width: 500, height: 309.722, background: '#fafafa' } },
  // Content 07 and 08 are built in code (./content-07, ./content-08); their guides are Figma's.
  { id: 7, width: 593, height: squareHeight, dark: true, labelTop: 19.73, verticalGuides: [60.05, 531], horizontalGuides: [99.18, 371.57] },
  { id: 8, width: 593, height: squareHeight, labelTop: 19.73, verticalGuides: [60.05, 289, 531], horizontalGuides: [98.82, 371.21] },
  { id: 9, width: 384, height: 479, labelTop: 19.77 },
  { id: 10, width: 802, height: 479, labelTop: 19.77 },
  { id: 11, width: 593, height: squareHeight, labelTop: 19.77 },
  { id: 12, width: 593, height: squareHeight, dark: true, labelTop: 19.77 },
  { id: 13, width: 593, height: squareHeight, labelTop: 19.77 },
  // Motion 14 is the Motion Lab component itself (./motion-14), laid out as Motion Lab's 593 × 473 frame.
  { id: 14, width: 593, height: squareHeight, labelTop: 19.77 },
];
