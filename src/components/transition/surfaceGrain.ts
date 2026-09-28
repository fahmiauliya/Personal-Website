// Static transition grain, with the original 6/255 maximum alpha.
let grainUrl: string | undefined;
export function grain() {
  if (grainUrl !== undefined || typeof document === 'undefined') return grainUrl ?? '';
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (!context) return '';
  const image = context.createImageData(size, size);
  for (let index = 0; index < size * size; index += 1) {
    const light = Math.random() < 0.5;
    const alpha = Math.round(Math.random() * 6);
    image.data.set(light ? [255, 255, 255, alpha] : [0, 0, 0, alpha], index * 4);
  }
  context.putImageData(image, 0, 0);
  return (grainUrl = canvas.toDataURL());
}

