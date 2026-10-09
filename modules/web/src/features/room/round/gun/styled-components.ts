import { styled } from 'styled-system/jsx';

// Your gun (spec §8.4): your cylinder with the odds, why it's you, and a big red Pull the trigger
// inside a brass ring that runs down over ten seconds.
export const RoomRoundGunRoot = styled('section', {
  base: {
    gridColumn: '2 / -1',
    display: 'grid',
    gridTemplateColumns: 'auto minmax(0, 1fr) auto',
    alignItems: 'center',
    gap: '18px',
    justifySelf: 'center',
    maxWidth: '640px',
    paddingInline: '18px',
    paddingBlock: '14px',
    borderRadius: '6px',
    border: '2.5px solid',
    borderColor: 'rust.deep',
    bg: 'print.bg',
    color: 'print.ink',
    boxShadow: 'cutout',
    pointerEvents: 'auto',
    animation: 'dialogIn 0.3s ease-out',
    '@media (max-height: 540px)': { gap: '10px', paddingInline: '10px', paddingBlock: '7px' },
  },
});

export const RoomRoundGunCylinder = styled('img', {
  base: { width: '72px', '@media (max-height: 540px)': { width: '46px' } },
});

export const RoomRoundGunText = styled('div', {
  base: { display: 'grid', gap: '4px', minWidth: '0' },
});

export const RoomRoundGunTitle = styled('h2', {
  base: { fontFamily: 'display', fontSize: '19px', fontWeight: '900', '@media (max-height: 540px)': { fontSize: '14px' } },
});

export const RoomRoundGunLine = styled('p', {
  base: { fontSize: '13.5px', lineHeight: '1.4', color: 'print.muted', '@media (max-height: 540px)': { fontSize: '11.5px', lineHeight: '1.25' } },
});

export const RoomRoundGunPress = styled('div', {
  base: { position: 'relative', display: 'grid', placeItems: 'center', width: '132px', height: '132px', '@media (max-height: 540px)': { width: '92px', height: '92px' } },
});

// The ring: brass, running down as the seconds go.
export const RoomRoundGunRingSvg = styled('svg', {
  base: {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    transform: 'rotate(-90deg)',
    '& circle': { fill: 'none', strokeWidth: '6' },
    '& circle:first-of-type': { stroke: 'rgba(43, 33, 24, 0.15)' },
    '& circle:last-of-type': { stroke: 'brass.base', strokeLinecap: 'round', strokeDasharray: '283', strokeDashoffset: 'calc(283px * var(--spent, 0))', transition: 'stroke-dashoffset 0.25s linear' },
  },
});

export const RoomRoundGunButton = styled('button', {
  base: {
    display: 'grid',
    placeItems: 'center',
    width: '104px',
    height: '104px',
    borderRadius: 'full',
    border: '3px solid',
    borderColor: 'paper.ink',
    bg: 'rust.base',
    bgImage: 'radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.28), transparent 55%)',
    color: 'paper.card',
    fontFamily: 'display',
    fontSize: '14px',
    fontWeight: '900',
    lineHeight: '1.1',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    boxShadow: 'cutoutSmall',
    cursor: 'pointer',
    animation: 'throb 1.1s ease-in-out infinite',
    _hover: { bg: 'rust.hot' },
    _disabled: { animation: 'none', opacity: '0.7', cursor: 'default' },
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '4px' },
    '@media (max-height: 540px)': { width: '72px', height: '72px', fontSize: '10.5px' },
  },
});

export const RoomRoundGunSeconds = styled('span', {
  base: { position: 'absolute', bottom: '-6px', right: '-4px', minWidth: '30px', paddingInline: '6px', borderRadius: 'full', border: '2px solid', borderColor: 'paper.ink', bg: 'paper.card', fontFamily: 'display', fontSize: '15px', fontWeight: '900', textAlign: 'center', fontVariantNumeric: 'tabular-nums' },
});
