import { styled } from 'styled-system/jsx';

// A round over the saloon (spec §9.2): the prompt and the whisper at the top left, the captions in
// the middle, a ghost's sight at the right; your mirror, your cards and the buttons along the
// bottom. Only the cards and the controls take clicks: the rest goes through to the stage, so your
// head follows the pointer.
export const RoomRoundRoot = styled('div', {
  base: { position: 'absolute', inset: '0', zIndex: '2', pointerEvents: 'none' },
});

export const RoomRoundTop = styled('div', {
  base: {
    position: 'absolute',
    top: '14px',
    left: '16px',
    right: '16px',
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 400px) minmax(0, 1fr) minmax(0, 300px)',
    alignItems: 'start',
    gap: '16px',
    '@media (max-height: 540px)': { top: '8px', left: '68px', right: '10px', gridTemplateColumns: 'minmax(0, 330px) minmax(0, 1fr) minmax(0, 240px)', gap: '10px' },
  },
});

export const RoomRoundColumn = styled('div', {
  base: { display: 'grid', alignContent: 'start', gap: '10px', minWidth: '0', '& > *': { pointerEvents: 'auto' } },
  variants: {
    side: {
      left: { justifyItems: 'start' },
      middle: { justifyItems: 'center' },
      right: { justifyItems: 'end' },
    },
  },
});

export const RoomRoundBottom = styled('div', {
  base: {
    position: 'absolute',
    bottom: '12px',
    left: '16px',
    right: '16px',
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
    alignItems: 'end',
    gap: '16px',
    '@media (max-height: 540px)': { bottom: '6px', left: '68px', right: '10px', gap: '8px' },
  },
});

// A printed handbill: the prompt, the whisper, a ghost's sight.
export const RoomRoundBill = styled('section', {
  base: {
    display: 'grid',
    gap: '4px',
    maxWidth: '100%',
    paddingInline: '14px',
    paddingBlock: '10px',
    borderRadius: '5px',
    border: '2px solid',
    borderColor: 'paper.ink',
    bg: 'print.bg',
    color: 'print.ink',
    boxShadow: 'cutoutSmall',
    animation: 'dialogIn 0.25s ease-out',
    '@media (max-height: 540px)': { paddingInline: '10px', paddingBlock: '6px', gap: '2px' },
  },
  variants: {
    tone: {
      plain: {},
      // The whisper: a crooked house is stamped in red, a straight one edged in brass.
      crooked: { borderColor: 'rust.deep', boxShadow: 'inset 5px 0 0 {colors.rust.base}, {shadows.cutoutSmall}' },
      straight: { boxShadow: 'inset 5px 0 0 {colors.brass.base}, {shadows.cutoutSmall}' },
    },
  },
  defaultVariants: { tone: 'plain' },
});

export const RoomRoundBillTitle = styled('h2', {
  base: { fontFamily: 'display', fontSize: '16px', fontWeight: '800', lineHeight: '1.25', textWrap: 'balance', '@media (max-height: 540px)': { fontSize: '13.5px' } },
});

export const RoomRoundBillText = styled('p', {
  base: { fontSize: '13px', lineHeight: '1.4', color: 'print.muted', textWrap: 'pretty', '@media (max-height: 540px)': { fontSize: '11.5px', lineHeight: '1.3' } },
});

// The prompt's head: the table card, always on show (spec D22), beside what's going on.
export const RoomRoundPromptHead = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '12px' },
});

export const RoomRoundPromptCard = styled('figure', {
  base: { display: 'grid', justifyItems: 'center', gap: '2px', flexShrink: '0', cursor: 'help', '& img': { width: '38px', borderRadius: '3px', '@media (max-height: 540px)': { width: '28px' } } },
});

export const RoomRoundPromptCardLabel = styled('figcaption', {
  base: { fontSize: '9px', fontWeight: '800', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'print.muted', whiteSpace: 'nowrap' },
});

export const RoomRoundPromptText = styled('div', {
  base: { display: 'grid', gap: '3px', minWidth: '0' },
});

export const RoomRoundPromptTime = styled('span', {
  base: { fontSize: '12px', fontWeight: '700', color: 'rust.deep', fontVariantNumeric: 'tabular-nums' },
});

// "What just happened": cream on a dark strip, like the lobby's prompt; big news in the display face.
export const RoomRoundCaption = styled('p', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    maxWidth: '520px',
    paddingInline: '14px',
    paddingBlock: '6px',
    borderRadius: '4px',
    bg: 'rgba(13, 9, 7, 0.82)',
    boxShadow: 'inset 0 0 0 1px {colors.border.default}',
    color: 'accent.text',
    fontSize: '14px',
    fontWeight: '600',
    textAlign: 'center',
    textWrap: 'balance',
    animation: 'dialogIn 0.25s ease-out',
    '@media (max-height: 540px)': { fontSize: '12px', paddingBlock: '3px' },
  },
  variants: {
    loud: {
      true: { fontFamily: 'display', fontSize: '17px', fontWeight: '800', color: 'paper.bright', '@media (max-height: 540px)': { fontSize: '13.5px' } },
      false: {},
    },
  },
  defaultVariants: { loud: false },
});

export const RoomRoundCaptionMore = styled('button', {
  base: { flexShrink: '0', fontSize: '12px', fontWeight: '700', color: 'brass.light', textDecoration: 'underline', cursor: 'pointer', _hover: { color: 'paper.bright' }, _focusVisible: { outline: '2px solid', outlineColor: 'accent.ring' } },
});

// A ghost's sight: every living player's hand, face up.
export const RoomRoundGhostHands = styled('ul', {
  base: { display: 'grid', gap: '6px', marginTop: '4px' },
});

export const RoomRoundGhostHand = styled('li', {
  base: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' },
});

export const RoomRoundGhostName = styled('span', {
  base: { fontFamily: 'display', fontSize: '12.5px', fontWeight: '800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
});

export const RoomRoundGhostCards = styled('span', {
  base: { display: 'flex', gap: '3px', flexShrink: '0', '& img': { width: '22px', borderRadius: '2px' } },
});

// Your mirror and the face wheel over it.
export const RoomRoundMirrorBox = styled('div', {
  base: { position: 'relative', gridColumn: '1', display: 'grid', justifyItems: 'center', pointerEvents: 'auto' },
});

export const RoomRoundFaces = styled('div', {
  base: {
    position: 'absolute',
    bottom: 'calc(100% + 8px)',
    left: '0',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, auto)',
    gap: '6px',
    padding: '8px',
    borderRadius: '6px',
    border: '2px solid',
    borderColor: 'paper.ink',
    bg: 'print.bg',
    boxShadow: 'cutoutSmall',
    animation: 'dialogIn 0.18s ease-out',
  },
});

// While someone has the gun out on you, the room closes in (spec §8.4): a heavy vignette.
export const RoomRoundCloseIn = styled('div', {
  base: { position: 'absolute', inset: '0', bgImage: 'radial-gradient(ellipse 55% 60% at 50% 45%, transparent 30%, rgba(0, 0, 0, 0.82))', animation: 'fadeIn 0.8s ease-out', pointerEvents: 'none' },
});

// Holding Liar! ×2: the screen reddens.
export const RoomRoundRedden = styled('div', {
  base: { position: 'absolute', inset: '0', bgImage: 'radial-gradient(ellipse at 50% 50%, rgba(184, 57, 47, 0.12), rgba(138, 42, 34, 0.55))', animation: 'redden 1s linear forwards', pointerEvents: 'none' },
});

// A bang (spec §8.4): the lights out for a split second, then the comic-book BAM! out of the dark.
export const RoomRoundBamRoot = styled('div', {
  base: { position: 'absolute', inset: '0', zIndex: '5', display: 'grid', placeItems: 'center', pointerEvents: 'none' },
});

export const RoomRoundBamDark = styled('div', {
  base: { position: 'absolute', inset: '0', bg: 'black', animation: 'blackout 1.3s ease-out forwards' },
});

export const RoomRoundBamBurst = styled('div', {
  base: {
    position: 'relative',
    display: 'grid',
    placeItems: 'center',
    width: 'min(62vh, 520px)',
    aspectRatio: '1',
    animation: 'bam 1.9s ease-out forwards',
    filter: 'drop-shadow(0 0 0 {colors.paper.ink}) drop-shadow(6px 8px 0 rgba(0, 0, 0, 0.55))',
    _before: {
      content: '""',
      position: 'absolute',
      inset: '0',
      bg: 'paper.ink',
      clipPath: 'polygon(50% 0%, 59% 22%, 79% 6%, 74% 30%, 98% 26%, 80% 45%, 100% 58%, 76% 64%, 88% 88%, 63% 76%, 54% 100%, 44% 78%, 22% 94%, 28% 70%, 2% 74%, 20% 54%, 0% 40%, 24% 34%, 12% 10%, 37% 22%)',
    },
    _after: {
      content: '""',
      position: 'absolute',
      inset: '14px',
      bg: 'lamp.flame',
      bgImage: 'radial-gradient(circle, {colors.paper.bright} 0 18%, transparent 55%), radial-gradient(circle, rgba(184, 57, 47, 0.35) 0 1.6px, transparent 2px)',
      bgSize: '100% 100%, 9px 9px',
      clipPath: 'polygon(50% 0%, 59% 22%, 79% 6%, 74% 30%, 98% 26%, 80% 45%, 100% 58%, 76% 64%, 88% 88%, 63% 76%, 54% 100%, 44% 78%, 22% 94%, 28% 70%, 2% 74%, 20% 54%, 0% 40%, 24% 34%, 12% 10%, 37% 22%)',
    },
  },
});

export const RoomRoundBamWord = styled('span', {
  base: {
    position: 'relative',
    zIndex: '1',
    fontFamily: 'display',
    fontSize: 'min(17vh, 150px)',
    fontWeight: '900',
    lineHeight: '1',
    color: 'rust.hot',
    WebkitTextStroke: '9px {colors.paper.ink}',
    paintOrder: 'stroke fill',
    textShadow: '7px 7px 0 {colors.paper.ink}',
    letterSpacing: '0.02em',
  },
});

// The end of a game (spec §4.4): a handbill over the table, the winner's name big and their new
// bounty stamped in red.
export const RoomRoundOverRoot = styled('div', {
  base: { position: 'absolute', inset: '0', zIndex: '3', display: 'grid', placeItems: 'center', padding: '16px', bg: 'rgba(13, 9, 7, 0.45)', pointerEvents: 'auto', animation: 'fadeIn 0.5s ease-out' },
});

export const RoomRoundOverCard = styled('section', {
  base: {
    display: 'grid',
    justifyItems: 'center',
    gap: '10px',
    width: '100%',
    maxWidth: '440px',
    maxHeight: '100%',
    overflowY: 'auto',
    padding: '24px',
    borderRadius: '6px',
    border: '2.5px solid',
    borderColor: 'paper.ink',
    bg: 'print.bg',
    color: 'print.ink',
    boxShadow: 'cutout',
    textAlign: 'center',
    animation: 'dialogIn 0.35s ease-out',
    '@media (max-height: 540px)': { padding: '12px', gap: '6px' },
  },
});

export const RoomRoundOverTitle = styled('h2', {
  base: { fontFamily: 'display', fontSize: '30px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.03em', '@media (max-height: 540px)': { fontSize: '20px' } },
});

export const RoomRoundOverBounty = styled('p', {
  base: { fontFamily: 'display', fontSize: '16px', fontWeight: '900', color: 'rust.deep' },
});

export const RoomRoundOverLines = styled('ul', {
  base: { display: 'grid', gap: '3px', fontSize: '13px', color: 'print.muted', '@media (max-height: 540px)': { fontSize: '11.5px' } },
});

export const RoomRoundOverButtons = styled('div', {
  base: { display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', marginTop: '6px' },
});

export const RoomRoundFaceButton = styled('button', {
  base: { paddingInline: '10px', paddingBlock: '5px', borderRadius: '4px', border: '1.5px solid', borderColor: 'paper.line', bg: 'print.raised', fontFamily: 'display', fontSize: '13px', fontWeight: '800', color: 'print.ink', cursor: 'pointer', whiteSpace: 'nowrap', _hover: { bg: 'print.hover', borderColor: 'paper.ink' }, _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring' } },
});
