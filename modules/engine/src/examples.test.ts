import { expect, test } from 'vitest';
import { callVerdict, ruleBookExamples } from './examples.js';

test('the rule book’s calls come out as the rules say', () => {
  expect(ruleBookExamples.calls.map(callVerdict).map((verdict) => verdict.puller)).toEqual(['caller', 'player', 'caller', 'player']);
  expect(ruleBookExamples.crook.map(callVerdict).map((verdict) => verdict.puller)).toEqual(['caller', 'player']);
});
