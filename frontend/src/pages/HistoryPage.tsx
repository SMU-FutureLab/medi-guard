import { Link } from 'react-router-dom';
import { DrugRow } from '../components/DrugCard';
import { Icon } from '../components/Icon';
import { useAppStore } from '../context/AppStore';

const pad = (n: number) => String(n).padStart(2, '0');
export const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

export function HistoryPage() {
  const { history, clearHistory } = useAppStore();

  return (
    <div className="page">
      <header className="title-block">
        <h1>
          <Icon name="clock" size={26} /> 조회 기록
        </h1>
        <p className="muted">최근에 검색한 의약품을 확인할 수 있어요.</p>
      </header>

      {history.length === 0 ? (
        <div className="empty">
          <p>아직 조회한 의약품이 없어요.</p>
          <Link to="/search" className="btn btn-primary">
            의약품 검색하기
          </Link>
        </div>
      ) : (
        <>
          <ul className="card-list">
            {history.map((h) => (
              <li key={h.drug.id}>
                <DrugRow drug={h.drug} sub={`조회일 ${formatDateTime(h.viewedAt)}`} />
              </li>
            ))}
          </ul>
          <button type="button" className="text-link muted-link" onClick={clearHistory}>
            조회 기록 모두 지우기
          </button>
          <p className="muted small">조회 기록은 이 기기에만 저장돼요.</p>
        </>
      )}
    </div>
  );
}
