import { Popover } from '@ark-ui/react/popover';
import { styled } from 'styled-system/jsx';

// The saloon's sign board along the top: dark planks, an ink edge and a brass rule under it.
export const RoomTopBarRoot = styled('header', {
  base: {
    position: 'relative',
    zIndex: '8',
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: '12px',
    paddingInline: '12px',
    bg: 'chrome.bar',
    bgImage: 'repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.3) 0 2px, transparent 2px 58px), linear-gradient({colors.night.smoke}, {colors.night.base})',
    boxShadow: 'inset 0 -2px 0 {colors.paper.ink}, inset 0 -3px 0 {colors.brass.deep}, 0 6px 16px rgba(0, 0, 0, 0.6)',
    color: 'chrome.fgStrong',
    md: { gridTemplateColumns: '1fr minmax(0, 440px) 1fr' },
  },
  variants: {
    // A phone: the brand and the buttons, no link between them.
    compact: {
      true: { gridTemplateColumns: 'auto minmax(0, 1fr)', md: { gridTemplateColumns: 'auto minmax(0, 1fr)' } },
      false: {},
    },
  },
  defaultVariants: { compact: false },
});

export const RoomTopBarStart = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: '0' },
});

// While the connection is down and the table holds your seat.
export const RoomTopBarReconnecting = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    height: '24px',
    paddingInline: '8px',
    borderRadius: '4px',
    bg: 'accent.tint',
    color: 'accent.text',
    fontSize: '12px',
    fontWeight: '700',
    whiteSpace: 'nowrap',
    '& svg': { width: '12px', height: '12px', animation: 'spin' },
    _motionReduce: { '& svg': { animation: 'none' } },
  },
});

export const RoomTopBarEnd = styled('div', {
  base: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px' },
});

// The name painted on the sign: slab capitals in cream.
export const RoomTopBarBrand = styled('div', {
  base: {
    display: 'none',
    alignItems: 'center',
    gap: '10px',
    paddingInline: '2px',
    fontFamily: 'display',
    fontSize: '16px',
    fontWeight: '900',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: 'paper.card',
    textShadow: '0 2px 0 rgba(0, 0, 0, 0.6)',
    whiteSpace: 'nowrap',
    sm: { display: 'flex' },
    '& svg': { width: '28px', height: '28px', flexShrink: '0', filter: 'drop-shadow(0 2px 0 rgba(0, 0, 0, 0.5))' },
  },
});

// The language on a little stamped tag.
export const RoomTopBarLanguage = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '34px',
    height: '28px',
    borderRadius: '4px',
    border: '1.5px solid',
    borderColor: 'paper.ink',
    bg: 'paper.card',
    color: 'paper.ink',
    fontFamily: 'display',
    fontSize: '12px',
    fontWeight: '900',
    letterSpacing: '0.04em',
    boxShadow: 'cutoutSmall',
    cursor: 'pointer',
    transition: 'transform 0.12s ease',
    _hover: { transform: 'translateY(-1px)' },
    _active: { transform: 'translateY(1px)' },
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '4px' },
  },
});

// Phones show just the icon.
export const RoomTopBarButtonLabel = styled('span', {
  base: { display: 'none', sm: { display: 'inline' } },
});

// The table's link on a paper strip pinned to the sign, with "Copy" stamped at its end.
export const RoomTopBarLinkRoot = styled('button', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    height: '30px',
    paddingLeft: '12px',
    paddingRight: '4px',
    borderRadius: '3px',
    border: '1.5px solid',
    borderColor: 'paper.ink',
    bg: 'paper.poster',
    color: 'paper.ink',
    fontSize: '13px',
    fontWeight: '600',
    boxShadow: 'cutoutSmall',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease',
    _hover: { bg: 'paper.card' },
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '4px' },
    '& svg': { width: '14px', height: '14px', flexShrink: '0', color: 'paper.muted' },
  },
});

export const RoomTopBarLinkText = styled('span', {
  base: { flex: '1', minWidth: '0', textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});

// The stamp at the strip's end: copies the link.
export const RoomTopBarLinkHint = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    flexShrink: '0',
    height: '20px',
    paddingInline: '7px',
    borderRadius: '2px',
    border: '1.5px solid',
    borderColor: 'rust.base',
    fontFamily: 'display',
    fontSize: '11px',
    fontWeight: '900',
    color: 'rust.base',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    '& svg': { width: '12px', height: '12px', color: 'rust.base' },
  },
});

export const RoomTopBarLinkHintLabel = styled('span', {
  base: { display: 'none', sm: { display: 'inline' } },
});

// The demo table's buttons, next to the brand. Desktop only: it's a tool for trying the game alone.
export const RoomTopBarDemoRoot = styled('div', {
  base: {
    display: 'none',
    alignItems: 'center',
    gap: '2px',
    marginLeft: '8px',
    paddingLeft: '4px',
    paddingRight: '2px',
    borderRadius: '5px',
    border: '1px dashed',
    borderColor: 'border.strong',
    md: { display: 'flex' },
  },
});

export const RoomTopBarDemoLabel = styled('span', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    paddingInline: '6px',
    fontSize: '11px',
    fontWeight: '800',
    color: 'chrome.fg',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    '& svg': { width: '13px', height: '13px' },
  },
});

// The speaker that opens the sound settings.
export const RoomTopBarSoundTrigger = styled(Popover.Trigger, {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '5px',
    color: 'chrome.fg',
    cursor: 'pointer',
    _hover: { bg: 'chrome.hover', color: 'chrome.fgStrong' },
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    '&[data-state=open]': { bg: 'chrome.hover', color: 'chrome.fgStrong' },
    '& svg': { width: '18px', height: '18px' },
  },
  variants: {
    muted: {
      true: { color: 'fg.subtle' },
      false: {},
    },
  },
  defaultVariants: { muted: false },
});

export const RoomTopBarSoundPanelTitle = styled('p', {
  base: { fontFamily: 'display', fontSize: '15px', fontWeight: '900', letterSpacing: '0.08em', textTransform: 'uppercase' },
});
