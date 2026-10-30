import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildHtmlDocument, exportFilename } from '../lib/export.ts';
test('HTML export escapes filenames in document title', () => {
  const html = buildHtmlDocument('</title><script>alert(1)</script>', '<p>Safe document</p>');
  assert.doesNotMatch(html, /<script>/);
  assert.match(html, /&lt;\/title&gt;/);
  assert.match(html, /<article><p>Safe document<\/p><\/article>/);
});
test('HTML filenames handle all accepted document extensions', () => {
  assert.equal(exportFilename('notes.MD'), 'notes.html');
  assert.equal(exportFilename('notes.markdown'), 'notes.html');
  assert.equal(exportFilename('notes'), 'notes.html');
});
