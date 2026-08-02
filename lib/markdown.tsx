import type { CSSProperties, ReactNode } from 'react';

type Tag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

const INLINE_RE =
  /(\[!\s*(start|end)\b\s*(?:(color|font)\s+([a-z0-9-]+))?\s*\]|\*\*[^*]+\*\*|~~[^~]+~~|`[^`]+`|!\[([^\]]*)\]\(([^)\s]+)\)|\[([^\]]+)\]\(([^)\s]+)\)|\*[^*]+\*)/i;

const SITE_LINK_PREFIX = 'site/';

export const COMMAND_COLORS: Record<string, string> = {
  'light-blue': '#4fc3f7',
  'dark-blue': '#285388',
  'light-red': '#ec3e38',
  'dark-red': '#8b2a27',
  'light-green': '#00ff00',
  'dark-green': '#71b280',
  'light-purple': '#a78bfa',
  'light-pink': '#f472b6',
  'light-yellow': '#ffdd55',
  'light-orange': '#fb923c',
  'white': '#f5f2f9',
  'light-gray': '#7e7988',
  'dark-gray': '#3d3c3f',
  'black': '#090511',
};

export const COMMAND_FONTS: Record<string, string> = {
  mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  sans: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  serif: 'Georgia, Cambria, "Times New Roman", serif',
  cursive: '"Segoe Script", "Brush Script MT", cursive',
};

const VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogv', 'mov', 'm4v'];
const AUDIO_EXTENSIONS = ['mp3', 'wav', 'ogg', 'oga', 'm4a', 'aac', 'flac', 'opus'];

interface StyleCtx {
  color?: string;
  fontFamily?: string;
}

function regionStyle(ctx: StyleCtx): CSSProperties {
  const style: CSSProperties = {};
  if (ctx.color) style.color = ctx.color;
  if (ctx.fontFamily) style.fontFamily = ctx.fontFamily;
  return style;
}

function applyCommand(
  main: string,
  sub: string | undefined,
  arg: string | undefined,
  ctx: StyleCtx
): boolean {
  if (main.toLowerCase() === 'end') {
    ctx.color = undefined;
    ctx.fontFamily = undefined;
    return true;
  }
  if (sub === 'color') {
    const hex = arg ? COMMAND_COLORS[arg.toLowerCase()] : undefined;
    if (!hex) return false;
    ctx.color = hex;
    return true;
  }
  if (sub === 'font') {
    const family = arg ? COMMAND_FONTS[arg.toLowerCase()] : undefined;
    if (!family) return false;
    ctx.fontFamily = family;
    return true;
  }
  return false;
}

function resolveLink(href: string): { href: string; external: boolean } {
  if (href.startsWith(SITE_LINK_PREFIX)) {
    return { href: `/${href.slice(SITE_LINK_PREFIX.length)}`, external: false };
  }
  return { href, external: true };
}

function mediaFor(src: string, alt: string, tokenKey: string): ReactNode {
  const ext = src.split(/[?#]/)[0].split('.').pop()?.toLowerCase();
  if (ext && VIDEO_EXTENSIONS.includes(ext)) {
    return <video key={tokenKey} src={src} controls preload="metadata" />;
  }
  if (ext && AUDIO_EXTENSIONS.includes(ext)) {
    return <audio key={tokenKey} src={src} controls preload="metadata" />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img key={tokenKey} src={src} alt={alt} />;
}

function renderInline(text: string, keyBase: string, ctx: StyleCtx): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let key = 0;
  let regionKey = 0;
  let pending: ReactNode[] = [];
  let pendingStyle = regionStyle(ctx);

  function flush() {
    if (pending.length === 0) return;
    if (pendingStyle.color || pendingStyle.fontFamily) {
      nodes.push(
        <span key={`${keyBase}-r${regionKey++}`} className="mk-region" style={pendingStyle}>
          {pending}
        </span>
      );
    } else {
      nodes.push(...pending);
    }
    pending = [];
  }

  while (cursor < text.length) {
    const match = text.slice(cursor).match(INLINE_RE);
    if (!match) {
      pending.push(text.slice(cursor));
      break;
    }

    const index = match.index!;
    if (index > 0) pending.push(text.slice(cursor, cursor + index));

    const full = match[0];
    const tokenKey = `${keyBase}-${key++}`;

    if (match[2]) {
      const before = regionStyle(ctx);
      const handled = applyCommand(match[2], match[3], match[4], ctx);
      if (handled) {
        const after = regionStyle(ctx);
        if (after.color !== before.color || after.fontFamily !== before.fontFamily) {
          flush();
          pendingStyle = after;
        }
      } else {
        pending.push(full);
      }
    } else if (full.startsWith('**')) {
      pending.push(
        <strong key={tokenKey}>{renderInline(full.slice(2, -2), tokenKey, ctx)}</strong>
      );
    } else if (full.startsWith('~~')) {
      pending.push(<del key={tokenKey}>{renderInline(full.slice(2, -2), tokenKey, ctx)}</del>);
    } else if (full.startsWith('`')) {
      pending.push(<code key={tokenKey}>{full.slice(1, -1)}</code>);
    } else if (full.startsWith('![')) {
      pending.push(mediaFor(match[6], match[5] ?? '', tokenKey));
    } else if (full.startsWith('[')) {
      const { href, external } = resolveLink(match[8]);
      pending.push(
        <a
          key={tokenKey}
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
        >
          {renderInline(match[7], tokenKey, ctx)}
        </a>
      );
    } else {
      pending.push(<em key={tokenKey}>{renderInline(full.slice(1, -1), tokenKey, ctx)}</em>);
    }

    cursor += index + full.length;
  }

  flush();
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
  const ctx: StyleCtx = {};
  const nodes = renderBlocks(source, ctx);
  return <div className="markdown">{nodes}</div>;
}

function renderBlocks(source: string, ctx: StyleCtx): ReactNode[] {
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
      nodes.push(<Tag key={key++}>{renderInline(heading[2], `${key}`, ctx)}</Tag>);
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
      nodes.push(<blockquote key={key++}>{renderBlocks(quote.join('\n'), ctx)}</blockquote>);
      continue;
    }

    const ulItem = trimmed.match(/^[-*+]\s+(.*)$/);
    if (ulItem) {
      const items: ReactNode[] = [];
      while (i < lines.length) {
        const item = lines[i].trim().match(/^[-*+]\s+(.*)$/);
        if (!item) break;
        items.push(<li key={key++}>{renderInline(item[1], `${key}`, ctx)}</li>);
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
        items.push(<li key={key++}>{renderInline(item[1], `${key}`, ctx)}</li>);
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
    nodes.push(<p key={key++}>{renderInline(paragraph.join(' '), `${key}`, ctx)}</p>);
  }

  return nodes;
}
