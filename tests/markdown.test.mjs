import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import { markdownPlugins } from '../lib/markdown.ts';
import { DEFAULT_EXTENSIONS, parsePreferences } from '../lib/preferences.ts';
const render = (text, extensions = DEFAULT_EXTENSIONS) => renderToStaticMarkup(React.createElement(ReactMarkdown, markdownPlugins(extensions), text));
test('GFM tables, tasks and footnotes render', () => {
  const html = render('| A | B |\n| - | - |\n| 1 | 2 |\n\n- [x] Done\n\nText[^a]\n\n[^a]: Footnote');
  assert.match(html, /<table>/); assert.match(html, /type="checkbox"/); assert.match(html, /data-footnotes/);
});
test('extensions can be disabled independently', () => {
  assert.doesNotMatch(render('~~removed~~', { ...DEFAULT_EXTENSIONS, gfm: false }), /<del>/);
  assert.match(render('$x^2$'), /class="katex"/);
  assert.doesNotMatch(render('$x^2$', { ...DEFAULT_EXTENSIONS, math: false }), /class="katex"/);
  assert.doesNotMatch(render('one\ntwo', { ...DEFAULT_EXTENSIONS, breaks: false }), /<br/);
});
test('alerts preserve inline formatting and normal quotes', () => {
  assert.match(render('> [!TIP]\n> Use **care**.'), /markdown-alert-tip/);
  assert.match(render('> [!TIP]\n> Use **care**.'), /<strong>care<\/strong>/);
  assert.doesNotMatch(render('> normal quote'), /markdown-alert/);
});
test('raw HTML and javascript links cannot execute', () => {
  const html = render('<script>alert(1)</script>\n\n[bad](javascript:alert%281%29)');
  assert.doesNotMatch(html, /<script>|href="javascript:/);
});
test('unknown languages retain source and untrusted settings are ignored', () => {
  assert.match(render('```unknown\nhello\n```'), /hello/);
  assert.equal(parsePreferences('{"extensions":{"math":"yes","breaks":false}}').extensions.math, true);
  assert.equal(parsePreferences('{"extensions":{"breaks":false}}').extensions.breaks, false);
});
test('headings have stable unique anchors, including duplicate and Unicode titles', () => {
  const html = render('# Hello **world**\n\n## Hello world\n\n## Hello world-1\n\n## नमस्ते\n\n```md\n# not a heading\n```');
  assert.match(html, /id="md-hello-world"/);
  assert.match(html, /id="md-hello-world-1"/);
  assert.match(html, /id="md-hello-world-1-1"/);
  assert.doesNotMatch(html, /id="md-not-a-heading"/);
  assert.match(html, /id="md-नमस्ते"/);
});
test('math keeps untrusted commands disabled after the KaTeX update', () => {
  const html = render('$\\href{javascript:alert(1)}{unsafe}$');
  assert.doesNotMatch(html, /href="javascript:/);
  assert.match(render('$$\n\\begin{aligned}a &= b + c \\\\ d &= e\\end{aligned}\n$$'), /<math/);
});
