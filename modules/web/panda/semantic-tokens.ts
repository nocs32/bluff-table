import { defineSemanticTokens } from '@pandacss/dev';

// Dark only. Names say what a colour is for; values come from tokens.ts.
export const semanticTokens = defineSemanticTokens({
  colors: {
    // The room's own surfaces: planks in the dark, brass trim, lamplit lettering.
    chrome: {
      app: { value: '{colors.night.deep}' },
      bar: { value: '{colors.night.base}' },
      fg: { value: '#DCCBA8' },
      fgStrong: { value: '{colors.paper.card}' },
      hover: { value: 'rgba(243, 230, 200, 0.08)' },
      border: { value: 'rgba(201, 160, 82, 0.2)' },
      field: { value: '{colors.night.deep}' },
    },
    bg: {
      surface: { value: '{colors.night.shade}' },
      subtle: { value: '{colors.night.smoke}' },
      muted: { value: '{colors.night.haze}' },
      hover: { value: 'rgba(243, 230, 200, 0.07)' },
      overlay: { value: 'rgba(8, 5, 3, 0.8)' },
    },
    fg: {
      default: { value: '#EFE2C4' },
      muted: { value: '#BFAE8F' },
      subtle: { value: '#8C7A60' },
    },
    border: {
      subtle: { value: 'rgba(201, 160, 82, 0.12)' },
      default: { value: 'rgba(201, 160, 82, 0.24)' },
      strong: { value: 'rgba(201, 160, 82, 0.4)' },
    },
    // Printed matter's own: card stock, ink, rules.
    print: {
      bg: { value: '{colors.paper.card}' },
      raised: { value: '{colors.paper.bright}' },
      sunk: { value: '{colors.paper.poster}' },
      ink: { value: '{colors.paper.ink}' },
      muted: { value: '{colors.paper.muted}' },
      soft: { value: '{colors.paper.soft}' },
      rule: { value: '{colors.paper.line}' },
      hover: { value: 'rgba(43, 33, 24, 0.07)' },
    },
    accent: {
      default: { value: '{colors.brass.base}' },
      text: { value: '{colors.brass.light}' },
      tint: { value: 'rgba(201, 160, 82, 0.16)' },
      // Keyboard focus: the lamp's glow, which shows on the dark planks and on card stock alike.
      ring: { value: '#F0A63A' },
    },
    danger: { value: '{colors.rust.base}' },
    presence: { online: { value: '{colors.status.online}' } },
  },
  shadows: {
    floating: { value: '0 0 0 1px rgba(201, 160, 82, 0.18), 0 10px 28px rgba(0, 0, 0, 0.65)' },
    // A piece cut out of card, like the scene's (spec §8.1): a thin cream border round its ink edge,
    // a faint line where the card was cut, and a soft shadow on what's behind.
    cutout: { value: '0 0 0 4px {colors.paper.card}, 0 0 0 5.5px rgba(43, 33, 24, 0.35), 0 18px 34px -10px rgba(0, 0, 0, 0.8), 0 4px 10px rgba(0, 0, 0, 0.4)' },
    // The same, smaller, for the room's chips and buttons.
    cutoutSmall: { value: '0 0 0 2.5px {colors.paper.card}, 0 0 0 3.5px rgba(43, 33, 24, 0.35), 0 4px 10px rgba(0, 0, 0, 0.45)' },
  },
});
