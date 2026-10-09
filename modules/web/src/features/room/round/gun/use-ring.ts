import { useEffect, useRef, type RefObject } from 'react';

// The ring's progress (0 to 1) set on the element as a CSS variable whenever it changes, outside
// React's styles (web rules §5).
export const useRoomRoundGunRing = (spent: number): RefObject<SVGSVGElement | null> => {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    ref.current?.style.setProperty('--spent', String(spent));
  }, [spent]);

  return ref;
};
