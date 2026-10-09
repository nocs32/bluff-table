import { lookAtAngle, seatSlots } from '@bluff-table/engine';
import { useThree } from '@react-three/fiber';
import { autorun } from 'mobx';
import { useEffect } from 'react';
import { Vector3, type Camera } from 'three';
import type { Look, RoomHeadsStore } from '../../../stores/room/heads';
import type { TableStore } from '../../../stores/table';
import { headHeight, seatPoint, stage } from './layout';

// Where each place's head is, to tell where on screen your pointer points.
const heads = seatSlots.map((angle) => {
  const seat = seatPoint(angle);

  return { angle, point: new Vector3(seat.x, stage.bust.bottom + headHeight, seat.z) };
});

// How far up the screen from the heads' row a look counts as all the way up (or down).
const upReach = 0.6;

const clampUnit = (value: number): number => Math.max(-1, Math.min(1, value));

// Your pointer is where you look (spec §7.1): left and right picks the place round the table (the
// heads on screen line up with their places, so pointing at someone looks at them), up is the
// lamp and down your cards.
const lookAt = (camera: Camera, x: number, y: number): Look => {
  const marks = heads.map(({ angle, point }) => ({ angle, screen: point.clone().project(camera) })).sort((one, other) => one.screen.x - other.screen.x);
  const first = marks[0];
  const last = marks[marks.length - 1];

  if (!first || !last) return { x: 0, y: 0 };

  const right = marks.findIndex((mark) => mark.screen.x >= x);
  const from = marks[Math.max(0, Math.min(marks.length - 2, right - 1))] ?? first;
  const to = marks[Math.max(1, Math.min(marks.length - 1, right < 0 ? marks.length - 1 : right))] ?? last;
  const angle = from.angle + ((to.angle - from.angle) * (x - from.screen.x)) / (to.screen.x - from.screen.x || 1);
  const row = marks.find((mark) => mark.angle === 180)?.screen.y ?? 0;

  return { x: lookAtAngle(Math.max(20, Math.min(340, angle))), y: clampUnit((y - row) / upReach) };
};

// The arrow keys nudge your head (spec §7.1).
const nudges: Record<string, Look> = { ArrowLeft: { x: -0.3, y: 0 }, ArrowRight: { x: 0.3, y: 0 }, ArrowUp: { x: 0, y: 0.8 }, ArrowDown: { x: 0, y: -0.9 } };

const isTyping = (target: EventTarget | null): boolean => target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

// The pointer on the stage, outside React: it turns your head, and the cursor and tooltip follow
// what it's over. The arrow keys nudge your head too.
export const useRoomTablePointer = (table: TableStore, store: RoomHeadsStore): void => {
  const { gl, camera } = useThree();

  useEffect(() => autorun(() => {
    gl.domElement.style.cursor = table.cursor;
    gl.domElement.title = table.hint;
  }), [gl, table]);

  useEffect(() => {
    const element = gl.domElement;

    const move = (event: PointerEvent): void => {
      const box = element.getBoundingClientRect();

      store.point(lookAt(camera, ((event.clientX - box.left) / box.width) * 2 - 1, 1 - ((event.clientY - box.top) / box.height) * 2));
    };

    const press = (event: KeyboardEvent): void => {
      const nudge = nudges[event.key];

      if (!nudge || isTyping(event.target)) return;

      event.preventDefault();
      store.nudge(nudge);
    };

    const lift = (event: KeyboardEvent): void => {
      if (nudges[event.key]) store.unnudge();
    };

    element.addEventListener('pointermove', move);
    element.addEventListener('pointerleave', store.rest);
    window.addEventListener('keydown', press);
    window.addEventListener('keyup', lift);

    return () => {
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerleave', store.rest);
      window.removeEventListener('keydown', press);
      window.removeEventListener('keyup', lift);
    };
  }, [gl, camera, store]);
};
