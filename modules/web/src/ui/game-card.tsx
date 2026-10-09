import type { ReactElement, ReactNode } from 'react';
import { GameCardBody, GameCardHeadRoot, GameCardRoot, GameCardSubtitle, GameCardTitle } from './styled-components';

interface GameCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

// A big printed card for the lobby's panels, like a handbill pinned up in the saloon: card stock
// with an ink edge, the title in slab capitals over a double rule, and a line under it saying what
// the card is for (spec D22, §9.1).
export function GameCard({ title, subtitle, children }: GameCardProps): ReactElement {
  return (
    <GameCardRoot aria-label={title}>
      <GameCardHeadRoot>
        <GameCardTitle>{title}</GameCardTitle>
        {subtitle && <GameCardSubtitle>{subtitle}</GameCardSubtitle>}
      </GameCardHeadRoot>
      <GameCardBody>{children}</GameCardBody>
    </GameCardRoot>
  );
}
