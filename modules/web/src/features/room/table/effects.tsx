import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import type { ReactElement } from 'react';

// The glow (spec §10.2): only things brighter than white bloom, so the lamp's flame glows and the
// rest stays crisp; and a heavy vignette closes the room in round the table, as in the sketches.
export function RoomTableEffects(): ReactElement {
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur luminanceThreshold={1.1} luminanceSmoothing={0.12} intensity={1} radius={0.7} />
      <Vignette offset={0.25} darkness={0.62} />
    </EffectComposer>
  );
}
