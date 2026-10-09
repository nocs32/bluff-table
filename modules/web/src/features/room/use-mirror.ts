import type { Character, PlayerColor } from '@bluff-table/protocol';
import { useCallback, type RefCallback } from 'react';
import { figureBox, paintFigure } from '../../art';
import type { MirrorPose } from '../../stores/room/game';
import type { RoomHeadsStore } from '../../stores/room/heads';

// Pixels per unit of the sketches: sharp on a high-density screen.
const scale = 2.4;
// Your look reaches the far seats at about a third of the way round; the mirror shows it turned all
// the way, so a glance at someone reads clearly.
const turn = 2.4;
// How far you drag, as a share of the mirror's width, to turn your head all the way.
const reach = 0.3;
const steps = 50;

const clampUnit = (value: number): number => Math.max(-1, Math.min(1, value));

const quantize = (value: number): number => Math.round(value * steps) / steps;

// How far a press may move and still count as a click (for the face wheel), not a drag.
const tapSlop = 6;

// In the lobby you're just yourself.
const lobbyPose = (): MirrorPose => ({ mood: 'idle', cards: 0, gun: false, ghost: false });

export interface MirrorOptions {
  character: Character;
  color: PlayerColor;
  // Your face and what you hold, read every frame.
  pose?: () => MirrorPose;
  // A click on the mirror without dragging.
  onTap?: () => void;
}

// Draws you whenever your head moved or your face changed, every frame, until stopped.
const reflect = (canvas: HTMLCanvasElement, heads: RoomHeadsStore, { character, color, pose = lobbyPose }: MirrorOptions): (() => void) => {
  let frame = 0;
  let drawn = '';

  const draw = (): void => {
    const look = { x: quantize(clampUnit(heads.mine.x.value * turn)), y: quantize(heads.mine.y.value) };
    const now = pose();
    const key = `${look.x}|${look.y}|${now.mood}|${now.cards}|${now.gun}|${now.ghost}`;

    if (key !== drawn) {
      drawn = key;
      paintFigure(canvas, { character, color, look, ...now }, scale);
    }

    frame = requestAnimationFrame(draw);
  };

  draw();

  return () => cancelAnimationFrame(frame);
};

// Grabbing your head in the mirror and dragging it; letting go springs it back.
const grabbable = (canvas: HTMLCanvasElement, heads: RoomHeadsStore, onTap?: () => void): (() => void) => {
  let grab: { x: number; y: number } | null = null;
  let moved = false;

  const down = (event: PointerEvent): void => {
    grab = { x: event.clientX, y: event.clientY };
    moved = false;
    canvas.setPointerCapture(event.pointerId);
    heads.grab();
    event.preventDefault();
  };

  const move = (event: PointerEvent): void => {
    if (!grab) return;

    const unit = canvas.getBoundingClientRect().width * reach;

    moved ||= Math.hypot(event.clientX - grab.x, event.clientY - grab.y) > tapSlop;

    heads.drag({ x: clampUnit((event.clientX - grab.x) / unit) / turn, y: clampUnit(-(event.clientY - grab.y) / unit) });
  };

  const up = (): void => {
    if (!grab) return;

    grab = null;
    heads.release();

    if (!moved) onTap?.();
  };

  const events = { pointerdown: down, pointermove: move, pointerup: up, pointercancel: up } as const;

  Object.entries(events).forEach(([type, listener]) => canvas.addEventListener(type, listener as EventListener));

  return () => Object.entries(events).forEach(([type, listener]) => canvas.removeEventListener(type, listener as EventListener));
};

// Your mirror (spec §7.1): you, live, the way the others see you, flipped like a real mirror (you
// look left, your reflection looks left). Grab your head in it and drag to nod, shake or stare; let
// go and it springs back with a wobble. Drawn every frame it moved, outside React.
export const useRoomMirror = (heads: RoomHeadsStore, { character, color, pose, onTap }: MirrorOptions): RefCallback<HTMLCanvasElement> =>
  useCallback(
    (canvas: HTMLCanvasElement | null) => {
      if (!canvas) return undefined;

      canvas.width = Math.round(figureBox.width * scale);
      canvas.height = Math.round(figureBox.height * scale);

      const stopDrawing = reflect(canvas, heads, { character, color, pose });
      const stopGrabbing = grabbable(canvas, heads, onTap);

      return () => {
        stopDrawing();
        stopGrabbing();
      };
    },
    [heads, character, color, pose, onTap],
  );
