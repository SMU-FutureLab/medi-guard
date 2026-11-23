import type {
  DrugSummary,
  DrugDetail,
  DrugSection,
  SectionKey,
} from '../types';

// 백엔드 의약품 검색 결과 데이터
export interface BackendMedicine {
  item_seq: string;
  item_name: string;
}

// 백엔드 의약품 검색 응답
export interface BackendMedicineSearchResponse {
  keyword: string;
  page: number;
  size: number;
  total_count: number;
  items: BackendMedicine[];
}

// 백엔드 의약품 데이터를 DrugSummary 형식으로 변환
export function mapMedicineToDrugSummary(
  medicine: BackendMedicine,
): DrugSummary {
  return {
    id: medicine.item_seq,
    name: medicine.item_name,
    company: '정보 미확인',
    ingredients: [],
    category: '정보 미확인',
  };
}

// 검색 결과 목록 변환
export function mapMedicineSearchResponse(
  response: BackendMedicineSearchResponse,
): DrugSummary[] {
  return response.items.map(mapMedicineToDrugSummary);
}

// 백엔드 의약품 상세 내용
export interface BackendMedicineContent {
  content_id: number;
  content_type: string;
  api_field: string;
  original_text: string;
  source_name: string;
  source_url: string | null;
  retrieved_at: string;
}

// 백엔드 의약품 상세 응답
export interface BackendMedicineDetailResponse {
  item_seq: string;
  item_name: string;
  created_at: string;
  updated_at: string;
  contents: BackendMedicineContent[];
}

// 백엔드 API 필드를 프론트엔드 SectionKey로 변환
const SECTION_FIELD_MAP: Record<string, SectionKey> = {
  efcyQesitm: 'efficacy',
  useMethodQesitm: 'usage',
  atpnWarnQesitm: 'warning',
  atpnQesitm: 'warning',
  intrcQesitm: 'interaction',
  seQesitm: 'sideEffect',
  depositMethodQesitm: 'storage',
};

// 섹션별 제목
const SECTION_TITLE_MAP: Record<SectionKey, string> = {
  efficacy: '효능·효과',
  usage: '용법·용량',
  warning: '사용상의 주의사항',
  interaction: '상호작용',
  sideEffect: '부작용',
  storage: '보관방법',
};

// 의약품 상세 데이터 변환
export function mapMedicineDetail(
  response: BackendMedicineDetailResponse,
): DrugDetail {
  const groupedContents = new Map<SectionKey, string[]>();

  for (const content of response.contents) {
    const sectionKey = SECTION_FIELD_MAP[content.api_field];

    if (!sectionKey || !content.original_text?.trim()) {
      continue;
    }

    const existing = groupedContents.get(sectionKey) ?? [];

    existing.push(content.original_text.trim());

    groupedContents.set(sectionKey, existing);
  }

  const sections: DrugSection[] = (
    Object.keys(SECTION_TITLE_MAP) as SectionKey[]
  ).map((key) => ({
    key,
    title: SECTION_TITLE_MAP[key],
    original: (groupedContents.get(key) ?? []).join('\n\n'),
  }));

  const firstContent = response.contents[0];

  return {
    id: response.item_seq,
    name: response.item_name,
    company: '정보 미확인',
    ingredients: [],
    category: '정보 미확인',
    sections,
    source: {
      name: firstContent?.source_name ?? '출처 미확인',
      url: firstContent?.source_url ?? undefined,
      retrievedAt:
        firstContent?.retrieved_at ?? new Date().toISOString(),
    },
  };
}

// AI 설명 API 응답의 근거자료
export interface BackendExplanationEvidence {
  api_field: string | null;
  original_text: string | null;
  source_name: string | null;
  source_url: string | null;
}

// AI 설명 API 응답
export interface BackendExplanationResponse {
  item_seq: string;
  item_name: string;
  question: string;
  intent: string | null;
  status: string;
  answer: string | null;
  evidence: BackendExplanationEvidence[];
  notice: string | null;
}

// 백엔드 API 필드를 프론트엔드 섹션 키로 변환
export function mapApiFieldToSectionKey(
  apiField: string | null,
): SectionKey | undefined {
  if (!apiField) return undefined;

  return SECTION_FIELD_MAP[apiField];
}

// 백엔드 근거자료를 프론트엔드 Citation으로 변환
export function mapExplanationEvidenceToCitations(
  evidence: BackendExplanationEvidence[],
): Citation[] {
  return evidence.flatMap((item) => {
    const sectionKey = mapApiFieldToSectionKey(item.api_field);

    if (!sectionKey || !item.original_text) {
      return [];
    }

    return [
      {
        sectionKey,
        quote: item.original_text,
      },
    ];
  });
}