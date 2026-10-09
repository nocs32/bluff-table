import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import type { ReactElement } from 'react';

// The glow (spec §10.2): only things brighter than white bloom, so the lamp's bulb glows and the
// rest stays crisp. A vignette keeps the room's corners dark.
export function RoomTableEffects(): ReactElement {
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur luminanceThreshold={1.15} luminanceSmoothing={0.1} intensity={0.85} radius={0.7} />
      <Vignette offset={0.3} darkness={0.5} />
    </EffectComposer>
  );
}
