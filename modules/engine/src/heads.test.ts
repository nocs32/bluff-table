import { describe, expect, it } from 'vitest';
import { angleOfLook, lookAtMember, lookOnTable, tableLayout } from './heads.js';

const table = ['ann', 'bo', 'cy', 'di'];

describe('tableLayout', () => {
  it('puts you at the near edge and the others across, in the order they sat down', () => {
    const layout = tableLayout(table, 'bo');

    expect(layout.get('bo')).toBe(0);
    expect([layout.get('cy'), layout.get('di'), layout.get('ann')]).toEqual([112, 180, 248]);
  });

  it('seats a lone other player straight across', () => {
    expect(tableLayout(['ann', 'bo'], 'ann').get('bo')).toBe(180);
  });

  it('seats everyone across for someone not at the table', () => {
    const layout = tableLayout(table, 'zed');

    expect(layout.has('zed')).toBe(false);
    expect(layout.size).toBe(4);
  });
});

describe('looks', () => {
  it('points a head at the person it looks at, on every screen', () => {
    const x = lookAtMember(table, 'ann', 'cy');

    expect(lookOnTable(table, 'ann', x, 'ann')).toBeCloseTo(tableLayout(table, 'ann').get('cy') ?? -1);
    expect(lookOnTable(table, 'ann', x, 'bo')).toBeCloseTo(tableLayout(table, 'bo').get('cy') ?? -1);
    expect(lookOnTable(table, 'ann', x, 'di')).toBeCloseTo(tableLayout(table, 'di').get('cy') ?? -1);
  });

  it('looks straight at you when someone looks at you', () => {
    const x = lookAtMember(table, 'cy', 'ann');

    expect(lookOnTable(table, 'cy', x, 'ann') % 360).toBeCloseTo(0);
  });

  it('keeps a look between two people between the same two people elsewhere', () => {
    const between = (tableLayout(table, 'ann').get('bo')! + tableLayout(table, 'ann').get('cy')!) / 2;
    const x = (between - 180) / 180;
    const seen = lookOnTable(table, 'ann', x, 'di');
    const layout = tableLayout(table, 'di');

    expect(seen).toBeGreaterThan(layout.get('bo')!);
    expect(seen).toBeLessThan(layout.get('cy')! + 360);
  });

  it('maps a look to an angle and back', () => {
    expect(angleOfLook(0)).toBe(180);
    expect(angleOfLook(-1)).toBe(0);
    expect(angleOfLook(2)).toBe(360);
  });
});
