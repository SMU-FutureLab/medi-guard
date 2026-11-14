/** 원문(text)에서 quotes에 해당하는 구절을 <mark>로 강조. AI 설명의 근거를 원문에서 바로 보여주기 위함. */
export function Highlight({ text, quotes, activeQuote }: { text: string; quotes: string[]; activeQuote?: string }) {
  const valid = quotes.filter((q) => q && text.includes(q));
  if (valid.length === 0) return <>{text}</>;

  const escaped = valid.map((q) => q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const parts = text.split(new RegExp(`(${escaped.join('|')})`, 'g'));

  return (
    <>
      {parts.map((part, i) =>
        valid.includes(part) ? (
          <mark key={i} className={part === activeQuote ? 'active' : undefined}>
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}
