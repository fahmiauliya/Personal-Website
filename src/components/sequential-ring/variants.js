import preset from './preset.json';
import { cardFrame, formationRadii } from './geometry.js';
import { dialTimeline } from './timeline.js';

// Production copy of the selected Motion Lab version, with no studio UI.
export const VARIANTS = {
  v1: {
    id: 'v1', name: 'Sequential Ring',
    description: 'Images reveal one by one, gather with a liquid recoil, and unfold into a floating collection.',
    defaults: preset.settings,
    timeline: dialTimeline(preset.timeline),
    openingKeys: ['ring', 'reveal', 'gather', 'unfold'], idleKey: 'floating',
    frame: cardFrame, radii: formationRadii,
    hoverInteraction: false, horizontalDragDirection: -1, fullVerticalDrag: true,
    rate: settings => settings.floating.rotationSpeed * (settings.floating.direction === 'counterclockwise' ? -1 : 1),
    sampleClock: (sample, settings) => sample.floating.current.angle * (settings.floating.direction === 'counterclockwise' ? -1 : 1),
  },
};
