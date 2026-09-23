import { useEffect, useRef, useState, type ReactNode } from 'react';

// Lays out a scene at its fixed design size (Figma px) and scales it uniformly to cover
// its box, cropping the overflow, centred: the same maths as MotionPreview's `cover` fit,
// for covers built from code rather than a motion export.
export default function SceneFit({ width, height, children }: { width: number; height: number; children: ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('none');

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width: boxWidth, height: boxHeight } = entry.contentRect;
      const scale = Math.max(boxWidth / width, boxHeight / height);
      setTransform(`translate(${(boxWidth - width * scale) / 2}px, ${(boxHeight - height * scale) / 2}px) scale(${scale})`);
    });
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [height, width]);

  return (
    <div className="scene-fit" ref={viewportRef}>
      <div className="scene-fit-stage" style={{ width, height, transform }}>{children}</div>
    </div>
  );
}
