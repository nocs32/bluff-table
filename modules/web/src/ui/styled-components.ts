import { Popover } from '@ark-ui/react/popover';
import { styled } from 'styled-system/jsx';

// Someone's face, drawn like the scene's busts, in a round card frame with a ring in their colour.
export const AvatarRoot = styled('span', {
  base: {
    '--ring': '{colors.player.red}',
    position: 'relative',
    display: 'inline-flex',
    flexShrink: '0',
    borderRadius: 'full',
    bg: 'paper.poster',
    fontSize: '28px',
    boxShadow: '0 0 0 1.5px {colors.paper.ink}, 0 0 0 3.5px var(--ring), 0 0 0 5px {colors.paper.ink}',
    userSelect: 'none',
  },
  variants: {
    tone: {
      red: { '--ring': '{colors.player.red}' },
      green: { '--ring': '{colors.player.green}' },
      blue: { '--ring': '{colors.player.blue}' },
      purple: { '--ring': '{colors.player.purple}' },
      gold: { '--ring': '{colors.player.gold}' },
      teal: { '--ring': '{colors.player.teal}' },
    },
    size: {
      sm: { width: '20px', height: '20px', boxShadow: '0 0 0 1px {colors.paper.ink}, 0 0 0 2.5px var(--ring), 0 0 0 3.5px {colors.paper.ink}' },
      md: { width: '28px', height: '28px' },
      lg: { width: '38px', height: '38px' },
    },
  },
  defaultVariants: { tone: 'red', size: 'md' },
});

export const AvatarFace = styled('img', {
  base: { width: '100%', height: '100%', borderRadius: 'full', objectFit: 'cover', pointerEvents: 'none' },
});

export const AvatarInitial = styled('span', {
  base: { display: 'grid', placeItems: 'center', width: '100%', fontFamily: 'display', fontSize: '0.5em', fontWeight: '900', color: 'paper.ink' },
});

export const AvatarPresence = styled('span', {
  base: {
    position: 'absolute',
    right: '-4px',
    bottom: '-4px',
    width: '10px',
    height: '10px',
    borderRadius: 'full',
    border: '2px solid',
    borderColor: 'paper.ink',
  },
  variants: {
    status: {
      online: { bg: 'presence.online' },
      reconnecting: { bg: 'night.haze', boxShadow: 'inset 0 0 0 1.5px {colors.fg.subtle}' },
    },
  },
});

// A bot's 🤖, pinned to the frame's edge.
export const AvatarBot = styled('span', {
  base: { position: 'absolute', right: '-7px', top: '-7px', fontFamily: 'emoji', fontSize: '12px', lineHeight: '1', filter: 'drop-shadow(0 1px 1px rgba(0, 0, 0, 0.5))' },
});

// A printed button cut out of card: an ink edge, a cream cut-out border, slab lettering. The main
// one is a brass plate; the dangerous one a red stamp.
export const Button = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    height: '38px',
    paddingInline: '16px',
    borderRadius: '5px',
    border: '2px solid',
    borderColor: 'paper.ink',
    fontFamily: 'display',
    fontSize: '15px',
    fontWeight: '800',
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    boxShadow: 'cutoutSmall',
    transition: 'background-color 0.12s ease, transform 0.1s ease, filter 0.12s ease',
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '5px' },
    _disabled: { opacity: '0.5', cursor: 'not-allowed' },
    '& svg': { width: '17px', height: '17px', strokeWidth: '2.5', flexShrink: '0' },
    '&:hover:not(:disabled)': { transform: 'translateY(-1px)' },
    '&:active:not(:disabled)': { transform: 'translateY(1px)' },
  },
  variants: {
    tone: {
      primary: { bg: 'brass.base', color: 'paper.ink', bgImage: 'linear-gradient(rgba(255, 255, 255, 0.28), transparent 55%)', _hover: { bg: 'brass.light' } },
      secondary: { bg: 'paper.card', color: 'paper.ink', _hover: { bg: 'paper.bright' } },
      ghost: {
        borderColor: 'transparent',
        bg: 'transparent',
        color: 'inherit',
        boxShadow: 'none',
        _hover: { bg: 'bg.hover' },
        '&:hover:not(:disabled)': { transform: 'none' },
        '&:active:not(:disabled)': { transform: 'none' },
      },
      danger: { bg: 'rust.base', color: 'paper.card', textTransform: 'uppercase', letterSpacing: '0.06em', _hover: { bg: 'rust.hot' } },
    },
    size: {
      md: {},
      sm: { height: '30px', paddingInline: '11px', fontSize: '13px', borderWidth: '1.5px', '& svg': { width: '15px', height: '15px' } },
      lg: { height: '52px', paddingInline: '28px', fontSize: '20px', borderWidth: '2.5px', '& svg': { width: '22px', height: '22px' } },
    },
  },
  defaultVariants: { tone: 'secondary', size: 'md' },
});

// A small icon button, on the room's planks or on card stock.
export const IconButton = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: '0',
    width: '30px',
    height: '30px',
    borderRadius: '5px',
    color: 'chrome.fg',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease, color 0.12s ease',
    _hover: { bg: 'chrome.hover', color: 'chrome.fgStrong' },
    _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    _disabled: { opacity: '0.4', cursor: 'not-allowed', _hover: { bg: 'transparent', color: 'chrome.fg' } },
    '&[aria-pressed=true]': { bg: 'accent.tint', color: 'accent.text' },
    '& svg': { width: '18px', height: '18px' },
  },
  variants: {
    surface: {
      room: {},
      print: { color: 'print.muted', _hover: { bg: 'print.hover', color: 'print.ink' } },
    },
  },
  defaultVariants: { surface: 'room' },
});

// Popovers are notes on card stock, cut out like everything else.
export const PanelContent = styled(Popover.Content, {
  base: {
    zIndex: '40',
    display: 'grid',
    width: '288px',
    maxWidth: 'calc(100vw - 24px)',
    borderRadius: '6px',
    border: '2px solid',
    borderColor: 'paper.ink',
    bg: 'print.bg',
    color: 'print.ink',
    boxShadow: 'cutout',
    outline: 'none',
    '&[data-state=open]': { animation: 'dialogIn 0.15s ease-out' },
  },
  variants: {
    padded: {
      true: { gap: '16px', padding: '16px' },
      false: { paddingBlock: '8px' },
    },
  },
  defaultVariants: { padded: true },
});

export const ConfirmPopoverText = styled('div', {
  base: { display: 'grid', gap: '4px' },
});

export const ConfirmPopoverTitle = styled('p', {
  base: { fontFamily: 'display', fontSize: '16px', fontWeight: '800' },
});

export const ConfirmPopoverNote = styled('p', {
  base: { fontSize: '13px', color: 'print.muted' },
});

export const ConfirmPopoverButtons = styled('div', {
  base: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
});

// Auto-sizing inline input: the ::after copy of the text sets the width, the input sits on top.
export const NameInputSizer = styled('span', {
  base: {
    display: 'inline-grid',
    minWidth: '0',
    maxWidth: '100%',
    _after: { content: 'attr(data-value)', gridArea: '1 / 1', visibility: 'hidden', whiteSpace: 'pre', overflow: 'hidden', paddingInline: '6px', font: 'inherit' },
  },
  variants: {
    tone: {
      heading: {},
      field: { display: 'grid', width: '100%' },
    },
  },
  defaultVariants: { tone: 'heading' },
});

// A name on card stock you can write over: an ink underline until you click it.
export const NameInputField = styled('input', {
  base: {
    gridArea: '1 / 1',
    width: '100%',
    minWidth: '0',
    paddingInline: '6px',
    borderRadius: '4px',
    bg: 'transparent',
    color: 'inherit',
    font: 'inherit',
    letterSpacing: 'inherit',
    textOverflow: 'ellipsis',
    outline: 'none',
    transition: 'background-color 0.12s ease, box-shadow 0.12s ease',
    _placeholder: { color: 'print.soft' },
    _hover: { bg: 'print.hover' },
    _focus: { bg: 'paper.bright', boxShadow: 'inset 0 0 0 1.5px {colors.paper.ink}', textOverflow: 'clip' },
  },
  variants: {
    tone: {
      heading: { height: '30px', marginInlineStart: '-2px' },
      field: {
        height: '36px',
        paddingInline: '10px',
        bg: 'paper.bright',
        boxShadow: 'inset 0 0 0 1.5px {colors.paper.ink}',
        _hover: { bg: 'paper.bright' },
      },
    },
  },
  defaultVariants: { tone: 'heading' },
});

// A lobby panel as a handbill: card stock with an ink edge and a cream cut-out border.
export const GameCardRoot = styled('section', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    flexShrink: '0',
    borderRadius: '6px',
    border: '2.5px solid',
    borderColor: 'paper.ink',
    bg: 'print.bg',
    bgImage: 'radial-gradient(ellipse at 50% 0%, rgba(255, 255, 255, 0.35), transparent 60%), radial-gradient(ellipse at 50% 120%, rgba(201, 180, 138, 0.35), transparent 70%)',
    color: 'print.ink',
    boxShadow: 'cutout',
    animation: 'standUp 0.5s cubic-bezier(0.2, 0.8, 0.3, 1.1) backwards',
    transformOrigin: 'bottom center',
    _motionReduce: { animation: 'none' },
  },
});

// The handbill's head: the title in slab capitals over a thick and a thin rule.
export const GameCardHeadRoot = styled('header', {
  base: {
    display: 'grid',
    justifyItems: 'center',
    gap: '3px',
    flexShrink: '0',
    marginInline: '12px',
    paddingTop: '12px',
    paddingBottom: '9px',
    borderBottom: '3px solid',
    borderColor: 'paper.ink',
    textAlign: 'center',
    boxShadow: '0 3px 0 {colors.paper.card}, 0 4.5px 0 {colors.paper.ink}',
    '@media (max-height: 540px)': { paddingTop: '8px', paddingBottom: '6px' },
  },
});

export const GameCardTitle = styled('h2', {
  base: {
    fontFamily: 'display',
    fontSize: '19px',
    fontWeight: '900',
    lineHeight: '1.1',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    '@media (max-height: 540px)': { fontSize: '16px' },
    _before: { content: '"★ "', color: 'rust.base', fontSize: '0.7em', verticalAlign: '0.15em' },
    _after: { content: '" ★"', color: 'rust.base', fontSize: '0.7em', verticalAlign: '0.15em' },
  },
});

export const GameCardSubtitle = styled('p', {
  base: { maxWidth: '34ch', fontSize: '12.5px', fontStyle: 'italic', lineHeight: '1.35', color: 'print.muted', textWrap: 'balance' },
});

export const GameCardBody = styled('div', {
  base: { display: 'grid', alignContent: 'start', gap: '16px', minHeight: '0', overflowY: 'auto', paddingInline: '14px', paddingTop: '16px', paddingBottom: '14px' },
});
