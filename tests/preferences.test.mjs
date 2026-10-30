import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsePreferences, THEMES, isDarkTheme } from '../lib/preferences.ts';
test('invalid or stale themes fall back to system', () => {
  for (const value of [null, '{', 'null', '{"theme":"unknown"}']) assert.equal(parsePreferences(value).theme, 'system');
});
test('saved themes survive parsing', () => {
  for (const theme of THEMES) assert.equal(parsePreferences(JSON.stringify({ theme })).theme, theme);
});
test('dark palettes select dark syntax and diagram rendering', () => {
  for (const theme of ['dark', 'midnight', 'github-dark', 'nord']) assert.equal(isDarkTheme(theme), true);
  for (const theme of ['light', 'sepia', 'github-light']) assert.equal(isDarkTheme(theme), false);
});
