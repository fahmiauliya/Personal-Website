import { useEffect, useRef, type ReactNode } from 'react';
import { BorderBeam } from 'border-beam';

// Traveling beam around the footer "Let's Talk" pill. The page is white, so the beam is
// black: the grayscale light-theme beam with its hue shift off, and brightness 0 (the
// package applies it as a CSS brightness() filter) turning its grays to pure black while
// keeping the beam's shape and fade.
//
// The beam spins on a CSS animation that restyles it every frame, even off screen, so
// it is paused (data-beam-paused, global.css) whenever the pill isn't visible. Pausing,
// rather than the package's `active` switch, keeps it looking the same: it resumes
// where it stopped, with no fade out and in.
export default function ContactBeam({ className, children }: { className: string; children: ReactNode }) {
  const beam = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = beam.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      element.toggleAttribute('data-beam-paused', !entry?.isIntersecting);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <BorderBeam ref={beam} className={`contact-beam ${className}`} size="md" colorVariant="mono" theme="light" staticColors brightness={0}>
      {children}
    </BorderBeam>
  );
}
