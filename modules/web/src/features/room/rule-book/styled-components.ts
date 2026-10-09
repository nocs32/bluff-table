import { Dialog } from '@ark-ui/react/dialog';
import { styled } from 'styled-system/jsx';

// The rule book (spec §9.4): a saloon handbill, printed in ink on cream card stock, with a slab
// masthead between double rules, brass index tabs down the side, and red stamps for TRUE and LIE.
// On a phone it fills the screen.

export const RoomRuleBookBackdrop = styled(Dialog.Backdrop, {
  base: { position: 'fixed', inset: '0', zIndex: '50', bg: 'rgba(13, 9, 7, 0.7)', backdropFilter: 'blur(2px)', '&[data-state=open]': { animation: 'fadeIn 0.2s ease-out' } },
});

export const RoomRuleBookPositioner = styled(Dialog.Positioner, {
  base: { position: 'fixed', inset: '0', zIndex: '51', display: 'grid', placeItems: 'center', '@media (min-width: 640px) and (min-height: 541px)': { padding: '20px' } },
});

export const RoomRuleBookContent = styled(Dialog.Content, {
  base: {
    display: 'grid',
    gridTemplateRows: 'auto minmax(0, 1fr)',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    bg: 'print.bg',
    color: 'print.ink',
    outline: 'none',
    '&[data-state=open]': { animation: 'dialogIn 0.25s ease-out' },
    '@media (min-width: 640px) and (min-height: 541px)': { maxWidth: '940px', height: 'min(720px, 100%)', borderRadius: '6px', border: '2.5px solid', borderColor: 'paper.ink', boxShadow: 'cutout' },
  },
});

// The masthead: the title in slab capitals between double rules.
export const RoomRuleBookHead = styled('header', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    minHeight: '62px',
    paddingInline: '18px',
    borderBottom: '4px double',
    borderColor: 'paper.ink',
    '@media (max-height: 540px)': { minHeight: '48px' },
  },
});

export const RoomRuleBookTitle = styled(Dialog.Title, {
  base: { flex: '1', minWidth: '0', fontFamily: 'display', fontSize: '26px', fontWeight: '900', letterSpacing: '0.04em', textTransform: 'uppercase', '@media (max-height: 540px)': { fontSize: '19px' } },
});

export const RoomRuleBookStar = styled('span', {
  base: { color: 'rust.base', fontSize: '18px' },
});

// Tabs down the side, numbers only on a narrow screen, and the page beside them.
export const RoomRuleBookBody = styled('div', {
  base: { display: 'grid', gridTemplateColumns: '58px minmax(0, 1fr)', minHeight: '0', md: { gridTemplateColumns: '200px minmax(0, 1fr)' } },
});

export const RoomRuleBookTabsRoot = styled('nav', {
  base: { display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto', paddingBlock: '12px', paddingInline: '8px', borderRight: '2px solid', borderColor: 'paper.line', scrollbarWidth: 'none', md: { paddingInline: '12px' } },
});

export const RoomRuleBookTab = styled('button', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: '0',
    height: '38px',
    paddingInline: '7px',
    borderRadius: '4px',
    border: '1.5px solid transparent',
    fontFamily: 'display',
    fontSize: '14px',
    fontWeight: '800',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    color: 'print.muted',
    cursor: 'pointer',
    _hover: { bg: 'print.hover', color: 'print.ink' },
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring' },
    '&[aria-current=page]': { bg: 'print.raised', borderColor: 'paper.ink', color: 'print.ink', boxShadow: 'inset 4px 0 0 {colors.brass.base}' },
  },
});

export const RoomRuleBookTabNumber = styled('span', {
  base: { display: 'grid', placeItems: 'center', flexShrink: '0', width: '24px', height: '24px', borderRadius: 'full', border: '1.5px solid', borderColor: 'paper.ink', bg: 'brass.base', color: 'paper.ink', fontSize: '12px', fontWeight: '900' },
});

export const RoomRuleBookTabLabel = styled('span', {
  base: { display: 'none', md: { display: 'inline' } },
});

export const RoomRuleBookScroll = styled('div', {
  base: { display: 'grid', alignContent: 'start', minHeight: '0', overflowY: 'auto', overscrollBehavior: 'contain', paddingInline: '18px', paddingTop: '18px', paddingBottom: '40vh', md: { paddingInline: '34px' } },
});

// A section, with a printed rule under it.
export const RoomRuleBookSectionRoot = styled('section', {
  base: { display: 'grid', alignContent: 'start', gap: '12px', paddingBottom: '28px', marginBottom: '26px', borderBottom: '3px double', borderColor: 'paper.line', scrollMarginTop: '12px', _last: { borderBottom: 'none' } },
});

export const RoomRuleBookHeading = styled('h3', {
  base: { display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'display', fontSize: '24px', fontWeight: '900', lineHeight: '1.15' },
});

export const RoomRuleBookLead = styled('p', {
  base: { fontSize: '17px', fontWeight: '700', lineHeight: '1.4', maxWidth: '62ch', textWrap: 'pretty' },
});

export const RoomRuleBookText = styled('p', {
  base: { fontSize: '15px', lineHeight: '1.55', maxWidth: '64ch', textWrap: 'pretty' },
});

export const RoomRuleBookCards = styled('ul', {
  base: { display: 'flex', flexWrap: 'wrap', gap: '12px', '& img': { width: '66px', borderRadius: '5px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)' } },
});

export const RoomRuleBookCard = styled('li', {
  base: { display: 'grid', justifyItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700' },
});

// A worked example: the play's cards, what it claimed, and the stamp.
export const RoomRuleBookExample = styled('li', {
  base: { display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', alignItems: 'center', gap: '14px', paddingBlock: '8px', borderBottom: '1px dashed', borderColor: 'paper.line', _last: { borderBottom: 'none' } },
});

export const RoomRuleBookExampleCards = styled('span', {
  base: { display: 'flex', gap: '4px', '& img': { width: '40px', borderRadius: '3px' } },
});

export const RoomRuleBookExampleText = styled('span', {
  base: { display: 'grid', gap: '4px', fontSize: '14px', lineHeight: '1.4' },
});

export const RoomRuleBookStamp = styled('span', {
  base: { justifySelf: 'start', paddingInline: '8px', paddingBlock: '1px', borderRadius: '3px', border: '2px solid', fontFamily: 'display', fontSize: '13px', fontWeight: '900', letterSpacing: '0.08em', textTransform: 'uppercase' },
  variants: {
    lie: {
      true: { borderColor: 'rust.base', color: 'rust.base' },
      false: { borderColor: 'felt.light', color: 'felt.light' },
    },
  },
});

export const RoomRuleBookList = styled('ul', {
  base: { display: 'grid', gap: '2px', fontSize: '15px', fontVariantNumeric: 'tabular-nums', '& li::before': { content: '"★ "', color: 'rust.base' } },
});

// Try it: a hand, the table card to pick, and the engine's verdict.
export const RoomRuleBookTry = styled('div', {
  base: { display: 'grid', gap: '10px', padding: '14px', borderRadius: '5px', border: '2px solid', borderColor: 'paper.ink', bg: 'print.raised', boxShadow: 'inset 5px 0 0 {colors.brass.base}' },
});

export const RoomRuleBookTryRow = styled('div', {
  base: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' },
});

export const RoomRuleBookTryCard = styled('button', {
  base: {
    width: '56px',
    padding: '0',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'transform 0.15s ease',
    '& img': { display: 'block', width: '100%', borderRadius: '5px' },
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
    '&[aria-pressed=true]': { transform: 'translateY(-10px)', boxShadow: '0 0 0 3px {colors.brass.base}' },
  },
});

export const RoomRuleBookVerdict = styled('p', {
  base: { fontWeight: '700', fontSize: '15px' },
  variants: {
    lie: {
      true: { color: 'rust.deep' },
      false: { color: 'felt.deep' },
      none: { color: 'print.muted', fontStyle: 'italic', fontWeight: '500' },
    },
  },
});
