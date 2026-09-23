import type { MotionScene } from '../../components/MotionPreview';

// Placeholder copy duplicated from Beam; replace it with Bifrost content.
export const bifrostProject = {
  title: 'Bifrost',
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
  // Motion Lab's bifrost-content/motion-cover (Figma 244:2284); refresh with `npm run sync:bifrost -- cover`.
  // The home page's Works card uses this same cover (src/data/portfolio.ts).
  cover: { src: '/bifrost/motion-cover/index.html', width: 806, height: 706, title: 'Bifrost cover motion' } satisfies MotionScene,
};
