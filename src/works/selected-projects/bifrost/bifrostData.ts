import type { MotionScene } from '../../../components/motion/MotionPreview';

// The project summary (left) and story (right) on the Bifrost page.
export const bifrostProject = {
  title: 'Bifrost',
  // The live site, opened by Visit site.
  url: 'https://www.getmaxim.ai/',
  category: 'Website Design · Motion · Framer Implementation',
  details: [
    { label: 'Year', lines: ['2026'] },
    { label: 'Type', lines: ['AI Infrastructure · Marketing Website'] },
    { label: 'Role', lines: ['Product Designer + Framer Implementation'] },
    { label: 'Deliverables', lines: ['Website Design · Responsive Design · Framer Implementation'] },
  ],
  description: [
    'Bifrost is an open-source enterprise AI gateway built to help teams run AI workloads with reliability, governance, and scale.',
    'It works across different models and SDKs, with features including governance, MCP gateway, guardrails, and drop-in integration into existing AI infrastructure.',
  ],
  // Motion Lab's bifrost-content/motion-cover (Figma 244:2284); refresh with `npm run sync:motions`.
  // The home page's Works card uses this same cover (src/data/portfolio.ts).
  cover: { id: 'bifrost/cover', width: 806, height: 706, title: 'Bifrost cover motion' } satisfies MotionScene,
};
