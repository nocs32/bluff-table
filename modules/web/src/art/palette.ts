import { playerColors, type PlayerColor } from '@bluff-table/protocol';
import { token } from 'styled-system/tokens';

// The art's colours come from the design system, so the table and the HTML match.

export const paint = {
  ink: token('colors.print.ink'),
  card: token('colors.print.card'),
  paper: token('colors.print.paper'),
  shade: token('colors.print.shade'),
  muted: token('colors.print.muted'),
  brass: token('colors.brass.base'),
  brassLight: token('colors.brass.light'),
  feltLight: token('colors.felt.light'),
  feltBase: token('colors.felt.base'),
  feltEdge: token('colors.felt.edge'),
  woodDeep: token('colors.wood.deep'),
  woodDark: token('colors.wood.dark'),
  woodBase: token('colors.wood.base'),
  woodLight: token('colors.wood.light'),
  woodGrain: token('colors.wood.grain'),
  lamp: token('colors.lamp.glow'),
};

// Each player's own colour, as their chip has it.
export const playerPaint: Record<PlayerColor, string> = Object.fromEntries(playerColors.map((colour) => [colour, token(`colors.player.${colour}`)])) as Record<PlayerColor, string>;

// Canvas text uses the same typeface as the page.
export const artFont = token('fonts.display');
