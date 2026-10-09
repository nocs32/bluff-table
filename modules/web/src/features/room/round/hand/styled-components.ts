import { styled } from 'styled-system/jsx';

// Your hand and your buttons along the bottom (spec §9.2): your cards in a straight row in the
// middle, picked ones lifted, the truthful ones marked; and on the right Play, then Liar! as a red
// stamp and Liar! ×2 beside it, each with a line saying what's at stake.
export const RoomRoundHandRoot = styled('div', {
  base: { gridColumn: '2 / -1', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'end', gap: '16px', minWidth: '0', '@media (max-height: 540px)': { gap: '8px' } },
});

// Out of your turn the cards sit a little lower and dimmer; on your turn they come up into the light.
// (The row itself never moves: the camera frames the table above it.)
export const RoomRoundHandCards = styled('ul', {
  base: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'end',
    gap: '8px',
    minWidth: '0',
    paddingTop: '18px',
    pointerEvents: 'auto',
    '& > li': { transition: 'translate 0.3s cubic-bezier(0.2, 0.8, 0.3, 1.2), filter 0.3s ease' },
    '@media (max-height: 540px)': { gap: '4px', paddingTop: '12px' },
  },
  variants: { waiting: { true: { '& > li': { translate: '0 10px', filter: 'brightness(0.72)' } } } },
});

export const RoomRoundHandCardItem = styled('li', {
  base: { animation: 'cardIn 0.4s cubic-bezier(0.2, 0.8, 0.3, 1.1) backwards', '&:nth-child(2)': { animationDelay: '0.06s' }, '&:nth-child(3)': { animationDelay: '0.12s' }, '&:nth-child(4)': { animationDelay: '0.18s' }, '&:nth-child(5)': { animationDelay: '0.24s' } },
});

// A card: its picture on card stock; it lifts when picked, and a brass check marks the truthful.
export const RoomRoundHandCardButton = styled('button', {
  base: {
    position: 'relative',
    display: 'block',
    width: '88px',
    padding: '0',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 6px 14px rgba(0, 0, 0, 0.55)',
    transition: 'transform 0.16s cubic-bezier(0.2, 0.8, 0.3, 1.2), box-shadow 0.16s ease',
    '& img': { display: 'block', width: '100%', borderRadius: '8px' },
    '&:hover:not(:disabled)': { transform: 'translateY(-6px)' },
    _disabled: { cursor: 'default' },
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '3px' },
    '&[aria-pressed=true]': { transform: 'translateY(-18px)', boxShadow: '0 0 0 3px {colors.brass.base}, 0 14px 20px rgba(0, 0, 0, 0.6)' },
    '&[aria-pressed=true]:hover:not(:disabled)': { transform: 'translateY(-20px)' },
    '@media (max-height: 540px)': { width: '54px', borderRadius: '5px', '& img': { borderRadius: '5px' }, '&[aria-pressed=true]': { transform: 'translateY(-11px)' } },
    xl: { width: '100px' },
  },
});

export const RoomRoundHandTruthful = styled('span', {
  base: {
    position: 'absolute',
    top: '-7px',
    right: '-7px',
    display: 'grid',
    placeItems: 'center',
    width: '24px',
    height: '24px',
    borderRadius: 'full',
    border: '2px solid',
    borderColor: 'paper.ink',
    bg: 'brass.base',
    color: 'paper.ink',
    fontSize: '13px',
    fontWeight: '900',
    lineHeight: '1',
    '@media (max-height: 540px)': { width: '18px', height: '18px', fontSize: '10px', top: '-5px', right: '-5px' },
  },
});

export const RoomRoundHandActionsRoot = styled('div', {
  base: {
    display: 'grid',
    gap: '8px',
    width: '260px',
    padding: '12px',
    borderRadius: '6px',
    border: '2px solid',
    borderColor: 'paper.ink',
    bg: 'print.bg',
    color: 'print.ink',
    boxShadow: 'cutoutSmall',
    pointerEvents: 'auto',
    transition: 'opacity 0.2s ease',
    '& > button': { width: '100%' },
    '@media (max-height: 540px)': { width: '200px', padding: '7px', gap: '5px', '& > button': { height: '34px', fontSize: '14px' } },
  },
  variants: {
    waiting: {
      true: { opacity: '0.62' },
      // Your turn: the buttons glow brass, waiting for you.
      false: { boxShadow: '0 0 0 3px {colors.brass.base}, 0 0 22px {colors.brass.base}' },
    },
  },
  defaultVariants: { waiting: false },
});

export const RoomRoundHandHint = styled('p', {
  base: { fontSize: '12px', fontStyle: 'italic', lineHeight: '1.35', color: 'print.muted', textWrap: 'pretty', '@media (max-height: 540px)': { fontSize: '10.5px', lineHeight: '1.25' } },
});

// Liar! ×2: a red stamp that fills while you hold it down.
export const RoomRoundHandDoubleButton = styled('button', {
  base: {
    position: 'relative',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '38px',
    borderRadius: '5px',
    border: '2px dashed',
    borderColor: 'rust.deep',
    bg: 'paper.card',
    color: 'rust.deep',
    fontFamily: 'display',
    fontSize: '15px',
    fontWeight: '900',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    userSelect: 'none',
    touchAction: 'none',
    _disabled: { opacity: '0.5', cursor: 'not-allowed' },
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '3px' },
    '&[data-holding=true]': { color: 'paper.card', borderStyle: 'solid' },
  },
});

export const RoomRoundHandDoubleFill = styled('span', {
  base: { position: 'absolute', inset: '0', bg: 'rust.base', transformOrigin: 'left', animation: 'holdFill 1s linear forwards' },
});

export const RoomRoundHandDoubleLabel = styled('span', {
  base: { position: 'relative' },
});
