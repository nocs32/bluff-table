import { styled } from 'styled-system/jsx';

export const RoomRoot = styled('div', {
  base: {
    display: 'grid',
    gridTemplateRows: '52px minmax(0, 1fr) auto',
    height: '100dvh',
    // A phone held sideways: every pixel of height counts.
    '@media (max-height: 540px)': { gridTemplateRows: '44px minmax(0, 1fr) auto' },
    '&:has([data-rail])': { gridTemplateRows: '52px minmax(0, 1fr)', '@media (max-height: 540px)': { gridTemplateRows: '44px minmax(0, 1fr)' } },
    bg: 'chrome.app',
    color: 'fg.default',
  },
});

// The saloon around the card table: the table is drawn into it, and the lobby, the chat and the
// flying emoji float over it. Measured, so the chat stays inside.
export const RoomMain = styled('main', {
  base: {
    position: 'relative',
    minHeight: '0',
    overflow: 'hidden',
    bg: 'night.deep',
    bgImage: 'radial-gradient(ellipse 46% 52% at 50% 46%, rgba(255, 210, 122, 0.12), transparent 70%), radial-gradient(ellipse 80% 70% at 50% 50%, {colors.night.base}, {colors.night.deep})',
  },
});

// Instead of the table, while it opens or when there's none to show.
export const RoomStatusRoot = styled('main', {
  base: {
    display: 'grid',
    placeItems: 'center',
    minHeight: '100dvh',
    padding: '24px',
    bg: 'night.deep',
    bgImage: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(255, 210, 122, 0.14), transparent 70%), repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.25) 0 3px, transparent 3px 58px)',
    color: 'fg.default',
  },
});

// A handbill in the lamplight, like the lobby's cards.
export const RoomStatusCard = styled('section', {
  base: {
    display: 'grid',
    justifyItems: 'center',
    gap: '12px',
    width: '100%',
    maxWidth: '400px',
    padding: '28px',
    borderRadius: '6px',
    border: '2.5px solid',
    borderColor: 'paper.ink',
    bg: 'print.bg',
    color: 'print.ink',
    boxShadow: 'cutout',
    textAlign: 'center',
    animation: 'dialogIn 0.25s ease-out',
  },
});

export const RoomStatusLogo = styled('span', {
  base: { display: 'inline-flex', marginBottom: '4px', '& svg': { width: '44px', height: '44px' } },
});

export const RoomStatusTitle = styled('h1', {
  base: { fontFamily: 'display', fontSize: '22px', fontWeight: '900', letterSpacing: '0.02em' },
});

export const RoomStatusText = styled('p', {
  base: { marginBottom: '8px', fontSize: '15px', color: 'print.muted', textWrap: 'balance' },
});

export const RoomStatusSpinner = styled('span', {
  base: {
    display: 'inline-flex',
    color: 'rust.base',
    '& svg': { width: '22px', height: '22px', animation: 'spin' },
    _motionReduce: { '& svg': { animation: 'none' } },
  },
});

export const RoomFlightsRoot = styled('div', {
  base: { position: 'absolute', inset: '0', zIndex: '6', overflow: 'hidden', pointerEvents: 'none', containerType: 'size' },
});

export const RoomFlightsRise = styled('div', {
  base: {
    position: 'absolute',
    bottom: '12px',
    animation: 'emojiRise 3s cubic-bezier(0.2, 0.6, 0.3, 1) forwards',
    willChange: 'transform, opacity',
    _motionReduce: { animation: 'emojiPop 1.6s ease-out forwards' },
  },
  variants: {
    lane: {
      l1: { left: '14%' },
      l2: { left: '23%' },
      l3: { left: '32%' },
      l4: { left: '41%' },
      l5: { left: '50%' },
      l6: { left: '59%' },
      l7: { left: '68%' },
      l8: { left: '77%' },
      l9: { left: '86%' },
    },
  },
});

export const RoomFlightsSway = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontFamily: 'emoji',
    fontSize: '40px',
    lineHeight: '1',
    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.25))',
    _motionReduce: { animation: 'none' },
    // A phone held sideways has little height to spare.
    '@media (max-height: 540px)': { fontSize: '28px' },
  },
  variants: {
    sway: {
      gentle: { animation: 'swayGentle 1.4s ease-in-out infinite alternate' },
      wide: { animation: 'swayWide 1.1s ease-in-out infinite alternate' },
      wobbly: { animation: 'swayWobbly 0.7s ease-in-out infinite alternate' },
    },
  },
});

export const RoomFlightsName = styled('span', {
  base: { marginTop: '4px', paddingInline: '6px', borderRadius: '3px', border: '1.5px solid', borderColor: 'paper.ink', bg: 'paper.card', color: 'paper.ink', fontFamily: 'body', fontSize: '11px', fontWeight: '700' },
});

// A phone held upright: the game asks to be turned sideways (spec D29, §9.5). Only CSS decides
// when it shows.
export const RoomRotateRoot = styled('div', {
  base: {
    position: 'fixed',
    inset: '0',
    zIndex: '100',
    display: 'none',
    placeItems: 'center',
    padding: '28px',
    bg: 'night.deep',
    bgImage: 'radial-gradient(ellipse 70% 50% at 50% 45%, rgba(255, 210, 122, 0.16), transparent 70%)',
    textAlign: 'center',
    '@media (orientation: portrait) and (pointer: coarse) and (max-width: 600px)': { display: 'grid' },
  },
});

export const RoomRotateCard = styled('div', {
  base: { display: 'grid', justifyItems: 'center', gap: '12px', maxWidth: '320px', '& svg': { width: '64px', height: '64px', color: 'brass.base' } },
});

export const RoomRotateTitle = styled('h1', {
  base: { fontFamily: 'display', fontSize: '22px', fontWeight: '900', color: 'paper.card' },
});

export const RoomRotateText = styled('p', {
  base: { fontSize: '15px', color: 'fg.muted', textWrap: 'balance' },
});

// Your mirror (spec §7.1): an oval of old glass in a wooden frame, cut out of card, with a brass
// plate under it.
export const RoomMirrorRoot = styled('div', {
  base: { display: 'grid', justifyItems: 'center', gap: '6px', flexShrink: '0' },
  variants: {
    size: {
      sm: { '--mirror': '104px', '@media (max-height: 540px)': { '--mirror': '74px' } },
      md: { '--mirror': '112px' },
      lg: { '--mirror': '150px', '@media (max-height: 540px)': { '--mirror': '112px' } },
    },
  },
  defaultVariants: { size: 'lg' },
});

export const RoomMirrorFrame = styled('div', {
  base: {
    width: 'var(--mirror)',
    aspectRatio: '150 / 176',
    padding: '7px',
    borderRadius: '50%',
    bg: 'plank.door',
    bgImage: 'radial-gradient(ellipse at 30% 20%, rgba(255, 255, 255, 0.18), transparent 55%)',
    border: '2.5px solid',
    borderColor: 'paper.ink',
    boxShadow: 'cutoutSmall',
  },
});

// The glass, with you drawn on it. Grab your head here and drag it.
export const RoomMirrorGlass = styled('canvas', {
  base: {
    display: 'block',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: '2px solid',
    borderColor: 'paper.ink',
    bg: 'mirror.glass',
    bgImage: 'linear-gradient(135deg, rgba(255, 255, 255, 0.16), transparent 30%), radial-gradient(ellipse at 50% 40%, {colors.mirror.glass}, {colors.mirror.deep})',
    objectFit: 'cover',
    objectPosition: '50% 30%',
    cursor: 'grab',
    touchAction: 'none',
  },
  variants: {
    grabbed: {
      true: { cursor: 'grabbing' },
      false: {},
    },
  },
  defaultVariants: { grabbed: false },
});

export const RoomMirrorPlate = styled('span', {
  base: {
    paddingInline: '12px',
    paddingBlock: '1px',
    borderRadius: '3px',
    border: '1.5px solid',
    borderColor: 'paper.ink',
    bg: 'brass.base',
    bgImage: 'linear-gradient(rgba(255, 255, 255, 0.3), transparent 60%)',
    color: 'paper.ink',
    fontFamily: 'display',
    fontSize: '11px',
    fontWeight: '900',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
});
