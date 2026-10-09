import { styled } from 'styled-system/jsx';

// The floating chat: a ledger on card stock with an ink edge, cut out like the rest, and an ink strip
// along the top to drag it by. Position and size come from CSS variables set by useRoomChatWidget.
export const RoomChatWidgetRoot = styled('section', {
  base: {
    position: 'absolute',
    top: '0',
    left: '0',
    zIndex: '5',
    display: 'flex',
    flexDirection: 'column',
    width: 'var(--widget-width)',
    height: 'var(--widget-height)',
    borderRadius: '6px',
    border: '2.5px solid',
    borderColor: 'paper.ink',
    overflow: 'hidden',
    bg: 'print.bg',
    color: 'print.ink',
    boxShadow: 'cutout',
    transform: 'translate3d(var(--widget-x), var(--widget-y), 0)',
    animation: 'fadeIn 0.15s ease-out',
    '&:hover [data-widget-resize], &:focus-within [data-widget-resize]': { opacity: '1' },
  },
  variants: {
    gesture: {
      idle: {},
      pressed: {},
      moving: { boxShadow: '0 0 0 4px {colors.paper.card}, 0 0 0 5.5px rgba(43, 33, 24, 0.35), 0 28px 60px rgba(0, 0, 0, 0.85)', userSelect: 'none', '& [data-widget-move]': { cursor: 'grabbing' } },
      resizing: { userSelect: 'none', cursor: 'nwse-resize' },
    },
  },
});

// The bottom-right grip. Shows on hover (always on touch screens).
export const RoomChatWidgetResize = styled('div', {
  base: {
    position: 'absolute',
    right: '0',
    bottom: '0',
    zIndex: '1',
    width: '20px',
    height: '20px',
    cursor: 'nwse-resize',
    touchAction: 'none',
    opacity: '0',
    transition: 'opacity 0.12s ease',
    '@media (hover: none)': { opacity: '1' },
    _after: {
      content: '""',
      position: 'absolute',
      right: '5px',
      bottom: '5px',
      width: '9px',
      height: '9px',
      borderRight: '2px solid',
      borderBottom: '2px solid',
      borderColor: 'print.soft',
      borderBottomRightRadius: '3px',
    },
  },
});

// "Too fast: send it again in a moment."
export const RoomChatComposerNote = styled('p', {
  base: { marginInline: '12px', marginBottom: '6px', fontSize: '12px', fontWeight: '700', color: 'rust.base' },
});

// The drag handle: an ink strip with the title in cream slab capitals.
export const RoomChatHeader = styled('header', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    height: '40px',
    flexShrink: '0',
    paddingLeft: '14px',
    paddingRight: '6px',
    bg: 'paper.ink',
    color: 'paper.card',
    cursor: 'grab',
    userSelect: 'none',
    touchAction: 'none',
    '& button': { color: 'paper.stain', _hover: { bg: 'chrome.hover', color: 'paper.card' } },
  },
});

export const RoomChatTitle = styled('h2', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontFamily: 'display',
    fontSize: '13px',
    fontWeight: '900',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    '& svg': { width: '16px', height: '16px', color: 'brass.light' },
  },
});

// Type at the bottom, in a field set into the panel, and send it.
export const RoomChatComposerRoot = styled('form', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    flexShrink: '0',
    margin: '10px',
    marginTop: '4px',
    paddingLeft: '12px',
    paddingRight: '4px',
    borderRadius: '4px',
    bg: 'paper.bright',
    boxShadow: 'inset 0 0 0 1.5px {colors.paper.ink}',
    _focusWithin: { boxShadow: 'inset 0 0 0 2px {colors.paper.ink}, 0 0 0 3px {colors.accent.ring}' },
  },
});

export const RoomChatComposerInput = styled('input', {
  base: {
    flex: '1',
    minWidth: '0',
    height: '38px',
    bg: 'transparent',
    fontSize: '15px',
    outline: 'none',
    _placeholder: { color: 'print.soft' },
  },
});

export const RoomChatComposerSend = styled('button', {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '30px',
    borderRadius: '4px',
    color: 'print.soft',
    cursor: 'pointer',
    transition: 'background-color 0.12s ease, color 0.12s ease',
    _disabled: { cursor: 'default', opacity: '0.5' },
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '1px' },
    '& svg': { width: '16px', height: '16px', strokeWidth: '2.5' },
  },
  variants: {
    ready: {
      true: { bg: 'brass.base', color: 'paper.ink', boxShadow: 'inset 0 0 0 1.5px {colors.paper.ink}', _hover: { bg: 'brass.light' } },
      false: {},
    },
  },
  defaultVariants: { ready: false },
});
