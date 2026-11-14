import type { Source } from '../types';

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

export function SourceInfo({ source }: { source: Source }) {
  return (
    <p className="source-info">
      <span className="source-dot" aria-hidden />
      출처:{' '}
      {source.url ? (
        <a href={source.url} target="_blank" rel="noreferrer">
          {source.name}
        </a>
      ) : (
        source.name
      )}
      <span className="muted"> · {fmt(source.retrievedAt)} 조회</span>
    </p>
  );
}
