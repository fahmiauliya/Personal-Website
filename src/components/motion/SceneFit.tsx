import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

// Lays out a scene at its fixed design size (Figma px) and scales it uniformly to cover
// its box, cropping the overflow, centred: the same maths as MotionPreview's `cover` fit,
// for covers built from code rather than a motion export. `contain` instead fits it whole,
// from the top left (the Beam gallery's ported motions, as their iframes were fitted).
export default function SceneFit({ width, height, contain = false, children }: { width: number; height: number; contain?: boolean; children: ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('none');

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const fit = (boxWidth: number, boxHeight: number) => {
      if (contain) return setTransform(`scale(${Math.min(boxWidth / width, boxHeight / height)})`);
      const scale = Math.max(boxWidth / width, boxHeight / height);
      setTransform(`translate(${(boxWidth - width * scale) / 2}px, ${(boxHeight - height * scale) / 2}px) scale(${scale})`);
    };
    fit(viewport.clientWidth, viewport.clientHeight);
    const observer = new ResizeObserver(([entry]) => fit(entry.contentRect.width, entry.contentRect.height));
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [contain, height, width]);

  return (
    <div className="scene-fit" ref={viewportRef}>
      <div className="scene-fit-stage" style={{ width, height, transform }}>{children}</div>
    </div>
  );
}
