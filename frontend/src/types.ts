// 백엔드와 공유하는 데이터 형식 (API.md 참고)

/** 공식 의약품 정보 항목 (식약처 e약은요 항목 기준) */
export type SectionKey =
  | 'efficacy' // 효능·효과
  | 'usage' // 용법·용량
  | 'warning' // 사용상 주의사항
  | 'interaction' // 상호작용
  | 'sideEffect' // 부작용
  | 'storage'; // 보관법

export interface Source {
  /** 예: "식품의약품안전처 의약품개요정보(e약은요)" */
  name: string;
  /** 원문을 확인할 수 있는 링크 */
  url?: string;
  /** 데이터 조회 시각 (ISO 8601) */
  retrievedAt: string;
}

export interface DrugSummary {
  id: string;
  name: string;
  company: string;
  /** 주성분 목록 */
  ingredients: string[];
  /** 일반의약품 / 전문의약품 */
  category: '일반의약품' | '전문의의약품' | '정보 미확인';
  /** 제형 (예: 정제, 캡슐제) */
  form?: string;
  /** 약효 분류 (예: 해열·진통제) — 검색 결과 태그로 표시 */
  classification?: string;
  /** 함량 (예: 500mg) */
  strength?: string;
  /** 목록에 쓰는 작은 대표 사진 (보통 알약 사진) */
  imageUrl?: string;
}

export interface DrugSection {
  key: SectionKey;
  title: string;
  /** 공식 원문 (가공하지 않은 텍스트) */
  original: string;
}

/** 의약품 사진: 패키지(포장) 또는 알약 낱알 */
export interface DrugImage {
  kind: 'package' | 'pill';
  url: string;
  /** 사진 출처 (예: 식약처 의약품 낱알식별) */
  source?: string;
}

/** 알약 낱알 식별 정보 (식약처 의약품 낱알식별 정보 기준) */
export interface PillIdentification {
  /** 모양 (예: 장방형, 원형) */
  shape?: string;
  /** 색상 (예: 하양) */
  color?: string;
  /** 앞면 표시(각인) */
  markFront?: string;
  /** 뒷면 표시(각인) */
  markBack?: string;
  /** 크기 (예: 장축 17.5mm) */
  size?: string;
}

export interface DrugDetail extends DrugSummary {
  sections: DrugSection[];
  source: Source;
  /** 사진. 없으면 앱이 기본 그림을 보여준다 */
  images?: DrugImage[];
  /** 알약 모양 정보 */
  identification?: PillIdentification;
}

/** AI 설명이 근거로 삼은 원문 구절 */
export interface Citation {
  sectionKey: SectionKey;
  /** 원문에 실제로 존재하는 구절 (원문 하이라이트에 사용) */
  quote: string;
}

export interface SectionExplanation {
  sectionKey: SectionKey;
  easyText: string;
  citations: Citation[];
}

export interface AskResponse {
  /** false면 공식 정보에서 답을 찾지 못한 것 → AI가 답을 지어내지 않음 */
  answerable: boolean;
  answer: string;
  citations: Citation[];
}

export type InteractionType = '병용금기' | '동일성분중복';

export interface InteractionPair {
  drugA: DrugSummary;
  drugB: DrugSummary;
  ingredientA: string;
  ingredientB: string;
  type: InteractionType;
  /** 공식 원문 사유 */
  reason: string;
  /** AI가 쉽게 풀어 쓴 설명 */
  easyExplanation: string;
  source: Source;
}

export interface InteractionResult {
  pairs: InteractionPair[];
  checkedAt: string;
}
