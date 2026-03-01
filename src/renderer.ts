/**
 * Markdown Renderer — GFM-compatible markdown to safe HTML
 */
export class MarkdownRenderer {
    private extensions: Array<(html: string) => string> = [];

    /** Render markdown to HTML */
    render(md: string): string {
        let html = this.parse(md);
        for (const ext of this.extensions) html = ext(html);
        return html;
    }

    /** Add custom post-processing extension */
    use(extension: (html: string) => string): this { this.extensions.push(extension); return this; }

    /** Parse markdown to HTML */
    private parse(md: string): string {
        let html = md;

        // Escape HTML
        html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        // Code blocks (fenced)
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
            `<pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`);

        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Headings
        html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
        html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
        html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
        html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

        // Blockquotes
        html = html.replace(/^&gt;\s+(.+)$/gm, '<blockquote>$1</blockquote>');

        // Bold and italic
        html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

        // Links and images
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%">');
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

        // Horizontal rule
        html = html.replace(/^---$/gm, '<hr>');

        // Unordered lists
        html = html.replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

        // Task lists
        html = html.replace(/<li>\[x\]\s*(.*?)<\/li>/g, '<li style="list-style:none"><input type="checkbox" checked disabled> $1</li>');
        html = html.replace(/<li>\[\s\]\s*(.*?)<\/li>/g, '<li style="list-style:none"><input type="checkbox" disabled> $1</li>');

        // Tables
        html = html.replace(/\|(.+)\|\n\|[-| :]+\|\n([\s\S]*?)(?=\n\n|\n$|$)/g, (_, header, body) => {
            const headers = header.split('|').map((h: string) => `<th style="padding:8px 12px;border:1px solid #E5E7EB;font-weight:600">${h.trim()}</th>`).join('');
            const rows = body.trim().split('\n').map((row: string) => {
                const cells = row.replace(/^\||\|$/g, '').split('|').map((c: string) => `<td style="padding:8px 12px;border:1px solid #E5E7EB">${c.trim()}</td>`).join('');
                return `<tr>${cells}</tr>`;
            }).join('');
            return `<table style="border-collapse:collapse;width:100%"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
        });

        // Paragraphs
        html = html.replace(/\n\n+/g, '\n\n');
        html = html.split('\n\n')
            .map((block) => {
                const trimmed = block.trim();
                if (!trimmed) return '';
                if (/^<(h[1-6]|ul|ol|pre|blockquote|table|hr|div)/.test(trimmed)) return trimmed;
                return `<p>${trimmed}</p>`;
            })
            .join('\n');

        // Line breaks
        html = html.replace(/\n/g, '<br>');

        return html;
    }

    /** Render to a container */
    renderTo(containerId: string, md: string): void {
        const el = document.getElementById(containerId);
        if (el) el.innerHTML = this.render(md);
    }

    /** Sanitize HTML (strip scripts and events) */
    static sanitize(html: string): string {
        return html
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/on\w+='[^']*'/gi, '')
            .replace(/javascript:/gi, '');
    }
}
