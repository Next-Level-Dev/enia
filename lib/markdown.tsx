import type { ReactNode } from 'react';

type Tag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

const INLINE_RE =
  /(\*\*[^*]+\*\*|~~[^~]+~~|`[^`]+`|!\[([^\]]*)\]\(([^)\s]+)\)|\[([^\]]+)\]\(([^)\s]+)\)|\*[^*]+\*)/;

const SITE_LINK_PREFIX = 'site/';

function resolveLink(href: string): { href: string; external: boolean } {
  if (href.startsWith(SITE_LINK_PREFIX)) {
    return { href: `/${href.slice(SITE_LINK_PREFIX.length)}`, external: false };
  }
  return { href, external: true };
}

function renderInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let key = 0;

  while (cursor < text.length) {
    const match = text.slice(cursor).match(INLINE_RE);
    if (!match) {
      nodes.push(text.slice(cursor));
      break;
    }

    const index = match.index!;
    if (index > 0) nodes.push(text.slice(cursor, cursor + index));

    const full = match[0];
    const tokenKey = `${keyBase}-${key++}`;

    if (full.startsWith('**')) {
      nodes.push(<strong key={tokenKey}>{renderInline(full.slice(2, -2), tokenKey)}</strong>);
    } else if (full.startsWith('~~')) {
      nodes.push(<del key={tokenKey}>{renderInline(full.slice(2, -2), tokenKey)}</del>);
    } else if (full.startsWith('`')) {
      nodes.push(<code key={tokenKey}>{full.slice(1, -1)}</code>);
    } else if (full.startsWith('![')) {
      {/* eslint-disable-next-line @next/next/no-img-element */}
      nodes.push(<img key={tokenKey} src={match[3]} alt={match[2] ?? ''} />);
    } else if (full.startsWith('[')) {
      const { href, external } = resolveLink(match[5]);
      nodes.push(
        <a
          key={tokenKey}
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
        >
          {renderInline(match[4], tokenKey)}
        </a>
      );
    } else {
      nodes.push(<em key={tokenKey}>{renderInline(full.slice(1, -1), tokenKey)}</em>);
    }

    cursor += index + full.length;
  }

  return nodes;
}

function isBlockStart(line: string): boolean {
  return (
    /^#{1,6}\s/.test(line) ||
    /^```/.test(line) ||
    /^([-*_])\1{2,}\s*$/.test(line) ||
    /^>\s?/.test(line) ||
    /^[-*+]\s+/.test(line) ||
    /^\d+[.)]\s+/.test(line)
  );
}

export function Markdown({ source }: { source: string }) {
  const nodes = renderBlocks(source);
  return <div className="markdown">{nodes}</div>;
}

function renderBlocks(source: string): ReactNode[] {
  const lines = String(source).replace(/\r\n/g, '\n').split('\n');
  const nodes: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed === '') {
      i++;
      continue;
    }

    const fence = trimmed.match(/^```(\w*)\s*$/);
    if (fence) {
      i++;
      const code: string[] = [];
      while (i < lines.length && !/^```\s*$/.test(lines[i].trim())) {
        code.push(lines[i]);
        i++;
      }
      i++;
      nodes.push(
        <pre key={key++}>
          <code className={fence[1] ? `language-${fence[1]}` : undefined}>{code.join('\n')}</code>
        </pre>
      );
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const Tag = (`h${heading[1].length}` as Tag) as 'h1';
      nodes.push(<Tag key={key++}>{renderInline(heading[2], `${key}`)}</Tag>);
      i++;
      continue;
    }

    if (/^([-*_])\1{2,}\s*$/.test(trimmed)) {
      nodes.push(<hr key={key++} />);
      i++;
      continue;
    }

    if (trimmed.startsWith('>')) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith('>')) {
        quote.push(lines[i].trimStart().replace(/^>\s?/, ''));
        i++;
      }
      nodes.push(<blockquote key={key++}>{renderBlocks(quote.join('\n'))}</blockquote>);
      continue;
    }

    const ulItem = trimmed.match(/^[-*+]\s+(.*)$/);
    if (ulItem) {
      const items: ReactNode[] = [];
      while (i < lines.length) {
        const item = lines[i].trim().match(/^[-*+]\s+(.*)$/);
        if (!item) break;
        items.push(<li key={key++}>{renderInline(item[1], `${key}`)}</li>);
        i++;
      }
      nodes.push(<ul key={key++}>{items}</ul>);
      continue;
    }

    const olItem = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (olItem) {
      const items: ReactNode[] = [];
      while (i < lines.length) {
        const item = lines[i].trim().match(/^\d+[.)]\s+(.*)$/);
        if (!item) break;
        items.push(<li key={key++}>{renderInline(item[1], `${key}`)}</li>);
        i++;
      }
      nodes.push(<ol key={key++}>{items}</ol>);
      continue;
    }

    const paragraph: string[] = [line];
    i++;
    while (i < lines.length && lines[i].trim() !== '' && !isBlockStart(lines[i].trim())) {
      paragraph.push(lines[i]);
      i++;
    }
    nodes.push(
      <p key={key++}>{renderInline(paragraph.join(' '), `${key}`)}</p>
    );
  }

  return nodes;
}
