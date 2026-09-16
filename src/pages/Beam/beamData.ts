// Content and geometry from Figma frame 142:95. Keep the unfinished copy and
// empty media areas as supplied; replace them here when final assets are ready.
export const beamProject = {
  title: 'Beam',
  category: 'Website, Web app (Design + Implementation',
  websiteUrl: null as string | null,
  details: [
    { label: 'Year', lines: ['2022'] },
    { label: 'Role', lines: ['Product Designer + Developer (Vibe Code)'] },
    { label: 'Role', lines: ['Product Designer + Developer (Vibe'] },
    { label: 'Services', lines: ['HTML', 'CSS', 'JavaScript', 'Custom Tumblr theme'] },
  ],
  description: [
    'Beam is a shared workspace that keeps your files and context available across laptops, cloud environments, CI, sandboxes, and AI agents.',
    'It helps humans and agents work from the same up-to-date files without repeatedly copying, syncing, or rebuilding setup.',
  ],
  note: 'copying, syncing, or rebuilding setup.',
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
  { id: 3, width: 802, height: 479, labelTop: 19.69, verticalGuides: [60, 665], horizontalGuides: [79.04], preview: { x: 46.5, y: 70.603, width: 709.17, height: 4190.945, background: '#fafafa' } },
  { id: 4, width: 384, height: 479, labelTop: 19.69, horizontalGuides: [79.04, 399.04] },
  { id: 5, width: 593, height: squareHeight, labelTop: 19.69, verticalGuides: [60.05, 531], horizontalGuides: [98.78, 371.17], preview: { x: 46.2, y: 80.058, width: 500, height: 311.766, background: '#292929' } },
  { id: 6, width: 593, height: squareHeight, dark: true, labelTop: 19.69, verticalGuides: [60.05, 531], horizontalGuides: [99.14, 371.53], overlappingLabel: 'img 11', preview: { x: 47, y: 82.402, width: 500, height: 309.722, background: '#fafafa' } },
  { id: 7, width: 593, height: squareHeight, labelTop: 19.73, verticalGuides: [60.05, 531], horizontalGuides: [98.82, 371.21] },
  { id: 8, width: 593, height: squareHeight, labelTop: 19.73, verticalGuides: [60.05, 531], horizontalGuides: [98.82, 371.21] },
  { id: 9, width: 384, height: 479, labelTop: 19.77 },
  { id: 10, width: 802, height: 479, labelTop: 19.77, preview: { x: 47, y: 70.769, width: 843, height: 526.875, background: '#fff' } },
  { id: 11, width: 593, height: squareHeight, labelTop: 19.77, preview: { x: 47, y: 79.769, width: 500, height: 312.5, background: '#141414' } },
  { id: 12, width: 593, height: squareHeight, dark: true, labelTop: 19.77, preview: { x: 47, y: 79.769, width: 500, height: 312.5, background: '#fff' } },
];
