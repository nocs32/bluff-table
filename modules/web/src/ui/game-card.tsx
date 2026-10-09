import type { ReactElement, ReactNode } from 'react';
import { GameCardBody, GameCardHeadRoot, GameCardRoot, GameCardSubtitle, GameCardTitle, GameCardTitles } from './styled-components';

interface GameCardProps {
  // The colour of its printed header.
  tone: 'red' | 'yellow' | 'green' | 'blue';
  title: string;
  subtitle?: string;
  children: ReactNode;
}

// A big printed card for the lobby's panels: cream card stock with an ink edge, and a printed header
// in one of the design's colours with the title in chunky lettering. M1 restyles it for the saloon
// (spec §9.1).
export function GameCard({ tone, title, subtitle, children }: GameCardProps): ReactElement {
  return (
    <GameCardRoot tone={tone} aria-label={title}>
      <GameCardHeadRoot>
        <GameCardTitles>
          <GameCardTitle>{title}</GameCardTitle>
          {subtitle && <GameCardSubtitle>{subtitle}</GameCardSubtitle>}
        </GameCardTitles>
      </GameCardHeadRoot>
      <GameCardBody>{children}</GameCardBody>
    </GameCardRoot>
  );
}
