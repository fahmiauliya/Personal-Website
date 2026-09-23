import type { ReactNode } from 'react';
import { BorderBeam } from 'border-beam';

// Traveling beam around the footer "Let's Talk" pill. The page is white, so the beam is
// black: the grayscale light-theme beam with its hue shift off, and brightness 0 (the
// package applies it as a CSS brightness() filter) turning its grays to pure black while
// keeping the beam's shape and fade.
export default function ContactBeam({ className, children }: { className: string; children: ReactNode }) {
  return (
    <BorderBeam className={`contact-beam ${className}`} size="md" colorVariant="mono" theme="light" staticColors brightness={0}>
      {children}
    </BorderBeam>
  );
}
