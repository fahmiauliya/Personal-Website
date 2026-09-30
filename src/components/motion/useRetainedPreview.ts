import { useEffect, useState, type RefObject } from 'react';
import { useNearView } from './useNearView';

// A card that loads once it comes near the screen and stays loaded, but plays only while on it.
export function useRetainedPreview(ref: RefObject<Element | null>, eager = false) {
  const near = useNearView(ref, eager);
  const playing = useNearView(ref, eager, 'screen');
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { if (near) setLoaded(true); }, [near]);
  return { mounted: loaded || near, playing };
}
