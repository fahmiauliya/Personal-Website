// Bifrost motion gallery. Slot sizes come from Figma frame 225:111825 (1408px wide
// gallery), in design pixels. Frames are numbered 01–13 in reading order, matching
// Motion Lab's bifrost-content/motion-XX. Figma's own labels differ from motion 06
// onward (it has no "Motion 6" and two "Motion 11"s); `figmaLabel` keeps the map.
//
// Each motion is the whole Motion Lab frame, from the shared motion bundle: run
// `npm run sync:motions` to refresh public/motions/. `motion` holds
// the export's own frame size; the gallery stretches it to the slot, which differs
// by under a pixel (Motion Lab rounds some heights, e.g. 557 vs 556.7).

import type { MotionScene } from '../../components/MotionPreview';

export const MOTION_GALLERY_WIDTH = 1408;

export interface MotionSlot {
  figmaLabel: string;
  width: number;
  height: number;
  /** Shown while the motion loads; matches the Motion Lab frame background. */
  background: string;
  /** Omit when the motion's frame image already draws its own label. */
  label?: { color: 'light' | 'dark'; top: number };
  motion: MotionScene;
}

export type MotionId =
  | 'motion-01' | 'motion-02' | 'motion-03' | 'motion-04' | 'motion-05' | 'motion-06' | 'motion-07'
  | 'motion-08' | 'motion-09' | 'motion-10' | 'motion-11' | 'motion-12' | 'motion-13';

const pairWidth = 698;
const pairHeight = 556.7;
const tallRowHeight = 811.93;

const scene = (id: MotionId, width: number, height: number, title: string): MotionScene => (
  { id: `bifrost/${id.slice('motion-'.length)}`, width, height, title }
);

export const motionSlots: Record<MotionId, MotionSlot> = {
  'motion-01': {
    figmaLabel: 'Motion 1', width: pairWidth, height: pairHeight, background: '#00251a',
    label: { color: 'light', top: 19.65 },
    motion: scene('motion-01', 698, 556.7, 'Bifrost benchmark motion'),
  },
  'motion-02': {
    figmaLabel: 'Motion 2', width: pairWidth, height: pairHeight, background: '#00281e',
    label: { color: 'light', top: 19.65 },
    motion: scene('motion-02', 698, 557, 'Bifrost hero motion'),
  },
  'motion-03': {
    figmaLabel: 'Motion 3', width: MOTION_GALLERY_WIDTH, height: 600, background: '#f9f9f9',
    label: { color: 'dark', top: 19.94 },
    motion: scene('motion-03', 1408, 600, 'Bifrost hero background motion'),
  },
  'motion-04': {
    figmaLabel: 'Motion 4', width: pairWidth, height: pairHeight, background: '#00281e',
    label: { color: 'light', top: 19.94 },
    motion: scene('motion-04', 698, 557, 'Bifrost social post carousel motion'),
  },
  'motion-05': {
    figmaLabel: 'Motion 5', width: pairWidth, height: pairHeight, background: '#00251a',
    label: { color: 'light', top: 19.94 },
    motion: scene('motion-05', 698, 556.7, 'Bifrost features motion'),
  },
  'motion-06': {
    figmaLabel: 'Motion 7', width: 531, height: tallRowHeight, background: '#1f1f1f',
    label: { color: 'light', top: 20.24 },
    motion: scene('motion-06', 531, 812, 'Bifrost vertical banner motion'),
  },
  // Motion Lab's frame image (motion-07.svg) already draws Figma's "Motion 8" label.
  'motion-07': {
    figmaLabel: 'Motion 8', width: 865, height: tallRowHeight, background: '#f6f6f6',
    motion: scene('motion-07', 865, 812, 'Bifrost enterprise motion'),
  },
  'motion-08': {
    figmaLabel: 'Motion 9', width: pairWidth, height: pairHeight, background: '#00251a',
    label: { color: 'light', top: 20.31 },
    motion: scene('motion-08', 698, 556.7, 'Bifrost governance motion'),
  },
  'motion-09': {
    figmaLabel: 'Motion 10', width: pairWidth, height: pairHeight, background: '#00281e',
    label: { color: 'dark', top: 20.31 },
    motion: scene('motion-09', 698, 557, 'Bifrost feature cards carousel motion'),
  },
  'motion-10': {
    figmaLabel: 'Motion 11 (tall)', width: pairWidth, height: 1125.41, background: '#00251a',
    label: { color: 'dark', top: 20.6 },
    motion: scene('motion-10', 698, 1126, 'Bifrost architecture layers motion'),
  },
  'motion-11': {
    figmaLabel: 'Motion 11', width: pairWidth, height: pairHeight, background: '#00281e',
    label: { color: 'dark', top: 20.6 },
    motion: scene('motion-11', 698, 557, 'Bifrost drop-in SDK motion'),
  },
  'motion-12': {
    figmaLabel: 'Motion 12', width: pairWidth, height: pairHeight, background: '#00251a',
    label: { color: 'light', top: 20.6 },
    motion: scene('motion-12', 698, 557, 'Bifrost binary wave motion'),
  },
  'motion-13': {
    figmaLabel: 'Motion 13', width: MOTION_GALLERY_WIDTH, height: tallRowHeight, background: '#00251a',
    label: { color: 'light', top: 20.2 },
    motion: scene('motion-13', 1408, 812, 'Bifrost guardrails motion'),
  },
};

// Rows → columns → slots stacked in that column.
export const motionLayout: MotionId[][][] = [
  [['motion-01'], ['motion-02']],
  [['motion-03']],
  [['motion-04'], ['motion-05']],
  [['motion-06'], ['motion-07']],
  [['motion-08'], ['motion-09']],
  [['motion-10'], ['motion-11', 'motion-12']],
  [['motion-13']],
];
