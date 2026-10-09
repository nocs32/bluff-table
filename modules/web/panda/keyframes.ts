import { defineKeyframes } from '@pandacss/dev';

export const keyframes = defineKeyframes({
  emojiRise: {
    '0%': { transform: 'translate(-50%, 0) scale(0.5)', opacity: '0' },
    '8%': { transform: 'translate(-50%, -28px) scale(1)', opacity: '1' },
    '70%': { opacity: '1' },
    '100%': { transform: 'translate(-50%, calc(-100cqh + 160px)) scale(1.3)', opacity: '0' },
  },
  emojiPop: {
    '0%': { transform: 'translate(-50%, 0) scale(0.6)', opacity: '0' },
    '20%': { transform: 'translate(-50%, -24px) scale(1)', opacity: '1' },
    '100%': { transform: 'translate(-50%, -24px) scale(1)', opacity: '0' },
  },
  swayGentle: {
    from: { transform: 'translateX(-8px) rotate(-5deg)' },
    to: { transform: 'translateX(8px) rotate(5deg)' },
  },
  swayWide: {
    from: { transform: 'translateX(-18px) rotate(-8deg)' },
    to: { transform: 'translateX(18px) rotate(8deg)' },
  },
  swayWobbly: {
    from: { transform: 'translateX(-10px) rotate(-12deg)' },
    to: { transform: 'translateX(10px) rotate(12deg)' },
  },
  // A count that just changed.
  pop: {
    '0%': { transform: 'scale(1)' },
    '40%': { transform: 'scale(1.3)' },
    '100%': { transform: 'scale(1)' },
  },
  // A cut-out folds up off the table, like the pieces of a pop-up stage, and stands straight.
  standUp: {
    from: { transform: 'perspective(900px) rotateX(-70deg)', opacity: '0' },
    to: { transform: 'perspective(900px) rotateX(0)', opacity: '1' },
  },
  fadeIn: {
    from: { opacity: '0' },
    to: { opacity: '1' },
  },
  dialogIn: {
    from: { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
    to: { opacity: '1', transform: 'translateY(0) scale(1)' },
  },
  // A bang (spec §8.4): the lights go out for a split second, then flicker back on.
  blackout: {
    '0%, 22%': { opacity: '1' },
    '30%': { opacity: '0.35' },
    '36%': { opacity: '0.85' },
    '46%, 100%': { opacity: '0' },
  },
  // The comic-book BAM! bursting out of the dark, then gone.
  bam: {
    '0%, 18%': { transform: 'scale(0.2)', opacity: '0' },
    '26%': { transform: 'scale(1.18)', opacity: '1' },
    '34%': { transform: 'scale(0.96)', opacity: '1' },
    '40%, 78%': { transform: 'scale(1)', opacity: '1' },
    '100%': { transform: 'scale(1.08)', opacity: '0' },
  },
  // The screen reddens while Liar! ×2 is held (spec §5.9).
  redden: {
    from: { opacity: '0' },
    to: { opacity: '1' },
  },
  // Filling up over the second you hold Liar! ×2.
  holdFill: {
    from: { transform: 'scaleX(0)' },
    to: { transform: 'scaleX(1)' },
  },
  // A card dealt into your hand.
  cardIn: {
    from: { opacity: '0', transform: 'translateY(40px)' },
    to: { opacity: '1', transform: 'translateY(0)' },
  },
  // The pull's button, breathing while it waits.
  throb: {
    '0%, 100%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.04)' },
  },
});
