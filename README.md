# webext-markdown-renderer — Markdown to HTML for Extensions
> **Built by [Zovo](https://zovo.one)** | `npm i webext-markdown-renderer`

GFM rendering with headings, bold/italic, code blocks, tables, task lists, links, images, and HTML sanitization.

```typescript
import { MarkdownRenderer } from 'webext-markdown-renderer';
const md = new MarkdownRenderer();
md.renderTo('content', '# Hello\n**Bold** and *italic*\n```js\nconsole.log("hi")\n```');
const safe = MarkdownRenderer.sanitize(untrustedHtml);
```
MIT License
