import { defineTokens } from '@pandacss/dev';

// The saloon at night (spec §8): a cardboard stage, every piece an ink drawing on cream card stock,
// lit by one oil lamp. Two families of surfaces, used the same way everywhere:
// - the room itself (the top bar, the dock, the chat): dark planks in the shadow past the lamp,
//   with brass trim and lamplit lettering;
// - printed matter (the lobby's cards, popovers, the status card, the tent cards): cream card stock
//   cut out like the scene's pieces, with an ink edge, slab lettering and a red stamp for danger.
// The scene's drawings take their colours from here too (`src/art/palette.ts`).
export const tokens = defineTokens({
  fonts: {
    body: { value: '"Rubik Variable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif' },
    // Posters, headings and buttons ("WANTED", "Liar!"): a heavy slab that covers Cyrillic (spec §8.6).
    display: { value: '"Roboto Slab Variable", "Roboto Slab", Rockwell, Georgia, serif' },
    mono: { value: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace' },
    emoji: { value: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif' },
  },
  colors: {
    // The saloon past the lamp's light, from the darkest corner to the planks at its edge.
    night: {
      deep: { value: '#0D0907' },
      base: { value: '#150F0B' },
      shade: { value: '#1D1510' },
      smoke: { value: '#271C14' },
      haze: { value: '#33251A' },
    },
    // The saloon's plank walls and floor, and the doors' lighter wood.
    plank: {
      dark: { value: '#2C1C11' },
      base: { value: '#3D2819' },
      light: { value: '#5A3A24' },
      door: { value: '#6B4226' },
      groove: { value: '#1F140C' },
    },
    // Cream card stock, the aged paper of the posters, and the ink they're drawn in.
    paper: {
      card: { value: '#F3E6C8' },
      bright: { value: '#FAF1DC' },
      poster: { value: '#E9D7AB' },
      stain: { value: '#D9C391' },
      line: { value: '#C9B48A' },
      ink: { value: '#2B2118' },
      muted: { value: '#6B5A45' },
      soft: { value: '#9A8668' },
    },
    brass: {
      deep: { value: '#7A5C26' },
      base: { value: '#C9A052' },
      light: { value: '#E3C37F' },
    },
    // The red stamp ("Liar!", danger) and the red ink of the Queens and Kings.
    rust: {
      deep: { value: '#8A2A22' },
      base: { value: '#B8392F' },
      hot: { value: '#D8402F' },
      ink: { value: '#9A2F28' },
    },
    felt: {
      dark: { value: '#183420' },
      deep: { value: '#244A29' },
      base: { value: '#2F5A34' },
      light: { value: '#3F6B3A' },
    },
    // The oil lamp's flame and the warm pool it throws.
    lamp: {
      flame: { value: '#FFE9A8' },
      glow: { value: '#FFD27A' },
      warm: { value: '#F2B45C' },
    },
    // The revolver: blued steel, the cylinder, its chambers and a walnut grip.
    steel: {
      base: { value: '#4A4F57' },
      cylinder: { value: '#5B616A' },
      chamber: { value: '#9AA0A8' },
      hole: { value: '#15100C' },
      grip: { value: '#7A4A2A' },
    },
    // Your mirror's old glass.
    mirror: {
      glass: { value: '#33424A' },
      deep: { value: '#1E2A31' },
    },
    // Outside the swinging doors.
    sky: {
      night: { value: '#1C2633' },
      moon: { value: '#E9E1C2' },
    },
    // One colour per seat, dyed into a hat or its band (spec §8.3).
    player: {
      red: { value: '#C8423A' },
      green: { value: '#4E8A3E' },
      blue: { value: '#3A64A0' },
      purple: { value: '#7E4C9E' },
      gold: { value: '#D2A23A' },
      teal: { value: '#2F8380' },
    },
    // The people's own colours: coats, hair, hats, and the odd detail (spec §8.3, from the sketches).
    coat: {
      tan: { value: '#6B4A33' },
      moss: { value: '#3D4A3A' },
      navy: { value: '#2F3D55' },
      slate: { value: '#4A4A52' },
      wine: { value: '#5A2A32' },
      umber: { value: '#5B4630' },
    },
    hair: {
      chestnut: { value: '#5A3A22' },
      auburn: { value: '#A0522D' },
      brown: { value: '#7A4F2C' },
      black: { value: '#2E2420' },
      grey: { value: '#8C7A6A' },
    },
    figure: {
      shirt: { value: '#EFE6D2' },
      stetson: { value: '#B88A55' },
      fedora: { value: '#3A3634' },
      rope: { value: '#C8A46A' },
      straw: { value: '#E6C25A' },
      scar: { value: '#B5675A' },
      sweat: { value: '#9FD8FF' },
      tongue: { value: '#E7798C' },
      pale: { value: '#E2D8C4' },
      apron: { value: '#F6EEDB' },
      back: { value: '#7A2F2A' },
    },
    // A ghost (spec D17): the same drawing in pale blue.
    ghost: {
      ink: { value: '#6F879C' },
      light: { value: '#EEF4F9' },
      base: { value: '#D3E2EE' },
      mid: { value: '#B8CDDD' },
    },
    // The bottles behind the bar.
    bottle: {
      green: { value: '#2F5A34' },
      amber: { value: '#6B3A1F' },
      blue: { value: '#3A4F6B' },
      honey: { value: '#7A5A2A' },
      wine: { value: '#5A2A32' },
    },
    status: {
      online: { value: '#6FBF5A' },
    },
  },
});
