import { Popover } from '@ark-ui/react/popover';
import { EmojiPicker } from 'frimousse';
import { styled } from 'styled-system/jsx';

// The saloon's floorboards along the bottom: an ink edge and a brass rule, the reactions as a row of
// little cards cut out like the scene's, then the chat.
export const RoomDockRoot = styled('footer', {
  base: {
    position: 'relative',
    zIndex: '7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '14px',
    minHeight: '62px',
    '@media (max-height: 540px)': { minHeight: '50px', gap: '10px' },
    paddingInline: '10px',
    paddingBottom: 'env(safe-area-inset-bottom)',
    bg: 'chrome.bar',
    bgImage: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.3) 0 2px, transparent 2px 20px), linear-gradient({colors.night.smoke}, {colors.night.base})',
    boxShadow: 'inset 0 2px 0 {colors.paper.ink}, inset 0 3px 0 {colors.brass.deep}, 0 -6px 18px rgba(0, 0, 0, 0.5)',
  },
  variants: {
    // On a phone held sideways height is scarce: the rail stands up along the left edge instead.
    rail: {
      true: {
        position: 'absolute',
        top: '0',
        bottom: '0',
        left: '0',
        flexDirection: 'column',
        gap: '10px',
        width: '58px',
        minHeight: '0',
        paddingInline: '0',
        paddingBlock: '8px',
        paddingLeft: 'env(safe-area-inset-left)',
        bgImage: 'repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.3) 0 2px, transparent 2px 20px), linear-gradient(90deg, {colors.night.smoke}, {colors.night.base})',
        boxShadow: 'inset -2px 0 0 {colors.paper.ink}, inset -3px 0 0 {colors.brass.deep}, 6px 0 18px rgba(0, 0, 0, 0.5)',
        overflowY: 'auto',
        scrollbarWidth: 'none',
        '@media (max-height: 540px)': { minHeight: '0', gap: '8px' },
      },
      false: {},
    },
  },
  defaultVariants: { rail: false },
});

export const RoomDockChips = styled('div', {
  base: { display: 'flex', alignItems: 'center', gap: '10px' },
  variants: {
    // Standing up, the rail has room for four quick emoji.
    rail: {
      true: { flexDirection: 'column', gap: '10px', '& > button:nth-child(n+5):not(:last-child)': { display: 'none' } },
      false: {},
    },
  },
  defaultVariants: { rail: false },
});

// A count of what came in while the chat was closed: a small red stamp.
export const RoomDockBadge = styled('span', {
  base: {
    position: 'absolute',
    top: '-9px',
    right: '-9px',
    display: 'grid',
    placeItems: 'center',
    minWidth: '22px',
    height: '22px',
    paddingInline: '5px',
    borderRadius: '4px',
    bg: 'rust.base',
    border: '1.5px solid',
    borderColor: 'paper.ink',
    color: 'paper.card',
    fontFamily: 'display',
    fontSize: '11px',
    fontWeight: '900',
    animation: 'pop 0.35s ease-out',
  },
});

// Phones show just the icon.
export const RoomDockChatLabel = styled('span', {
  base: { display: 'none', sm: { display: 'inline' } },
});

export const RoomDockChatButton = styled('span', {
  base: { position: 'relative', display: 'inline-flex' },
});

// Each quick reaction is a little card cut out of card stock, the emoji printed on it.
export const RoomDockEmoji = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
    borderRadius: '5px',
    border: '1.5px solid',
    borderColor: 'paper.ink',
    bg: 'paper.card',
    boxShadow: 'cutoutSmall',
    fontFamily: 'emoji',
    fontSize: '19px',
    lineHeight: '1',
    cursor: 'pointer',
    userSelect: 'none',
    touchAction: 'manipulation',
    transition: 'transform 0.12s ease',
    _hover: { transform: 'translateY(-3px)' },
    _active: { transform: 'translateY(1px)' },
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '4px' },
    // Phones show four quick emoji, on smaller cards.
    '&:nth-child(n+5)': { display: 'none', sm: { display: 'inline-flex' } },
    '@media (max-height: 540px)': { width: '34px', height: '34px', fontSize: '16px' },
  },
});

// More emoji: an empty, dashed spot where a card would go.
export const RoomDockButton = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: '0',
    width: '38px',
    height: '38px',
    borderRadius: '5px',
    border: '2px dashed',
    borderColor: 'border.strong',
    color: 'chrome.fg',
    cursor: 'pointer',
    transition: 'color 0.12s ease, border-color 0.12s ease',
    _hover: { color: 'chrome.fgStrong', borderColor: 'brass.light' },
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
    '&[aria-pressed=true], &[data-state=open]': { color: 'accent.text', borderColor: 'accent.default', borderStyle: 'solid' },
    '& svg': { width: '20px', height: '20px' },
    '@media (max-height: 540px)': { width: '34px', height: '34px' },
  },
});

export const RoomDockPopover = styled(Popover.Content, {
  base: {
    zIndex: '40',
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
      true: { display: 'grid', gap: '10px', width: '260px', padding: '14px' },
      false: {},
    },
  },
  defaultVariants: { padded: false },
});

export const RoomDockPickerRoot = styled(EmojiPicker.Root, {
  base: { display: 'flex', flexDirection: 'column', width: '348px', maxWidth: 'calc(100vw - 24px)', height: '380px' },
});

export const RoomDockPickerSearch = styled(EmojiPicker.Search, {
  base: {
    flexShrink: '0',
    height: '34px',
    margin: '10px',
    marginBottom: '6px',
    paddingInline: '10px',
    borderRadius: '4px',
    bg: 'paper.bright',
    boxShadow: 'inset 0 0 0 1.5px {colors.paper.ink}',
    fontSize: '14px',
    outline: 'none',
    _placeholder: { color: 'print.soft' },
    _focus: { boxShadow: 'inset 0 0 0 2px {colors.paper.ink}, 0 0 0 3px {colors.accent.ring}' },
  },
});

// Frimousse renders the list itself; its parts are styled through their attributes.
export const RoomDockPickerViewport = styled(EmojiPicker.Viewport, {
  base: {
    position: 'relative',
    flex: '1',
    minHeight: '0',
    outline: 'none',
    overscrollBehavior: 'contain',
    '& [frimousse-list]': { paddingBottom: '6px' },
    '& [frimousse-category-header]': {
      paddingInline: '12px',
      paddingTop: '8px',
      paddingBottom: '4px',
      bg: 'print.bg',
      color: 'print.muted',
      fontFamily: 'display',
      fontSize: '12px',
      fontWeight: '800',
    },
    '& [frimousse-row]': { paddingInline: '8px' },
    '& [frimousse-emoji]': {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '36px',
      height: '36px',
      borderRadius: '8px',
      fontFamily: 'emoji',
      fontSize: '22px',
      cursor: 'pointer',
      '&[data-active]': { bg: 'print.hover' },
    },
  },
});

export const RoomDockPickerLoading = styled(EmojiPicker.Loading, {
  base: { position: 'absolute', inset: '0', display: 'grid', placeItems: 'center', fontSize: '13px', color: 'print.muted' },
});

export const RoomDockPickerEmpty = styled(EmojiPicker.Empty, {
  base: { position: 'absolute', inset: '0', display: 'grid', placeItems: 'center', fontSize: '13px', color: 'print.muted' },
});

export const RoomDockPickerFooter = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: '0',
    height: '44px',
    paddingInline: '12px',
    borderTop: '2px solid',
    borderColor: 'paper.ink',
    fontSize: '13px',
    color: 'print.muted',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

export const RoomDockPickerActive = styled('span', {
  base: { fontFamily: 'emoji', fontSize: '22px', lineHeight: '1' },
});
