import { useCallback, type RefCallback } from 'react';
import type { TableStore } from '../../../stores/table';

// Measures how much of the stage your cards cover along the bottom (or your gun, when it's out), so
// the camera frames the table above them; on a phone, the dock's rail on the left too. The buttons
// at the side may overlap the table's edge.
export const useRoomRoundInsets = (table: TableStore, isCompact: boolean): RefCallback<HTMLElement> =>
  useCallback(
    (root: HTMLElement | null) => {
      if (!root) return undefined;

      const measure = (): void => {
        const box = root.getBoundingClientRect();
        const foot = (root.querySelector('[data-cards]') ?? root.querySelector('[data-foot]'))?.getBoundingClientRect();
        const rail = isCompact ? root.parentElement?.querySelector('[data-rail]')?.getBoundingClientRect() : undefined;

        table.setInsets({ left: rail ? rail.right - box.left : 0, right: 0, bottom: foot ? (box.bottom - foot.top) * (isCompact ? 0.55 : 0.75) : 0 });
      };

      const observer = new ResizeObserver(measure);

      measure();
      observer.observe(root);
      root.querySelectorAll('[data-foot], [data-cards]').forEach((part) => observer.observe(part));

      return () => {
        observer.disconnect();
        table.setInsets({ left: 0, right: 0, bottom: 0 });
      };
    },
    [table, isCompact],
  );
