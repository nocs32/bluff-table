import { styled } from 'styled-system/jsx';

export const RoomChatFeedRoot = styled('div', {
  base: { flex: '1', minHeight: '0', overflowY: 'auto', paddingBlock: '8px', overscrollBehavior: 'contain', scrollbarWidth: 'thin', scrollbarColor: '{colors.paper.line} transparent' },
});

export const RoomChatFeedMessageRoot = styled('article', {
  base: {
    display: 'grid',
    gridTemplateColumns: '36px minmax(0, 1fr)',
    columnGap: '8px',
    paddingInline: '8px',
    paddingBlock: '2px',
    _hover: { bg: 'print.hover' },
  },
  variants: {
    startsGroup: {
      true: { paddingTop: '8px' },
      false: {},
    },
  },
  defaultVariants: { startsGroup: true },
});

export const RoomChatFeedGutter = styled('div', {
  base: { display: 'flex', justifyContent: 'center', paddingTop: '4px' },
});

export const RoomChatFeedMeta = styled('div', {
  base: { display: 'flex', alignItems: 'baseline', gap: '8px' },
});

export const RoomChatFeedAuthor = styled('span', {
  base: { fontFamily: 'display', fontSize: '15px', fontWeight: '800' },
});

export const RoomChatFeedTime = styled('time', {
  base: { fontSize: '12px', color: 'print.soft', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' },
});

export const RoomChatFeedText = styled('p', {
  base: { fontSize: '15px', lineHeight: '1.47', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' },
});

export const RoomChatFeedSystemRoot = styled('div', {
  base: {
    display: 'grid',
    gridTemplateColumns: '36px minmax(0, 1fr) auto',
    columnGap: '8px',
    alignItems: 'center',
    paddingInline: '8px',
    paddingBlock: '6px',
    fontSize: '13px',
    fontStyle: 'italic',
    color: 'print.muted',
  },
});

export const RoomChatFeedSystemName = styled('span', {
  base: { fontStyle: 'normal', fontWeight: '700', color: 'print.ink' },
});
