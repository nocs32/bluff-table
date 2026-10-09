import { Slider } from '@ark-ui/react/slider';
import { Switch } from '@ark-ui/react/switch';
import { styled } from 'styled-system/jsx';

// A setting's label, value and hint: the same on the room's panels and on printed cards.
export const SettingHead = styled('div', {
  base: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' },
});

export const SettingLabel = styled('label', {
  base: { fontFamily: 'display', fontSize: '15px', fontWeight: '800', '@media (max-height: 540px)': { fontSize: '15px' } },
});

export const SettingValue = styled('span', {
  base: { fontFamily: 'display', fontSize: '15px', fontWeight: '800', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' },
  variants: {
    surface: {
      room: { color: 'accent.text' },
      print: { color: 'rust.deep' },
    },
  },
});

export const SettingHint = styled('span', {
  base: { fontSize: '12.5px', lineHeight: '1.4', '@media (max-height: 540px)': { fontSize: '13.5px' } },
  variants: {
    surface: {
      room: { color: 'fg.subtle' },
      print: { color: 'print.muted' },
    },
  },
});

export const SettingSliderRoot = styled(Slider.Root, {
  base: { display: 'grid', gap: '8px', '&[data-disabled]': { opacity: '0.5' } },
});

export const SettingSliderControl = styled(Slider.Control, {
  base: { position: 'relative', display: 'flex', alignItems: 'center', height: '24px' },
});

// An inked rule with ticks under it, like a printed scale.
export const SettingSliderTrack = styled(Slider.Track, {
  base: {
    flex: '1',
    height: '6px',
    borderRadius: '3px',
    overflow: 'hidden',
    border: '1.5px solid',
  },
  variants: {
    surface: {
      room: { bg: 'night.deep', borderColor: 'border.strong' },
      print: { bg: 'paper.poster', borderColor: 'paper.ink' },
    },
  },
});

export const SettingSliderRange = styled(Slider.Range, {
  base: { height: '100%', bg: 'rust.base' },
});

// The handle: a revolver's cylinder seen end on, six chambers round the pin.
export const SettingSliderThumb = styled(Slider.Thumb, {
  base: {
    width: '24px',
    height: '24px',
    borderRadius: 'full',
    bg: 'steel.cylinder',
    bgImage: 'radial-gradient(circle at 50% 50%, {colors.paper.ink} 0 2px, transparent 2.5px), radial-gradient(circle at 50% 22%, {colors.steel.hole} 0 2.6px, transparent 3px), radial-gradient(circle at 74% 36%, {colors.steel.hole} 0 2.6px, transparent 3px), radial-gradient(circle at 74% 64%, {colors.steel.hole} 0 2.6px, transparent 3px), radial-gradient(circle at 50% 78%, {colors.steel.hole} 0 2.6px, transparent 3px), radial-gradient(circle at 26% 64%, {colors.steel.hole} 0 2.6px, transparent 3px), radial-gradient(circle at 26% 36%, {colors.steel.hole} 0 2.6px, transparent 3px)',
    border: '2px solid',
    borderColor: 'paper.ink',
    boxShadow: '0 0 0 2px {colors.paper.card}, 0 2px 6px rgba(0, 0, 0, 0.35)',
    cursor: 'grab',
    transition: 'transform 0.2s cubic-bezier(0.3, 1.4, 0.5, 1)',
    _hover: { transform: 'scale(1.08)' },
    _active: { cursor: 'grabbing', transform: 'scale(1.12) rotate(60deg)' },
    _focusVisible: { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '3px' },
  },
});

export const SettingSwitchRoot = styled(Switch.Root, {
  base: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', cursor: 'pointer', '&[data-disabled]': { cursor: 'not-allowed', opacity: '0.55' } },
});

export const SettingSwitchText = styled('span', {
  base: { display: 'grid', gap: '2px', minWidth: '0' },
});

// Ark's own label part: the switch is already a <label>, and labels can't nest.
export const SettingSwitchLabel = styled(Switch.Label, {
  base: { fontFamily: 'display', fontSize: '15px', fontWeight: '800' },
});

// A toggle inked on the card: a felt-green slot when it's on.
export const SettingSwitchControl = styled(Switch.Control, {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    flexShrink: '0',
    width: '44px',
    height: '24px',
    padding: '2px',
    borderRadius: 'full',
    border: '2px solid',
    transition: 'background-color 0.15s ease',
    '&[data-state=checked]': { bg: 'felt.light' },
    '&[data-focus-visible]': { outline: '3px solid', outlineColor: 'accent.ring', outlineOffset: '2px' },
  },
  variants: {
    surface: {
      room: { bg: 'night.deep', borderColor: 'border.strong' },
      print: { bg: 'paper.poster', borderColor: 'paper.ink' },
    },
  },
});

export const SettingSwitchThumb = styled(Switch.Thumb, {
  base: {
    width: '16px',
    height: '16px',
    borderRadius: 'full',
    bg: 'paper.ink',
    transition: 'transform 0.15s cubic-bezier(0.3, 1.4, 0.5, 1), background-color 0.15s ease',
    '&[data-state=checked]': { transform: 'translateX(20px)', bg: 'paper.card', boxShadow: '0 0 0 1.5px {colors.paper.ink}' },
  },
});
