import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import { DrugCard } from '../components/DrugCard';
import { SearchBar } from '../components/SearchBar';
import { ErrorBox, Spinner } from '../components/Status';
import { useAppStore } from '../context/AppStore';
import { useAsync } from '../hooks/useAsync';

const SUGGESTIONS = ['타이레놀', '게보린', '이트라코나졸', '심바스타틴'];

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const { history } = useAppStore();
  const search = (q: string) => setParams({ q });
  const { data, error, loading, retry } = useAsync(() => api.searchDrugs(query), [query], !!query);

  return (
    <div className="page">
      <SearchBar initialValue={query} onSearch={search} onClear={() => setParams({})} autoFocus={!query} />

      {!query && (
        <section className="stack">
          <div className="chips">
            <span className="muted small">추천 검색어</span>
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" className="chip" onClick={() => search(s)}>
                {s}
              </button>
            ))}
          </div>
          {history.length > 0 && (
            <>
              <h2 className="section-label">최근 조회한 의약품</h2>
              <ul className="card-list">
                {history.slice(0, 3).map((h) => (
                  <li key={h.drug.id}>
                    <DrugCard drug={h.drug} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      )}

      {query && (
        <section className="stack" aria-live="polite">
          {loading && <Spinner label="공식 의약품 정보를 검색하고 있어요…" />}
          {error && <ErrorBox error={error} onRetry={retry} />}
          {data && (
            <>
              <h2 className="section-label">검색 결과 {data.length}건</h2>
              {data.length === 0 ? (
                <div className="empty">
                  <p>‘{query}’에 대한 검색 결과가 없어요.</p>
                  <p className="muted small">약 이름을 정확히 입력했는지, 띄어쓰기를 빼고 다시 검색해 보세요.</p>
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
