import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { Disclaimer } from '../components/Disclaimer';
import { DrugTags, Thumb, ingredientLine } from '../components/DrugCard';
import { Highlight } from '../components/Highlight';
import { Icon, type IconName } from '../components/Icon';
import { PageTop } from '../components/Layout';
import { SourceInfo } from '../components/SourceInfo';
import { ErrorBox, SkeletonLines, Spinner } from '../components/Status';
import { useAppStore } from '../context/AppStore';
import { useAsync } from '../hooks/useAsync';
import type { SectionKey } from '../types';

export const SECTION_ICONS: Record<SectionKey, IconName> = {
  efficacy: 'shield',
  usage: 'pill',
  warning: 'alert',
  interaction: 'link',
  sideEffect: 'pulse',
  storage: 'layers',
};

type Tab = 'official' | 'easy';

export function DrugDetailPage() {
  const { id = '' } = useParams();
  const store = useAppStore();
  const drug = useAsync(() => api.getDrug(id), [id]);
  // 원문을 먼저 보여주고, AI 설명은 따로 불러와 준비되는 대로 채운다
  const explain = useAsync(() => api.explainDrug(id), [id], !!drug.data);

  const [tab, setTab] = useState<Tab>('official');
  const [open, setOpen] = useState<Set<SectionKey>>(() => new Set(['efficacy']));
  const [focus, setFocus] = useState<{ key: SectionKey; quote: string }>();

  useEffect(() => {
    setTab('official');
    setOpen(new Set(['efficacy']));
    setFocus(undefined);
  }, [id]);

  useEffect(() => {
    if (drug.data) store.recordView(drug.data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drug.data]);

  if (drug.loading) return <Spinner label="의약품 정보를 불러오고 있어요…" />;
  if (drug.error || !drug.data)
    return (
      <div className="page">
        <ErrorBox error={drug.error ?? new Error('정보가 없어요.')} onRetry={drug.retry} />
        <Link to="/search">← 검색으로 돌아가기</Link>
      </div>
    );

  const d = drug.data;
  const fav = store.favorites.has(d.id);
  const inMedList = store.medList.has(d.id);

  const toggle = (key: SectionKey) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // AI 설명의 근거 구절 → 공식 정보 탭에서 해당 항목을 열고 구절을 표시
  const showEvidence = (key: SectionKey, quote: string) => {
    setTab('official');
    setOpen((prev) => new Set(prev).add(key));
    setFocus({ key, quote });
    requestAnimationFrame(() => document.getElementById(`sec-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  };

  return (
    <div className="page detail">
      <PageTop
        title={d.name}
        right={
          <button
            type="button"
            className={`icon-btn star${fav ? ' on' : ''}`}
            aria-pressed={fav}
            aria-label={fav ? '관심 의약품에서 빼기' : '관심 의약품에 추가'}
            onClick={() => store.favorites.toggle(d)}
          >
            <Icon name="star" size={24} />
          </button>
        }
      />
      <DrugTags drug={d} />

      <section className="info-card">
        <Thumb size="lg" />
        <dl className="info-table">
          <dt>주성분</dt>
          <dd>{d.ingredients.length === 1 ? ingredientLine(d) : d.ingredients.join(', ')}</dd>
          <dt>제형</dt>
          <dd>{d.form ?? '정보 없음'}</dd>
          <dt>업체명</dt>
          <dd>{d.company}</dd>
        </dl>
      </section>
      <SourceInfo source={d.source} />

      <div className="seg-tabs" role="tablist" aria-label="정보 보기 방식">
        <button role="tab" aria-selected={tab === 'official'} className={tab === 'official' ? 'on' : ''} onClick={() => setTab('official')}>
          공식 정보
        </button>
        <button role="tab" aria-selected={tab === 'easy'} className={tab === 'easy' ? 'on' : ''} onClick={() => setTab('easy')}>
          AI 쉽게 설명
        </button>
      </div>

      <ul className="accordion">
        {d.sections.map((s) => {
          const isOpen = open.has(s.key);
          const exp = explain.data?.find((e) => e.sectionKey === s.key);
          const important = s.key === 'warning' || s.key === 'interaction';
          return (
            <li key={s.key} id={`sec-${s.key}`} className={`acc-item${isOpen ? ' open' : ''}${important ? ' important' : ''}`}>
              <button type="button" className="acc-head" aria-expanded={isOpen} onClick={() => toggle(s.key)}>
                <Icon name={SECTION_ICONS[s.key]} className="acc-icon" />
                <span>{s.title}</span>
                <Icon name="chevronDown" className="acc-chevron" />
              </button>
              {isOpen && (
                <div className="acc-body">
                  {tab === 'official' ? (
                    <p className="original">
                      <Highlight
                        text={s.original}
                        quotes={focus?.key === s.key ? [focus.quote] : []}
                        activeQuote={focus?.quote}
                      />
                    </p>
                  ) : explain.loading ? (
                    <>
                      <p className="ai-label">
                        <Icon name="sparkle" size={16} /> AI가 공식 정보를 쉬운 말로 정리하고 있어요…
                      </p>
                      <SkeletonLines />
                    </>
                  ) : exp ? (
                    <>
                      <p className="ai-label">
                        <Icon name="sparkle" size={16} /> AI 쉬운 설명
                      </p>
                      <p className="easy-text">{exp.easyText}</p>
                      {exp.citations.length > 0 && (
                        <div className="citations">
                          <span className="label">근거 원문</span>
                          {exp.citations.map((c) => (
                            <button key={c.quote} type="button" className="citation" onClick={() => showEvidence(s.key, c.quote)}>
                              “{c.quote.length > 26 ? `${c.quote.slice(0, 26)}…` : c.quote}”
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="note">이 항목은 AI 설명을 불러오지 못했어요. 공식 정보 탭에서 원문을 확인해 주세요.</p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <div className="detail-actions">
        <Link to={`/drugs/${d.id}/ai`} className="btn btn-primary btn-block">
          <Icon name="sparkle" /> AI에게 이 약에 대해 질문하기
        </Link>
        <button type="button" className="btn btn-ghost btn-block" onClick={() => (inMedList ? store.medList.remove(d.id) : store.medList.add(d))}>
          <Icon name={inMedList ? 'shield' : 'plus'} />
          {inMedList ? '함께 먹는 약 목록에 담겨 있어요' : '함께 먹는 약 확인에 담기'}
        </button>
        {inMedList && store.medList.items.length >= 2 && (
          <Link to="/interactions" className="text-link center">
            담은 약 {store.medList.items.length}개 상호작용 확인하기 →
          </Link>
        )}
      </div>

      <Disclaimer />
    </div>
  );
}
