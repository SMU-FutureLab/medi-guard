import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { DrugCard } from '../components/DrugCard';
import { SearchBar } from '../components/SearchBar';
import { ErrorBox, Spinner } from '../components/Status';
import { useAsync } from '../hooks/useAsync';

const SUGGESTIONS = ['타이레놀', '게보린', '이트라코나졸', '심바스타틴'];

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const search = (q: string) => setParams({ q });
  const { data, error, loading, retry } = useAsync(() => api.searchDrugs(query), [query], !!query);

  return (
    <div className="page">
      <section className={`hero${query ? ' compact' : ''}`}>
        {!query && (
          <>
            <p className="eyebrow">공식 의약품 정보 기반 AI 복약 정보 설명</p>
            <h1>
              어려운 약 설명서,
              <br />
              <span className="accent">쉬운 말</span>로 알려드려요
            </h1>
            <p className="muted lead">
              식품의약품안전처 공식 정보를 AI가 쉽게 풀어 설명하고, 근거가 된 원문을 함께 보여드려요.
            </p>
          </>
        )}
        <SearchBar initialValue={query} onSearch={search} autoFocus={!query} />
        {!query && (
          <div className="chips center">
            <span className="muted">추천 검색어</span>
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" className="chip" onClick={() => search(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
      </section>

      {!query && (
        <section className="how">
          <h2 className="sr-only">이용 방법</h2>
          <ol className="steps">
            <li>
              <span className="step-no">1</span>
              <strong>약 검색</strong>
              <p>약 이름이나 성분명으로 찾아요</p>
            </li>
            <li>
              <span className="step-no">2</span>
              <strong>쉬운 설명 확인</strong>
              <p>AI가 공식 정보를 쉬운 말로 풀어줘요</p>
            </li>
            <li>
              <span className="step-no">3</span>
              <strong>원문·출처 확인</strong>
              <p>설명의 근거가 된 원문을 바로 확인해요</p>
            </li>
          </ol>
        </section>
      )}

      {query && (
        <section className="results" aria-live="polite">
          {loading && <Spinner label="공식 의약품 정보를 검색하고 있어요…" />}
          {error && <ErrorBox error={error} onRetry={retry} />}
          {data && (
            <>
              <p className="result-count">
                ‘{query}’ 검색 결과 <strong>{data.length}</strong>건
              </p>
              {data.length === 0 ? (
                <div className="empty">
                  <p>검색 결과가 없어요.</p>
                  <p className="muted">약 이름을 정확히 입력했는지, 띄어쓰기를 빼고 다시 검색해 보세요.</p>
                </div>
              ) : (
                <ul className="card-list">
                  {data.map((d) => (
                    <li key={d.id}>
                      <DrugCard drug={d} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
