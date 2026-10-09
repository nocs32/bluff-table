import { Canvas } from '@react-three/fiber';
import { observer } from 'mobx-react-lite';
import type { ReactElement } from 'react';
import { useRootStore } from '../../../stores/use-root-store';
import { RoomTableScene } from './scene';
import { RoomTableRoot } from './styled-components';

// The 3D stage under everything (spec D4, D5, §8): React Three Fiber draws it, and the lobby, the
// chat and the flying emoji float over it as HTML. Lighter graphics draw it at one pixel per pixel.
export const RoomTable = observer(function RoomTable(): ReactElement {
  const { locale, graphics } = useRootStore();

  return (
    <RoomTableRoot aria-label={locale.t('table.label')}>
      <Canvas
        shadows="soft"
        dpr={graphics.isLight ? 1 : [1, 2]}
        camera={{ fov: 34, near: 0.1, far: 40, position: [0, 2, 6] }}
        // In development the last frame is kept, so the stage can be captured from the console.
        gl={{ antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: import.meta.env.DEV }}
      >
        <RoomTableScene />
      </Canvas>
    </RoomTableRoot>
  );
});
