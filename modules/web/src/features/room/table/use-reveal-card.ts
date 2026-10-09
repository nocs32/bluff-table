import { isTruthful } from '@bluff-table/engine';
import { gamePace, type Card, type TableRank } from '@bluff-table/protocol';
import { useFrame } from '@react-three/fiber';
import { useRef, useState, type RefObject } from 'react';
import type { CanvasTexture, Group } from 'three';
import { useCardTexture } from './use-textures';

export interface RevealCardProps {
  card: Card;
  tableRank: TableRank;
  index: number;
  count: number;
  fonts: boolean;
}

export interface RevealCard {
  ref: RefObject<Group | null>;
  position: [number, number, number];
  // The back until it's flipped halfway, then the face (with a red edge if it was a lie).
  texture: CanvasTexture;
}

// How far apart the flipped cards stand, how far in front of the pile, and how long a flip takes.
const spacing = 0.34;
const front = 0.62;
const flipSeconds = 0.32;

// A called card, every frame (spec §8.4): it rises off the pile, then flips over in its turn, one
// after another, so the table can watch the lie (or the truth) come out card by card.
export const useRoomTableRevealCard = ({ card, tableRank, index, count, fonts }: RevealCardProps): RevealCard => {
  const ref = useRef<Group>(null);
  const born = useRef<number | null>(null);
  const [isFaceUp, setFaceUp] = useState(false);
  const back = useCardTexture(null, false, fonts);
  const face = useCardTexture(card.rank, !isTruthful(card, tableRank), fonts);

  useFrame(({ clock }) => {
    const group = ref.current;

    if (!group) return;

    born.current ??= clock.elapsedTime;

    const age = clock.elapsedTime - born.current;
    const flip = Math.min(1, Math.max(0, (age - 0.45 - (index * gamePace.revealCardMs) / 1000) / flipSeconds));

    group.position.y = 0.02 + Math.min(1, age / 0.35) * 0.06;
    group.scale.x = Math.max(0.02, Math.abs(Math.cos(flip * Math.PI)));

    if (flip >= 0.5 !== isFaceUp) setFaceUp(flip >= 0.5);
  });

  return { ref, position: [(index - (count - 1) / 2) * spacing, 0, front], texture: isFaceUp ? face : back };
};
