import type { ReactElement } from 'react';
import type { PlayerColor, PresenceStatus } from '../stores/room/types';
import { AvatarBot, AvatarFace, AvatarInitial, AvatarPresence, AvatarRoot } from './styled-components';

interface AvatarProps {
  // Their face, drawn by code (an image URL); without one, their initial.
  portrait: string | null;
  initial?: string;
  color: PlayerColor;
  size: 'sm' | 'md' | 'lg';
  label?: string;
  presence?: PresenceStatus;
  // Bots wear a 🤖 (spec §6).
  bot?: boolean;
}

// Someone's face as their character looks, framed in their colour, with an optional presence dot
// and a 🤖 for bots.
export function Avatar({ portrait, initial = '', color, size, label, presence, bot = false }: AvatarProps): ReactElement {
  return (
    <AvatarRoot tone={color} size={size} role="img" aria-label={label} title={label}>
      {portrait ? <AvatarFace src={portrait} alt="" /> : <AvatarInitial>{initial}</AvatarInitial>}
      {presence && <AvatarPresence status={presence} />}
      {bot && <AvatarBot aria-hidden>🤖</AvatarBot>}
    </AvatarRoot>
  );
}
