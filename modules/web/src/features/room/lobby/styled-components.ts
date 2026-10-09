import { styled } from 'styled-system/jsx';

// The lobby over the card table: a column of game cards on each side, the same width so the table
// stays centred between them, and Start at the bottom of the middle. Only the cards and Start take
// clicks: the rest goes through to the table.
export const RoomLobbyRoot = styled('div', {
  base: {
    '--side': '296px',
    position: 'absolute',
    inset: '0',
    zIndex: '2',
    display: 'grid',
    gridTemplateColumns: 'var(--side) minmax(0, 1fr) var(--side)',
    gap: '20px',
    padding: '18px',
    pointerEvents: 'none',
    xl: { '--side': '336px', gap: '28px', padding: '22px' },
  },
  variants: {
    // One column of cards on the right, the table and Start to its left.
    compact: {
      true: { '--side': '300px', gridTemplateColumns: 'minmax(0, 1fr) var(--side)', gap: '10px', padding: '8px', paddingLeft: '66px', xl: { '--side': '320px', gap: '10px', padding: '8px', paddingLeft: '66px' } },
      false: {},
    },
  },
  defaultVariants: { compact: false },
});

export const RoomLobbySide = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
    minHeight: '0',
    marginBlock: '-8px',
    paddingBlock: '8px',
    paddingInline: '4px',
    marginInline: '-4px',
    overflowY: 'auto',
    overscrollBehavior: 'contain',
    scrollbarWidth: 'thin',
    scrollbarColor: '{colors.brass.deep} transparent',
    pointerEvents: 'auto',
    '& > section:nth-child(2)': { animationDelay: '0.08s' },
    '& > section:nth-child(3)': { animationDelay: '0.16s' },
  },
  variants: {
    side: {
      left: { gridColumn: '1', gridRow: '1' },
      right: { gridColumn: '-2 / -1', gridRow: '1' },
    },
  },
});

export const RoomLobbyHint = styled('p', {
  base: { fontSize: '12.5px', lineHeight: '1.4', color: 'print.muted', '@media (max-height: 540px)': { fontSize: '13.5px' } },
});

export const RoomLobbyPlayersList = styled('ul', {
  base: { display: 'grid', gap: '6px' },
});

export const RoomLobbyPlayersItemRoot = styled('li', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minHeight: '52px',
    paddingBlock: '6px',
    paddingLeft: '8px',
    paddingRight: '4px',
    borderRadius: '12px',
    border: '1.5px solid',
    borderColor: 'print.line',
    bg: 'print.paper',
    animation: 'dialogIn 0.3s ease-out',
  },
  variants: {
    me: {
      true: { borderColor: 'suit.blue', bg: 'rgba(43, 106, 214, 0.08)' },
      false: {},
    },
  },
});

export const RoomLobbyPlayersText = styled('span', {
  base: { display: 'grid', flex: '1', minWidth: '0' },
});

export const RoomLobbyPlayersName = styled('span', {
  base: { fontFamily: 'display', fontSize: '15px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});

export const RoomLobbyPlayersNote = styled('span', {
  base: { fontSize: '12px', fontWeight: '600', color: 'print.muted' },
});

// The free seats: an empty slot that seats a bot.
export const RoomLobbyPlayersAdd = styled('button', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    height: '48px',
    borderRadius: '12px',
    border: '2px dashed',
    borderColor: 'print.soft',
    color: 'print.muted',
    fontFamily: 'display',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease, color 0.12s ease, border-color 0.12s ease',
    _hover: { borderColor: 'suit.blue', color: 'suit.blueDeep', bg: 'rgba(43, 106, 214, 0.06)' },
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
    '& svg': { width: '18px', height: '18px', strokeWidth: '2.5' },
  },
});

export const RoomLobbyPlayersFoot = styled('footer', {
  base: { display: 'grid', gap: '10px', paddingTop: '14px', borderTop: '2px solid', borderColor: 'print.shade' },
});

// The switches: one that's on shows in felt green.
export const RoomLobbyGameSwitches = styled('ul', {
  base: { display: 'grid', gap: '4px', marginInline: '-6px' },
});

export const RoomLobbyGameSwitch = styled('li', {
  base: {
    paddingBlock: '10px',
    paddingInline: '10px',
    borderRadius: '12px',
    border: '1.5px solid',
    borderColor: 'transparent',
    transition: 'background-color 0.15s ease, border-color 0.15s ease',
  },
  variants: {
    on: {
      true: { bg: 'rgba(47, 158, 88, 0.1)', borderColor: 'rgba(47, 158, 88, 0.45)' },
      false: {},
    },
  },
});

// "Poke the lamp while you wait", at the bottom of the table between the cards, until someone has.
export const RoomLobbyPrompt = styled('p', {
  base: {
    gridColumn: '2',
    gridRow: '1',
    alignSelf: 'end',
    justifySelf: 'center',
    marginBottom: '6px',
    paddingInline: '14px',
    paddingBlock: '7px',
    borderRadius: 'full',
    bg: 'rgba(14, 10, 8, 0.7)',
    color: 'accent.text',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'center',
    textWrap: 'balance',
    animation: 'fadeIn 0.6s ease-out',
  },
  variants: {
    compact: {
      true: { gridColumn: '1', fontSize: '13px' },
      false: {},
    },
  },
  defaultVariants: { compact: false },
});

// A notice over the top of the table, in the same lamplit plate as the prompt.
export const RoomLobbyNoticeRoot = styled('p', {
  base: {
    gridColumn: '2',
    gridRow: '1',
    alignSelf: 'start',
    justifySelf: 'center',
    maxWidth: '520px',
    marginTop: '4px',
    paddingInline: '16px',
    paddingBlock: '8px',
    borderRadius: '12px',
    bg: 'rgba(14, 10, 8, 0.86)',
    boxShadow: 'floating',
    color: 'accent.text',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'center',
    textWrap: 'balance',
    cursor: 'pointer',
    pointerEvents: 'auto',
    animation: 'fadeIn 0.3s ease-out',
  },
  variants: {
    compact: {
      true: { gridColumn: '1', fontSize: '13px' },
      false: {},
    },
  },
  defaultVariants: { compact: false },
});
