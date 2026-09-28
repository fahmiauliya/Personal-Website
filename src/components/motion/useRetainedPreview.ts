import { useEffect, useState, type RefObject } from 'react';
import { useNearView } from './useNearView';

export function useRetainedPreview(ref: RefObject<Element | null>, eager = false) {
  const playing = useNearView(ref, eager);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { if (playing) setLoaded(true); }, [playing]);
  return { mounted: loaded || playing, playing };
}
