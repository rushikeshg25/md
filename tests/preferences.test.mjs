import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePreferences } from '../lib/preferences.ts';
test('invalid or stale themes fall back to system', () => {
  for (const value of [null, '{', 'null', '{"theme":"unknown"}']) assert.equal(parsePreferences(value).theme, 'system');
});
test('saved themes survive parsing', () => {
  assert.equal(parsePreferences('{"theme":"sepia"}').theme, 'sepia');
});
