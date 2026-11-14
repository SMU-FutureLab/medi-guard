import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Disclaimer } from '../components/Disclaimer';
import { SearchBar } from '../components/SearchBar';
import { SourceInfo } from '../components/SourceInfo';
import { ErrorBox, Spinner } from '../components/Status';
import { useMedList } from '../context/MedListContext';
import { useAsync } from '../hooks/useAsync';
import type { InteractionResult } from '../types';

export function InteractionPage() {
  const medList = useMedList();
  const [query, setQuery] = useState('');
  const search = useAsync(() => api.searchDrugs(query), [query], !!query);

  const [result, setResult] = useState<InteractionResult>();
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<Error>();
  // 결과를 본 뒤 목록이 바뀌면 이전 결과는 더 이상 맞지 않으므로 숨긴다
  const [checkedIds, setCheckedIds] = useState('');
  const currentIds = medList.items.map((d) => d.id).join(',');
  const stale = result && checkedIds !== currentIds;

  const check = async () => {
    setChecking(true);
    setCheckError(undefined);
    try {
      setResult(await api.checkInteractions(medList.items.map((d) => d.id)));
      setCheckedIds(currentIds);
    } catch (e) {
      setCheckError(e as Error);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="page">
      <h1 className="page-title">함께 먹어도 될까?</h1>
      <p className="muted lead">
        함께 먹는 약을 담으면, 식약처 DUR(의약품안전사용서비스)에 등록된 병용금기·성분중복 정보를 확인해 드려요.
      </p>

      <section className="panel">
        <h2>약 추가하기</h2>
        <SearchBar onSearch={setQuery} placeholder="추가할 약 이름 검색" />
        {query && (
          <div className="add-results">
            {search.loading && <Spinner />}
            {search.error && <ErrorBox error={search.error} onRetry={search.retry} />}
            {search.data?.length === 0 && <p className="muted">검색 결과가 없어요.</p>}
            {search.data && search.data.length > 0 && (
              <ul>
                {search.data.map((d) => (
                  <li key={d.id}>
                    <span>
                      <strong>{d.name}</strong> <span className="muted">· {d.ingredients.join(', ')}</span>
                    </span>
                    <button
                      type="button"
                      className="btn btn-small"
                      disabled={medList.has(d.id)}
                      onClick={() => medList.add(d)}
                    >
                      {medList.has(d.id) ? '담김' : '담기'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>담은 약 {medList.items.length}개</h2>
          {medList.items.length > 0 && (
            <button type="button" className="link-btn" onClick={medList.clear}>
              모두 비우기
            </button>
          )}
        </div>
        {medList.items.length === 0 ? (
          <p className="muted">아직 담은 약이 없어요. 위에서 검색해 추가하세요.</p>
        ) : (
          <ul className="med-chips">
            {medList.items.map((d) => (
              <li key={d.id}>
                <Link to={`/drugs/${d.id}`}>{d.name}</Link>
                <button type="button" aria-label={`${d.name} 빼기`} onClick={() => medList.remove(d.id)}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={medList.items.length < 2 || checking}
          onClick={check}
        >
          {medList.items.length < 2 ? '약을 2개 이상 담아 주세요' : '상호작용 확인하기'}
        </button>
      </section>

      <section aria-live="polite">
        {checking && <Spinner label="공식 DUR 정보를 확인하고 있어요…" />}
        {checkError && <ErrorBox error={checkError} onRetry={check} />}
        {result && !stale && !checking && (
          <div className="interaction-result">
            {result.pairs.length === 0 ? (
              <div className="result-none">
                <h2>공식 정보에서 확인된 병용금기·성분중복이 없어요</h2>
                <p>
                  다만 이것이 <strong>함께 먹어도 안전하다는 뜻은 아니에요.</strong> DUR에 등록되지 않은 상호작용이 있을
                  수 있으니, 여러 약을 함께 먹는다면 약사에게 확인하세요.
                </p>
              </div>
            ) : (
              <>
                <h2 className="result-title">
                  주의가 필요한 조합 <strong>{result.pairs.length}</strong>건
                </h2>
                <ul className="pair-list">
                  {result.pairs.map((p) => (
                    <li key={`${p.drugA.id}-${p.drugB.id}`} className={`pair ${p.type === '병용금기' ? 'danger' : 'warn'}`}>
                      <span className="pair-type">{p.type}</span>
                      <p className="pair-drugs">
                        <strong>{p.drugA.name}</strong> + <strong>{p.drugB.name}</strong>
                      </p>
                      <p className="muted small">
                        {p.ingredientA === p.ingredientB
                          ? `공통 성분: ${p.ingredientA}`
                          : `${p.ingredientA} ↔ ${p.ingredientB}`}
                      </p>
                      <div className="pair-easy">
                        <span className="ai-chip">AI 쉬운 설명</span>
                        <p>{p.easyExplanation}</p>
                      </div>
                      <details>
                        <summary>공식 원문 사유 보기</summary>
                        <blockquote>{p.reason}</blockquote>
                        <SourceInfo source={p.source} />
                      </details>
                    </li>
                  ))}
                </ul>
                <p className="muted small">임의로 약을 끊지 말고, 처방한 의사나 약사와 먼저 상담하세요.</p>
              </>
            )}
          </div>
        )}
      </section>

      <Disclaimer />
    </div>
  );
}
