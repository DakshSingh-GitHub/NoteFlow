import assert from 'node:assert';
import test, { describe, it } from 'node:test';
import { stripHtml } from './richText.ts';

describe('stripHtml', () => {
  it('should return an empty string for null/undefined/empty input', () => {
    assert.strictEqual(stripHtml(''), '');
    // @ts-ignore
    assert.strictEqual(stripHtml(null), '');
    // @ts-ignore
    assert.strictEqual(stripHtml(undefined), '');
  });

  it('should return plain text as is', () => {
    assert.strictEqual(stripHtml('Hello world'), 'Hello world');
  });

  it('should strip simple HTML tags', () => {
    assert.strictEqual(stripHtml('<p>Hello</p>'), 'Hello');
    assert.strictEqual(stripHtml('<b>Bold</b>'), 'Bold');
  });

  it('should strip nested HTML tags', () => {
    assert.strictEqual(stripHtml('<div><p>Hello <span>world</span></p></div>'), 'Hello world');
  });

  it('should strip style tags and their content', () => {
    assert.strictEqual(stripHtml('Text <style>body { color: red; }</style> more text'), 'Text more text');
  });

  it('should strip script tags and their content', () => {
    assert.strictEqual(stripHtml('Text <script>alert("hi")</script> more text'), 'Text more text');
  });

  it('should replace &nbsp; with space', () => {
    assert.strictEqual(stripHtml('Hello&nbsp;world'), 'Hello world');
  });

  it('should decode HTML entities', () => {
    assert.strictEqual(stripHtml('&lt;b&gt;Hello&lt;/b&gt; &amp; &quot;world&quot; &#39;!&#39;'), '<b>Hello</b> & "world" \'!\'');
  });

  it('should collapse multiple whitespaces and trim', () => {
    assert.strictEqual(stripHtml('  Hello   \n  world  '), 'Hello world');
  });

  it('should handle complex mixed content', () => {
    const html = `
      <style>
        .test { color: blue; }
      </style>
      <div>
        <h1>Title</h1>
        <p>This is a <b>test</b> with &nbsp; a link: <a href="#">here</a>.</p>
        <script>console.log("test");</script>
      </div>
    `;
    assert.strictEqual(stripHtml(html), 'Title This is a test with a link: here .');
  });
});
