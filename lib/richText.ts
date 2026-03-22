export function stripHtml(html: string): string {
  if (!html) return '';

  return html
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function isLikelyHtml(content: string): boolean {
  return /<[^>]+>/.test(content);
}

export function normalizeContentForEditor(content: string): string {
  if (!content) return '';
  if (isLikelyHtml(content)) return content;
  return escapeHtml(content).replace(/\n/g, '<br>');
}

export function sanitizeRichHtml(html: string): string {
  if (!html) return '';

  let sanitized = html;

  sanitized = sanitized.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  sanitized = sanitized.replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '');
  sanitized = sanitized.replace(/<(object|embed|link|meta)[^>]*?>/gi, '');
  sanitized = sanitized.replace(/\son\w+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  sanitized = sanitized.replace(/\s(href|src)\s*=\s*(['"])\s*javascript:[\s\S]*?\2/gi, '');

  sanitized = sanitized.replace(/\sstyle=(['"])(.*?)\1/gi, (_, quote: string, styleValue: string) => {
    const allowedProps = ['color', 'font-size', 'font-weight', 'font-style', 'text-decoration'];
    const kept = styleValue
      .split(';')
      .map((rule) => rule.trim())
      .filter(Boolean)
      .filter((rule) => {
        const prop = rule.split(':')[0]?.trim().toLowerCase();
        return !!prop && allowedProps.includes(prop);
      });

    if (!kept.length) return '';
    return ` style=${quote}${kept.join('; ')}${quote}`;
  });

  sanitized = sanitized
    .replace(/<div><br><\/div>/gi, '<br>')
    .replace(/<\/div><div>/gi, '<br>')
    .replace(/<div>/gi, '')
    .replace(/<\/div>/gi, '');

  return sanitized.trim();
}

export function htmlToPreviewText(html: string, maxLength = 100): string {
  const plain = stripHtml(html);
  if (plain.length <= maxLength) return plain;
  return `${plain.substring(0, maxLength)}...`;
}

