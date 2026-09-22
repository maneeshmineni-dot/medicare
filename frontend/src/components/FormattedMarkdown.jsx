import React from 'react';

/**
 * Lightweight, zero-dependency, XSS-safe Markdown text formatter for AI chat messages.
 * Formats bold (**text**), italics (*text*), code (`text`), headings (###), bullet lists, and numbered lists.
 */
export const FormattedMarkdown = ({ content }) => {
  if (!content || typeof content !== 'string') return null;

  // Helper to format inline markdown spans (bold, italic, code)
  const formatInline = (text) => {
    // Split by inline code, bold, italic patterns
    const parts = [];
    // Regex matches `code`, **bold**, *italic*
    const regex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let lastIdx = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        parts.push(text.substring(lastIdx, match.index));
      }
      const token = match[0];
      if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code
            key={match.index}
            style={{
              padding: '2px 5px',
              borderRadius: '4px',
              background: 'rgba(0, 0, 0, 0.06)',
              fontFamily: 'monospace',
              fontSize: '0.88em'
            }}
          >
            {token.slice(1, -1)}
          </code>
        );
      } else if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={match.index} style={{ fontWeight: 700 }}>
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(<em key={match.index}>{token.slice(1, -1)}</em>);
      }
      lastIdx = regex.lastIndex;
    }

    if (lastIdx < text.length) {
      parts.push(text.substring(lastIdx));
    }

    return parts.length > 0 ? parts : text;
  };

  // Split content into blocks by double newlines
  const blocks = content.split(/\n\n+/);

  return (
    <div className="formatted-markdown-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: 1.6 }}>
      {blocks.map((block, blockIdx) => {
        const lines = block.split('\n').map(l => l.trim()).filter(Boolean);

        // Check if block is a heading (e.g. ### Heading)
        if (lines.length === 1 && lines[0].startsWith('#')) {
          const level = lines[0].match(/^#+/)[0].length;
          const text = lines[0].replace(/^#+\s*/, '');
          const fontSize = level === 1 ? '1.15rem' : level === 2 ? '1.05rem' : '0.95rem';
          return (
            <div
              key={blockIdx}
              style={{
                fontWeight: 800,
                fontSize,
                marginTop: '4px',
                marginBottom: '2px',
                color: 'var(--md-sys-color-on-surface)'
              }}
            >
              {formatInline(text)}
            </div>
          );
        }

        // Check if block is a bullet list
        const isBulletList = lines.every(l => /^[-*•]\s+/.test(l));
        if (isBulletList) {
          return (
            <ul key={blockIdx} style={{ margin: '2px 0 6px 18px', padding: 0, listStyleType: 'disc' }}>
              {lines.map((line, lineIdx) => {
                const itemText = line.replace(/^[-*•]\s+/, '');
                return (
                  <li key={lineIdx} style={{ marginBottom: '4px' }}>
                    {formatInline(itemText)}
                  </li>
                );
              })}
            </ul>
          );
        }

        // Check if block is a numbered list
        const isNumberedList = lines.every(l => /^\d+\.\s+/.test(l));
        if (isNumberedList) {
          return (
            <ol key={blockIdx} style={{ margin: '2px 0 6px 20px', padding: 0 }}>
              {lines.map((line, lineIdx) => {
                const itemText = line.replace(/^\d+\.\s+/, '');
                return (
                  <li key={lineIdx} style={{ marginBottom: '4px' }}>
                    {formatInline(itemText)}
                  </li>
                );
              })}
            </ol>
          );
        }

        // Standard paragraph (render multi-line with <br /> if any)
        return (
          <p key={blockIdx} style={{ margin: 0 }}>
            {lines.map((line, lineIdx) => (
              <React.Fragment key={lineIdx}>
                {formatInline(line)}
                {lineIdx < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
};
