// The "Personal" workspace the demo shows (Motion Lab beam-content/motion-03/product-demo/
// heroDemoData.ts): its folders and files, and how sizes and dates are written. The dates are
// days before now, so "4 days ago" always reads the same.
export type DemoFolder = { id: string; name: string };
export type DemoFile = { id: string; folderId: string; name: string; size: number; modified: number; content?: string };

export const folders: DemoFolder[] = [
  { id: 'folder-001', name: 'Folder 001' },
  { id: 'product-resources', name: 'Product Resources' },
  { id: 'website-assets', name: 'Website Assets' },
];

const now = Date.now();
const day = 86_400_000;

export const files: DemoFile[] = [
  { id: 'backup-prompt', folderId: 'folder-001', name: 'backup-prompt.md', size: 869, modified: now - day * 4, content: '# Back up a project\n\nCreate a reliable copy of the workspace before making structural changes.' },
  { id: 'folder-notes', folderId: 'folder-001', name: 'folder.md', size: 869, modified: now - day * 5 },
  { id: 'getting-started', folderId: 'folder-001', name: 'getting-started.md', size: 278, modified: now - day * 5 },
  { id: 'organize-thoughts', folderId: 'folder-001', name: 'organize-thoughts-prompt.md', size: 253, modified: now - day * 6 },
  { id: 'typography-scales', folderId: 'product-resources', name: 'typography-scales.pdf', size: 42_000_000, modified: now - day * 2 },
  { id: 'product-image', folderId: 'product-resources', name: 'product-overview.md', size: 1_680, modified: now - day * 3 },
  { id: 'release-notes', folderId: 'product-resources', name: 'release-notes.md', size: 56_000, modified: now - day * 5 },
  { id: 'homepage-hero', folderId: 'website-assets', name: 'homepage-copy.md', size: 1_240, modified: now - day },
  { id: 'campaign-image', folderId: 'website-assets', name: 'campaign-brief.md', size: 980, modified: now - day * 4 },
  { id: 'logo-mark', folderId: 'website-assets', name: 'logo-guidelines.md', size: 640, modified: now - day * 6 },
];

export function formatBytes(bytes: number) {
  if (bytes < 1_000) return `${bytes}B`;
  if (bytes < 1_000_000) return `${Math.round(bytes / 1_000)}KB`;
  return `${Math.round(bytes / 1_000_000)}MB`;
}

export function formatModified(timestamp: number) {
  const days = Math.max(0, Math.round((Date.now() - timestamp) / day));
  if (days === 0) return 'Just now';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}
