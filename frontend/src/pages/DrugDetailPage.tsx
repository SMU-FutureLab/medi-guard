import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { AskBox } from '../components/AskBox';
import { Disclaimer } from '../components/Disclaimer';
import { CategoryBadge } from '../components/DrugCard';
import { InfoSection } from '../components/InfoSection';
import { SourceInfo } from '../components/SourceInfo';
import { ErrorBox, Spinner } from '../components/Status';
import { useMedList } from '../context/MedListContext';
import { useAsync } from '../hooks/useAsync';

export function DrugDetailPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const medList = useMedList();
  const drug = useAsync(() => api.getDrug(id), [id]);
  // 원문을 먼저 보여주고, AI 설명은 따로 불러와 준비되는 대로 채운다
  const explain = useAsync(() => api.explainDrug(id), [id], !!drug.data);

  if (drug.loading) return <Spinner label="의약품 정보를 불러오고 있어요…" />;
  if (drug.error || !drug.data)
    return (
      <div className="page">
        <ErrorBox error={drug.error ?? new Error('정보가 없어요.')} onRetry={drug.retry} />
        <Link to="/">← 검색으로 돌아가기</Link>
      </div>
    );

  const d = drug.data;
  const inList = medList.has(d.id);

  return (
    <div className="page detail">
      <button type="button" className="back" onClick={() => navigate(-1)}>
        ← 뒤로
      </button>

      <header className="detail-head">
        <div className="detail-title">
          <h1>{d.name}</h1>
          <CategoryBadge category={d.category} />
        </div>
        <p className="muted">{d.company}</p>
        <p className="ingredients">
          <span className="label">주성분</span> {d.ingredients.join(', ')}
        </p>
        <SourceInfo source={d.source} />
        <div className="detail-actions">
          <button
            type="button"
            className={`btn ${inList ? 'btn-ghost' : 'btn-secondary'}`}
            onClick={() => (inList ? medList.remove(d.id) : medList.add(d))}
          >
            {inList ? '✓ 함께 확인할 약에 담김' : '+ 함께 먹는 약 확인에 담기'}
          </button>
          {inList && medList.items.length >= 2 && (
            <Link to="/interactions" className="btn btn-primary">
              상호작용 확인하기 ({medList.items.length})
            </Link>
          )}
        </div>
      </header>

      <nav className="toc" aria-label="항목 바로가기">
        {d.sections.map((s) => (
          <a key={s.key} href={`#section-${s.key}`}>
            {s.title}
          </a>
        ))}
      </nav>

      <Disclaimer />

      {d.sections.map((s) => (
        <InfoSection
          key={`${d.id}-${s.key}`}
          section={s}
          explanation={explain.data?.find((e) => e.sectionKey === s.key)}
          explanationLoading={explain.loading}
          explanationFailed={!!explain.error}
        />
      ))}

      <AskBox drug={d} />
    </div>
  );
}
