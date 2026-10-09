import { useThree } from '@react-three/fiber';
import { autorun } from 'mobx';
import { useEffect } from 'react';
import type { TableStore } from '../../../stores/table';

// The pointer on the table, outside React: the cursor and tooltip follow what it's over.
export const useRoomTablePointer = (table: TableStore): void => {
  const { gl } = useThree();

  useEffect(
    () =>
      autorun(() => {
        gl.domElement.style.cursor = table.cursor;
        gl.domElement.title = table.hint;
      }),
    [gl, table],
  );
};
