// Figma's noise effect on the page (285:19231): monochrome grain a quarter CSS pixel wide,
// averaging rgb(244 245 246) with a ±5 spread, measured from a 4× Figma export. Drawn once
// as a tile and repeated as the page background.
const TILE = 256;
let cached: { url: string; size: number } | undefined;

export function pageGrain() {
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = TILE;
  canvas.height = TILE;
  const context = canvas.getContext('2d');
  if (!context) return { url: '', size: TILE };
  const image = context.createImageData(TILE, TILE);
  for (let index = 0; index < TILE * TILE; index += 1) {
    // Sum of uniforms ≈ normal, centred on 245 with a standard deviation of about 4.75.
    const noise = (Math.random() + Math.random() + Math.random() - 1.5) * 9.5;
    const value = 245 + noise;
    image.data.set([value - 1, value - 0.5, value + 0.7, 255], index * 4);
  }
  context.putImageData(image, 0, 0);
  // One grain per quarter CSS pixel, like the 4× export it was measured from; screens average it down.
  cached = { url: canvas.toDataURL(), size: TILE / 4 };
  return cached;
}
