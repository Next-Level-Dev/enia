const MARKDOWN_NOTES: { syntax: string; description: string }[] = [
  { syntax: '# Heading', description: 'h1 to h6 headings' },
  { syntax: '**bold**', description: 'strong text' },
  { syntax: '*italic*', description: 'emphasized text' },
  { syntax: '~~strike~~', description: 'deleted text' },
  {
    syntax: '||spoiler||',
    description: 'spoiler text, hidden behind a "Reveal spoiler" button until clicked',
  },
  { syntax: '`code`', description: 'inline code' },
  { syntax: '```js code```', description: 'fenced code block with a language name (js, ts, css, …)' },
  { syntax: '> quote', description: 'blockquote' },
  { syntax: '- item', description: 'unordered list' },
  { syntax: '1. item', description: 'ordered list' },
  { syntax: '[text](url)', description: 'link' },
  { syntax: '[text](site/path)', description: 'link to a page on this site (e.g. site/stories/ural-chapter-1)' },
  {
    syntax: '![alt](url)',
    description: 'image, video (.mp4/.webm/.mov), or audio (.mp3/.wav/.ogg)',
  },
  { syntax: '---', description: 'horizontal rule' },
  {
    syntax: '[!start color name]',
    description:
      'light-blue dark-blue light-red dark-red light-green dark-green light-purple light-pink light-yellow light-orange white light-gray dark-gray black',
  },
  { syntax: '[!start font name]', description: 'mono sans serif cursive' },
  {
    syntax: '[!tip note text]',
    description:
      'inline "?" note — click to show a hint (references, foreign sentences, complex words)',
  },
  { syntax: '[!end]', description: 'changes font and color to default' },
];

export default function MarkdownGuide() {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-gray-200">Markdown details</h3>
      <ul className="flex flex-col gap-1.5 rounded-xl border border-white/10 bg-white/5 p-4 text-xs leading-relaxed text-[#B3B3B3]">
        {MARKDOWN_NOTES.map((note) => (
          <li key={note.syntax} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
            <code className="shrink-0 whitespace-pre-wrap font-mono text-[#FFE47A]">{note.syntax}</code>
            <span className="text-[#8a7f9e]">{note.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}