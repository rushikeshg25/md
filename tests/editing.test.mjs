import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatSelection } from '../lib/editing.ts';
test('formatting wraps selected content without replacing it with a placeholder', () => {
  assert.equal(formatSelection('**bold** ', 'keep me'), '**keep me**');
  assert.equal(formatSelection('[text](url) ', 'website'), '[website](url)');
});
test('block formatting applies to each selected line', () => {
  assert.equal(formatSelection('> quote ', 'one\ntwo'), '> one\n> two');
});
test('an empty selection inserts the template', () => {
  assert.equal(formatSelection('**bold** ', ''), '**bold** ');
});
