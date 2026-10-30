import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { loadFromLocalStorage, saveToLocalStorage, CONTENT_KEY, FILENAME_KEY } from '../lib/storage.ts';
let data;
beforeEach(() => {
  data = new Map();
  globalThis.localStorage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
});
test('preserves an empty draft and filename', () => {
  assert.equal(saveToLocalStorage('', 'empty.md'), true);
  assert.deepEqual(loadFromLocalStorage(), { content: '', filename: 'empty.md' });
});
test('reads existing legacy drafts', () => {
  data.set(CONTENT_KEY, 'legacy'); data.set(FILENAME_KEY, 'old.md');
  assert.deepEqual(loadFromLocalStorage(), { content: 'legacy', filename: 'old.md' });
});
test('reports failed persistence instead of claiming success', () => {
  localStorage.setItem = () => { throw new Error('quota'); };
  assert.equal(saveToLocalStorage('draft', 'test.md'), false);
});
