import { Link } from 'react-router-dom';
import type { DrugSummary } from '../types';

export function CategoryBadge({ category }: { category: DrugSummary['category'] }) {
  return <span className={`badge ${category === '전문의약품' ? 'badge-rx' : 'badge-otc'}`}>{category}</span>;
}

export function DrugCard({ drug }: { drug: DrugSummary }) {
  return (
    <Link to={`/drugs/${drug.id}`} className="drug-card">
      <div className="drug-card-body">
        <div className="drug-card-title">
          <h3>{drug.name}</h3>
          <CategoryBadge category={drug.category} />
        </div>
        <p className="muted">{drug.company}</p>
        <p className="ingredients">
          <span className="label">주성분</span> {drug.ingredients.join(', ')}
        </p>
      </div>
      <span className="chevron" aria-hidden>
        ›
      </span>
    </Link>
  );
}
