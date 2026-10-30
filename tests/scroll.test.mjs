import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scrollFraction } from '../lib/scroll.ts';
test('short documents never produce NaN or Infinity', () => {
  assert.equal(scrollFraction(0, 100, 100), 0);
  assert.equal(scrollFraction(0, 50, 100), 0);
});
test('scroll sync clamps overscroll and preserves progress', () => {
  assert.equal(scrollFraction(50, 200, 100), 0.5);
  assert.equal(scrollFraction(-10, 200, 100), 0);
  assert.equal(scrollFraction(110, 200, 100), 1);
});
