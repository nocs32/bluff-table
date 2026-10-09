import type { RoundSnapshot } from '@bluff-table/protocol';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableRevealCard } from './reveal-card';

interface RoomTableRevealProps {
  round: RoundSnapshot;
}

// The called play's cards (spec §5.5, §8.4), standing in a row in front of the pile, flipping one at
// a time. They stay up until the next deal, so everyone can see what they were.
export const RoomTableReveal = observer(function RoomTableReveal({ round }: RoomTableRevealProps): ReactElement | null {
  const { table } = useRootStore();
  const cards = round.revealed;

  if (!cards || round.flipped === null) return null;

  return (
    <group key={`${round.number}-${round.flipped}`}>
      {cards.map((card, index) => (
        <RoomTableRevealCard key={card.id} card={card} tableRank={round.tableRank} index={index} count={cards.length} fonts={table.fontsReady} />
      ))}
    </group>
  );
});
