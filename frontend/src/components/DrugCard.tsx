import { Link } from 'react-router-dom';
import type { DrugSummary } from '../types';
import { Icon, PillArt } from './Icon';

export function ingredientLine(d: DrugSummary) {
  if (d.ingredients.length === 1) return [d.ingredients[0], d.strength].filter(Boolean).join(' ');
  return `${d.ingredients[0]} 외 ${d.ingredients.length - 1}종`;
}

export function DrugTags({ drug }: { drug: DrugSummary }) {
  return (
    <div className="tags">
      <span className={`tag ${drug.category === '전문의약품' ? 'tag-rx' : ''}`}>{drug.category}</span>
      {drug.classification && <span className="tag">{drug.classification}</span>}
    </div>
  );
}

export function Thumb({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <div className={`thumb thumb-${size}`}>
      <PillArt size={size === 'lg' ? 110 : 52} />
    </div>
  );
}

/** 검색 결과 카드 */
export function DrugCard({ drug }: { drug: DrugSummary }) {
  return (
    <Link to={`/drugs/${drug.id}`} className="drug-card">
      <Thumb />
      <div className="drug-card-body">
        <h3>{drug.name}</h3>
        <p className="muted small">{ingredientLine(drug)}</p>
        <DrugTags drug={drug} />
      </div>
      <Icon name="chevronRight" className="chevron" />
    </Link>
  );
}

/** 조회 기록·관심 의약품 목록 행 */
export function DrugRow({ drug, sub }: { drug: DrugSummary; sub: string }) {
  return (
    <Link to={`/drugs/${drug.id}`} className="drug-row">
      <Thumb />
      <div className="drug-card-body">
        <h3>{drug.name}</h3>
        <p className="muted small">{sub}</p>
      </div>
      <Icon name="chevronRight" className="chevron" />
    </Link>
  );
}
