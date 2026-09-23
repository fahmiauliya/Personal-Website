import { useEffect, useRef, useState } from 'react';

// A standalone motion export (e.g. public/bifrost/motion-XX/index.html) and the
// frame size it was built at.
export interface MotionScene {
  src: string;
  width: number;
  height: number;
  title: string;
}

// The exported motion keeps its original viewport and animation logic; only the
// iframe's display size changes to fill its box:
// - `fill` stretches it to the exact box. For boxes with the motion's own ratio, where
//   Motion Lab frames differ by a fraction of a pixel (e.g. 557 vs 556.7 tall) and fitting
//   would leave a hairline of background at one edge. The distortion is well under 0.1%.
// - `cover` scales it uniformly to cover the box and crops the overflow, centred. For
//   boxes whose ratio changes with the layout, such as the Works cards.
// `eager` is for covers that must paint during a project transition (lazy loading waits
// for rendering, which is paused while the transition's update runs).
export default function MotionPreview({ scene, fit = 'fill', eager = false }: { scene: MotionScene; fit?: 'fill' | 'cover'; eager?: boolean }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('none');

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const x = width / scene.width;
      const y = height / scene.height;
      if (fit === 'fill') {
        setTransform(`scale(${x}, ${y})`);
        return;
      }
      const scale = Math.max(x, y);
      const left = (width - scene.width * scale) / 2;
      const top = (height - scene.height * scale) / 2;
      setTransform(`translate(${left}px, ${top}px) scale(${scale})`);
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [fit, scene.height, scene.width]);

  return (
    <div className="motion-preview" ref={viewportRef}>
      <iframe title={scene.title} src={scene.src} loading={eager ? 'eager' : 'lazy'} style={{ width: scene.width, height: scene.height, transform }} />
    </div>
  );
}
