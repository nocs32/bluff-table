import { styled } from 'styled-system/jsx';

// The lobby over the saloon: a column of handbills on each side, the same width so the table stays
// centred between them, and in the middle the notice, the prompt and Deal the cards. Only the cards
// and the controls take clicks: the rest goes through to the stage, so your head follows the pointer.
export const RoomLobbyRoot = styled('div', {
  base: {
    '--side': '300px',
    position: 'absolute',
    inset: '0',
    zIndex: '2',
    display: 'grid',
    gridTemplateColumns: 'var(--side) minmax(0, 1fr) var(--side)',
    gap: '22px',
    padding: '18px',
    paddingInline: '20px',
    pointerEvents: 'none',
    xl: { '--side': '330px', gap: '30px', padding: '24px' },
  },
  variants: {
    // One column of cards on the right, the saloon and Deal to its left.
    compact: {
      true: { '--side': '300px', gridTemplateColumns: 'minmax(0, 1fr) var(--side)', gap: '12px', padding: '10px', paddingLeft: '68px', xl: { '--side': '320px', gap: '12px', padding: '10px', paddingLeft: '68px' } },
      false: {},
    },
  },
  defaultVariants: { compact: false },
});

export const RoomLobbySide = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
    minHeight: '0',
    marginBlock: '-10px',
    paddingBlock: '10px',
    paddingInline: '8px',
    marginInline: '-8px',
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

// The middle: the notice at the top, the prompt and Deal at the bottom, the saloon showing between.
export const RoomLobbyMiddle = styled('div', {
  base: { gridColumn: '2', gridRow: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', minWidth: '0' },
  variants: {
    compact: {
      true: { gridColumn: '1' },
      false: {},
    },
  },
  defaultVariants: { compact: false },
});

export const RoomLobbyFoot = styled('div', {
  base: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: 'auto', maxWidth: '100%' },
});

export const RoomLobbyHint = styled('p', {
  base: { fontSize: '12.5px', fontStyle: 'italic', lineHeight: '1.4', color: 'print.muted', '@media (max-height: 540px)': { fontSize: '13.5px' } },
});

export const RoomLobbyPlayersList = styled('ul', {
  base: { display: 'grid', gap: '6px' },
});

// A seat on the list: a strip of card with an ink rule under it, yours marked with a brass edge.
export const RoomLobbyPlayersItemRoot = styled('li', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    minHeight: '54px',
    paddingBlock: '7px',
    paddingLeft: '10px',
    paddingRight: '4px',
    borderRadius: '4px',
    border: '1.5px solid',
    borderColor: 'paper.line',
    bg: 'print.raised',
    animation: 'dialogIn 0.3s ease-out',
  },
  variants: {
    me: {
      true: { borderColor: 'paper.ink', boxShadow: 'inset 4px 0 0 {colors.brass.base}' },
      false: {},
    },
  },
});

export const RoomLobbyPlayersText = styled('span', {
  base: { display: 'grid', flex: '1', minWidth: '0' },
});

export const RoomLobbyPlayersName = styled('span', {
  base: { fontFamily: 'display', fontSize: '15px', fontWeight: '800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});

export const RoomLobbyPlayersNote = styled('span', {
  base: { fontSize: '12px', fontStyle: 'italic', color: 'print.muted' },
});

// Tonight's bounty, stamped in red ink.
export const RoomLobbyPlayersBounty = styled('span', {
  base: { flexShrink: '0', fontFamily: 'display', fontSize: '14px', fontWeight: '900', color: 'rust.deep', fontVariantNumeric: 'tabular-nums', cursor: 'help' },
});

// The free seats: an empty, dashed strip that seats a bot.
export const RoomLobbyPlayersAdd = styled('button', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    height: '46px',
    borderRadius: '4px',
    border: '2px dashed',
    borderColor: 'print.soft',
    color: 'print.muted',
    fontFamily: 'display',
    fontSize: '14px',
    fontWeight: '800',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease, color 0.12s ease, border-color 0.12s ease',
    _hover: { borderColor: 'paper.ink', color: 'paper.ink', bg: 'print.hover' },
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
    '& svg': { width: '18px', height: '18px', strokeWidth: '2.5' },
  },
});

export const RoomLobbyPlayersFoot = styled('footer', {
  base: { display: 'grid', gap: '10px', paddingTop: '14px', borderTop: '2px solid', borderColor: 'paper.ink' },
});

// Your mirror beside the parts' arrows.
export const RoomLobbyCharacterBody = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '12px' },
});

export const RoomLobbyCharacterParts = styled('div', {
  base: { display: 'grid', flex: '1', gap: '2px', minWidth: '0' },
});

export const RoomLobbyCharacterPartRoot = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '2px', borderBottom: '1px dashed', borderColor: 'paper.line', _last: { borderBottom: 'none' } },
});

export const RoomLobbyCharacterPartText = styled('span', {
  base: { display: 'grid', flex: '1', minWidth: '0', textAlign: 'center', lineHeight: '1.15' },
});

export const RoomLobbyCharacterPartLabel = styled('span', {
  base: { fontSize: '9.5px', fontWeight: '700', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'print.muted' },
});

export const RoomLobbyCharacterPartValue = styled('span', {
  base: { fontFamily: 'display', fontSize: '14px', fontWeight: '800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});

export const RoomLobbyCharacterColorsRoot = styled('div', {
  base: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' },
});

export const RoomLobbyCharacterColorsLabel = styled('span', {
  base: { fontFamily: 'display', fontSize: '14px', fontWeight: '800' },
});

export const RoomLobbyCharacterColorsList = styled('div', {
  base: { display: 'flex', gap: '7px' },
});

// A colour: a round swatch with an ink edge. Yours has a cut-out ring; one someone else wears is
// crossed out.
export const RoomLobbyCharacterSwatch = styled('button', {
  base: {
    position: 'relative',
    width: '26px',
    height: '26px',
    borderRadius: 'full',
    border: '2px solid',
    borderColor: 'paper.ink',
    cursor: 'pointer',
    transition: 'transform 0.12s ease',
    _hover: { transform: 'scale(1.1)' },
    _disabled: { cursor: 'not-allowed', _hover: { transform: 'none' } },
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '3px' },
    '&[aria-pressed=true]': { boxShadow: '0 0 0 2.5px {colors.paper.card}, 0 0 0 4.5px {colors.paper.ink}' },
  },
  variants: {
    tone: {
      red: { bg: 'player.red' },
      green: { bg: 'player.green' },
      blue: { bg: 'player.blue' },
      purple: { bg: 'player.purple' },
      gold: { bg: 'player.gold' },
      teal: { bg: 'player.teal' },
    },
    taken: {
      true: { opacity: '0.45', _after: { content: '""', position: 'absolute', inset: '-4px', bgImage: 'linear-gradient(45deg, transparent 46%, {colors.paper.ink} 46% 54%, transparent 54%)' } },
      false: {},
    },
  },
  defaultVariants: { taken: false },
});

// The switches: one that's on shows in felt green.
export const RoomLobbyGameSwitches = styled('ul', {
  base: { display: 'grid', gap: '4px', marginInline: '-6px' },
});

export const RoomLobbyGameSwitch = styled('li', {
  base: {
    paddingBlock: '10px',
    paddingInline: '10px',
    borderRadius: '4px',
    border: '1.5px solid',
    borderColor: 'transparent',
    transition: 'background-color 0.15s ease, border-color 0.15s ease',
  },
  variants: {
    on: {
      true: { bg: 'rgba(63, 107, 58, 0.12)', borderColor: 'felt.light' },
      false: {},
    },
  },
});

// "Look around: your head follows your pointer…", lettered in cream on a dark strip, until someone
// pokes the lamp.
export const RoomLobbyPrompt = styled('p', {
  base: {
    maxWidth: '460px',
    paddingInline: '14px',
    paddingBlock: '7px',
    borderRadius: '4px',
    bg: 'rgba(13, 9, 7, 0.78)',
    boxShadow: 'inset 0 0 0 1px {colors.border.default}',
    color: 'accent.text',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'center',
    textWrap: 'balance',
    animation: 'fadeIn 0.6s ease-out',
    '@media (max-height: 540px)': { fontSize: '12.5px', paddingBlock: '4px', lineHeight: '1.3' },
  },
});

// Deal the cards, on a ticket of card stock: the button, and beside it what it does and the rules.
export const RoomLobbyDealRoot = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    maxWidth: '100%',
    padding: '10px',
    paddingRight: '16px',
    borderRadius: '6px',
    border: '2.5px solid',
    borderColor: 'paper.ink',
    bg: 'print.bg',
    color: 'print.ink',
    boxShadow: 'cutout',
    pointerEvents: 'auto',
    animation: 'standUp 0.5s 0.2s cubic-bezier(0.2, 0.8, 0.3, 1.1) backwards',
    transformOrigin: 'bottom center',
    _motionReduce: { animation: 'none' },
    '@media (max-height: 540px)': { gap: '10px', padding: '6px', paddingRight: '10px', '& > button': { height: '42px', paddingInline: '16px', fontSize: '16px' } },
  },
});

export const RoomLobbyDealText = styled('div', {
  base: { display: 'grid', gap: '2px', minWidth: '0', maxWidth: '240px' },
});

// On a phone the button says enough; the rules link stays.
export const RoomLobbyDealHint = styled('p', {
  base: { fontSize: '12.5px', fontStyle: 'italic', lineHeight: '1.35', color: 'print.muted', '@media (max-height: 540px)': { display: 'none' } },
});

// "New to this? The rules in 2 minutes": a printed link in red ink.
export const RoomLobbyDealRules = styled('button', {
  base: {
    justifySelf: 'start',
    fontSize: '13px',
    fontWeight: '700',
    color: 'rust.deep',
    textAlign: 'left',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
    cursor: 'pointer',
    _hover: { color: 'rust.base' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
  },
});

// A notice over the top of the saloon, on the same dark strip as the prompt.
export const RoomLobbyNoticeRoot = styled('p', {
  base: {
    maxWidth: '520px',
    paddingInline: '16px',
    paddingBlock: '8px',
    borderRadius: '4px',
    bg: 'rgba(13, 9, 7, 0.88)',
    boxShadow: 'inset 0 0 0 1px {colors.border.strong}, 0 8px 22px rgba(0, 0, 0, 0.6)',
    color: 'accent.text',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'center',
    textWrap: 'balance',
    cursor: 'pointer',
    pointerEvents: 'auto',
    animation: 'fadeIn 0.3s ease-out',
    '@media (max-height: 540px)': { fontSize: '13px' },
  },
});
