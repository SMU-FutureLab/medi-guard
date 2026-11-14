import { useState } from 'react';
import type { DrugSection, SectionExplanation } from '../types';
import { Highlight } from './Highlight';
import { SkeletonLines } from './Status';

type Tab = 'easy' | 'original';

interface Props {
  section: DrugSection;
  explanation?: SectionExplanation;
  explanationLoading: boolean;
  explanationFailed: boolean;
}

const ICONS: Record<DrugSection['key'], string> = {
  efficacy: '💊',
  usage: '⏰',
  warning: '⚠️',
  interaction: '🔗',
  sideEffect: '🩺',
  storage: '📦',
};

export function InfoSection({ section, explanation, explanationLoading, explanationFailed }: Props) {
  const [tab, setTab] = useState<Tab>('easy');
  const [activeQuote, setActiveQuote] = useState<string>();
  const quotes = explanation?.citations.map((c) => c.quote) ?? [];
  const important = section.key === 'warning' || section.key === 'interaction';

  // AI 설명을 쓸 수 없으면 원문으로 대체 (설명이 없다고 정보를 숨기지 않음)
  const showOriginal = tab === 'original' || (!explanationLoading && !explanation);

  const showEvidence = (quote: string) => {
    setActiveQuote(quote);
    setTab('original');
  };

  return (
    <section className={`info-section${important ? ' important' : ''}`} id={`section-${section.key}`}>
      <div className="info-head">
        <h2>
          <span aria-hidden>{ICONS[section.key]}</span> {section.title}
        </h2>
        <div className="tabs" role="tablist" aria-label={`${section.title} 보기 방식`}>
          <button
            role="tab"
            aria-selected={!showOriginal}
            className={!showOriginal ? 'on' : ''}
            onClick={() => setTab('easy')}
            disabled={!explanation && !explanationLoading}
          >
            쉬운 설명
          </button>
          <button role="tab" aria-selected={showOriginal} className={showOriginal ? 'on' : ''} onClick={() => setTab('original')}>
            공식 원문
          </button>
        </div>
      </div>

      {showOriginal ? (
        <div className="info-body original">
          {explanationFailed && tab === 'easy' && (
            <p className="note">AI 설명을 불러오지 못해 공식 원문을 보여드려요.</p>
          )}
          <p>
            <Highlight text={section.original} quotes={quotes} activeQuote={activeQuote} />
          </p>
          {quotes.length > 0 && <p className="hint">노란색 표시는 AI 설명이 참고한 구절이에요.</p>}
        </div>
      ) : explanationLoading ? (
        <div className="info-body">
          <p className="ai-label">AI가 공식 정보를 쉬운 말로 정리하고 있어요…</p>
          <SkeletonLines />
        </div>
      ) : (
        explanation && (
          <div className="info-body easy">
            <p className="ai-label">
              <span className="ai-chip">AI 쉬운 설명</span>
            </p>
            <p className="easy-text">{explanation.easyText}</p>
            {quotes.length > 0 && (
              <div className="citations">
                <span className="label">근거 원문</span>
                {quotes.map((q) => (
                  <button key={q} type="button" className="citation" onClick={() => showEvidence(q)}>
                    “{q.length > 28 ? `${q.slice(0, 28)}…` : q}”
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      )}
    </section>
  );
}
