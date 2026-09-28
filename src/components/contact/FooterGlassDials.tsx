import 'dialkit/styles.css';
import { DialRoot, useDialKitController, type DialConfig } from 'dialkit';
import { useEffect, useRef, useState } from 'react';
import { glassDefaults, glassSettings, type GlassSettings } from './FooterGlass';

// The footer glass's parameter panel, dev server only (ContactFooter imports this behind
// import.meta.env.DEV, so it never ships): Motion Lab's Dialkit, with every setting from
// footerGlass.settings.json as a dial, applied live. The panel's clipboard button (top
// right) is "Save to local": it writes the values back to the file through the dev server
// (vite.config.js), so the site uses the tuned values. Dialkit hard-wires that button to
// copy the parameters, with no hook, so its click is caught before Dialkit sees it.

// [min, max, step] for each numeric setting; the saved value is the default.
const RANGES: Record<string, Record<string, [number, number, number]>> = {
  Shape: { Size: [0.3, 2, 0.01], Width: [0.4, 2, 0.01], Height: [0.4, 2, 0.01], Depth: [0.4, 2, 0.01], OffsetX: [-400, 400, 1], OffsetY: [-300, 300, 1] },
  Logo: { Size: [0.5, 5, 0.05], OffsetX: [-400, 400, 1], OffsetY: [-300, 300, 1] },
  Glass: { Index: [1.02, 2.2, 0.005], Dispersion: [0, 0.03, 0.0005], Distance: [0.2, 5, 0.05], Milk: [0, 0.8, 0.01], Reflection: [0, 3, 0.05], Sheen: [0, 1.5, 0.01], Edges: [0, 1, 0.01], Rim: [0, 1.5, 0.01], Round: [0, 1, 0.01], Blur: [0, 4, 0.05] },
  Light: { Glow: [0, 2, 0.01], Inner: [0, 2, 0.01], Glints: [0, 3, 0.01] },
  Liquid: { Ripple: [0, 1, 0.01], Noise: [0, 1, 0.01], Flow: [0, 3, 0.01] },
  Shadow: { Shadow: [0, 0.4, 0.005], Caustic: [0, 0.6, 0.01], Drop: [-1.5, 1.5, 0.01] },
  Rotation: { Yaw: [0, 90, 0.5], Pitch: [-60, 60, 0.5], Roll: [-60, 60, 0.5] },
  Motion: { Spin: [0, 1.5, 0.005], Sway: [0, 0.8, 0.01], Speed: [0, 2, 0.01], Scroll: [0, 0.02, 0.0005], Lean: [0, 0.4, 0.005], Cant: [0, 0.4, 0.005], Bob: [0, 0.5, 0.005], Float: [0, 3, 0.01], PointerRoll: [0, 0.6, 0.01], PointerPitch: [0, 0.6, 0.01] },
};

function config(saved: GlassSettings): DialConfig {
  const groups: DialConfig = {};
  for (const [group, controls] of Object.entries(saved)) {
    const dials: DialConfig = {};
    for (const [name, value] of Object.entries(controls as Record<string, number | string>)) {
      dials[name] = typeof value === 'number' ? [value, ...(RANGES[group]?.[name] ?? [0, 1, 0.01])] : { type: 'color', default: value };
    }
    groups[group] = dials;
  }
  return groups;
}

// Dial values as settings: the groups only (an action has no value), typed by the defaults.
const toSettings = (values: Record<string, unknown>) => glassSettings(
  Object.fromEntries(Object.keys(glassDefaults).map(group => [group, values[group] as Record<string, number | string>])),
);

export default function FooterGlassDials({ onChange }: { onChange: (settings: GlassSettings) => void }) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const dial = useDialKitController('Footer glass', config(glassSettings()), { persist: false });
  const latest = useRef(dial);
  latest.current = dial;
  const save = async () => {
    setStatus('saving');
    try {
      const response = await fetch('/__site/footer-glass/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ values: toSettings(latest.current.getValues() as Record<string, unknown>) }),
      });
      if (!response.ok) throw new Error('Could not save.');
      setStatus('saved');
    } catch {
      setStatus('error');
    }
    window.setTimeout(() => setStatus('idle'), 2400);
  };

  const values = dial.values as Record<string, unknown>;
  useEffect(() => { onChange(toSettings(values)); }, [values, onChange]);

  // The toolbar's clipboard button saves instead of copying: a capturing listener on the
  // document runs before React's own (on its root), so stopping the event there keeps
  // Dialkit's copy from happening. The button is relabelled once the panel has rendered it.
  const saveNow = useRef(save);
  saveNow.current = save;
  useEffect(() => {
    const SAVE_BUTTON = '.dialkit-root .dialkit-toolbar-add.dialkit-toolbar-primary';
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest(SAVE_BUTTON)) return;
      event.stopPropagation();
      event.preventDefault();
      void saveNow.current();
    };
    document.addEventListener('click', onClick, true);
    const relabel = () => {
      const button = document.querySelector<HTMLButtonElement>(SAVE_BUTTON);
      if (!button) return false;
      button.title = 'Save to local';
      button.setAttribute('aria-label', 'Save to local');
      return true;
    };
    const observer = new MutationObserver(() => { if (relabel()) observer.disconnect(); });
    if (!relabel()) observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      document.removeEventListener('click', onClick, true);
    };
  }, []);

  return <>
    <DialRoot position="top-right" theme="light" defaultOpen />
    {status !== 'idle' && <div className="contact-glass-save" role="status" aria-live="polite">
      {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved to footerGlass.settings.json' : 'Save failed. Is the dev server running?'}
    </div>}
  </>;
}
