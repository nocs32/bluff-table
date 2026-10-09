import { useCallback, type RefCallback } from 'react';
import type { TableStore } from '../../../stores/table';

// Measures how much of the stage the lobby covers: its columns on each side, and Deal the cards
// along the bottom, so the camera frames the rest; again whenever the layout switches between wide
// and compact. When the lobby goes, nothing covers the stage.
export const useRoomLobbyInsets = (table: TableStore, isCompact: boolean): RefCallback<HTMLElement> =>
  useCallback(
    (root: HTMLElement | null) => {
      if (!root) return undefined;

      // The breathing room the table keeps from the lobby's cards: less on a phone.
      const margin = isCompact ? 6 : 12;

      const measure = (): void => {
        const box = root.getBoundingClientRect();
        // The lobby's left column, or on a phone the dock's rail standing beside the table.
        const left = (root.querySelector('[data-side=left]') ?? root.parentElement?.querySelector('[data-rail]'))?.getBoundingClientRect();
        const right = root.querySelector('[data-side=right]')?.getBoundingClientRect();
        const foot = root.querySelector('[data-foot]')?.getBoundingClientRect();

        table.setInsets({
          left: left ? left.right - box.left + margin : 0,
          right: right ? box.right - right.left + margin : 0,
          bottom: foot ? box.bottom - foot.top : 0,
        });
      };

      const observer = new ResizeObserver(measure);

      measure();
      observer.observe(root);
      root.querySelectorAll('[data-side], [data-foot]').forEach((part) => observer.observe(part));

      return () => {
        observer.disconnect();
        table.setInsets({ left: 0, right: 0, bottom: 0 });
      };
    },
    [table, isCompact],
  );
