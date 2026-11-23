// 백엔드(FastAPI, /api/v1) 응답 → 프론트 화면용 형식(types.ts)으로 바꾸는 변환 코드.
// 백엔드 필드 이름이 바뀌면 이 파일만 고치면 된다. 정리 문서: docs/api-integration-checklist.md
import type { AskResponse, Citation, DrugDetail, DrugSection, DrugSummary, SectionKey, Source } from '../types';

/* ───────── 백엔드 응답 형식 ───────── */

/** 검색 결과 한 줄 (entp_name·item_image는 백엔드에 추가 요청한 필드라 없을 수 있음) */
export interface BeMedicineItem {
  item_seq: string;
  item_name: string;
  entp_name?: string | null;
  item_image?: string | null;
}

export interface BeSearchResponse {
  keyword: string;
  page: number;
  size: number;
  total_count: number;
  items: BeMedicineItem[];
}

export interface BeContent {
  content_id: number;
  /** EFFICACY | USAGE | WARNING | PRECAUTION | INTERACTION | SIDE_EFFECT | STORAGE */
  content_type: string;
  /** 식약처 e약은요 API 필드 이름 (예: efcyQesitm) */
  api_field: string;
  original_text: string;
  source_name: string;
  source_url: string | null;
  retrieved_at: string;
}

export interface BeMedicineDetail extends BeMedicineItem {
  created_at?: string;
  updated_at?: string;
  contents: BeContent[];
}

export interface BeEvidence {
  api_field: string | null;
  original_text: string | null;
  source_name?: string | null;
  source_url?: string | null;
}

export interface BeExplanationResponse {
  item_seq: string;
  item_name: string;
  question: string;
  intent: string | null;
  /** answered | no_results | insufficient_evidence | generation_failed | (복용량 검증 상태) */
  status: string;
  answer: string | null;
  evidence: BeEvidence[];
  notice?: string | null;
}

/* ───────── 항목 대응표 ───────── */

/** 백엔드 content_type → 프론트 항목. 경고(WARNING)와 주의사항(PRECAUTION)은 한 칸으로 합친다 */
const TYPE_TO_KEY: Record<string, SectionKey> = {
  EFFICACY: 'efficacy',
  USAGE: 'usage',
  WARNING: 'warning',
  PRECAUTION: 'warning',
  INTERACTION: 'interaction',
  SIDE_EFFECT: 'sideEffect',
  STORAGE: 'storage',
};

/** 식약처 API 필드 → 프론트 항목 (질문 답변의 근거 표시에 사용) */
const FIELD_TO_KEY: Record<string, SectionKey> = {
  efcyQesitm: 'efficacy',
  useMethodQesitm: 'usage',
  atpnWarnQesitm: 'warning',
  atpnQesitm: 'warning',
  intrcQesitm: 'interaction',
  seQesitm: 'sideEffect',
  depositMethodQesitm: 'storage',
};

export const SECTION_TITLES: Record<SectionKey, string> = {
  efficacy: '효능·효과',
  usage: '용법·용량',
  warning: '사용상의 주의사항',
  interaction: '상호작용',
  sideEffect: '부작용',
  storage: '보관방법',
};

const SECTION_ORDER: SectionKey[] = ['efficacy', 'usage', 'warning', 'interaction', 'sideEffect', 'storage'];

/* ───────── 변환 ───────── */

const PHOTO_SOURCE = '식약처 의약품개요정보(e약은요)';

export function toDrugSummary(item: BeMedicineItem): DrugSummary {
  return {
    id: item.item_seq,
    name: item.item_name,
    company: item.entp_name ?? '',
    // e약은요 데이터에는 주성분이 없어서 비워 둔다 (화면은 비어 있으면 숨김)
    ingredients: [],
    // e약은요는 일반의약품 위주라 기본값을 일반의약품으로 둔다
    category: '일반의약품',
    imageUrl: item.item_image ?? undefined,
  };
}

export function toSearchResults(res: BeSearchResponse): DrugSummary[] {
  return res.items.map(toDrugSummary);
}

/** 원문 출처 링크: 사람이 볼 수 있는 의약품안전나라 상세 페이지로 바꾼다 (API 주소는 눌러도 볼 수 없음) */
export const nedrugUrl = (itemSeq: string) => `https://nedrug.mfds.go.kr/pbp/CCBBB01/getItemDetail?itemSeq=${encodeURIComponent(itemSeq)}`;

export function toDrugDetail(res: BeMedicineDetail): DrugDetail {
  // 같은 항목(경고+주의사항)은 원문을 이어 붙인다
  const byKey = new Map<SectionKey, string[]>();
  for (const c of [...res.contents].sort((a, b) => a.content_id - b.content_id)) {
    const key = TYPE_TO_KEY[c.content_type] ?? FIELD_TO_KEY[c.api_field];
    if (!key || !c.original_text?.trim()) continue;
    byKey.set(key, [...(byKey.get(key) ?? []), c.original_text.trim()]);
  }
  const sections: DrugSection[] = SECTION_ORDER.filter((k) => byKey.has(k)).map((key) => ({
    key,
    title: SECTION_TITLES[key],
    original: byKey.get(key)!.join('\n'),
  }));

  const first = res.contents[0];
  const source: Source = {
    name: first?.source_name ? `${first.source_name} 의약품개요정보(e약은요)` : '식품의약품안전처 의약품개요정보(e약은요)',
    url: nedrugUrl(res.item_seq),
    retrievedAt: first?.retrieved_at ?? res.updated_at ?? new Date().toISOString(),
  };

  return {
    ...toDrugSummary(res),
    sections,
    source,
    images: res.item_image ? [{ kind: 'pill', url: res.item_image, source: PHOTO_SOURCE }] : undefined,
  };
}

function toCitations(evidence: BeEvidence[]): Citation[] {
  const seen = new Set<string>();
  const out: Citation[] = [];
  for (const e of evidence) {
    const quote = e.original_text?.trim();
    const key = e.api_field ? FIELD_TO_KEY[e.api_field] : undefined;
    if (!quote || !key || seen.has(quote)) continue;
    seen.add(quote);
    out.push({ sectionKey: key, quote });
  }
  return out;
}

/**
 * Gemini 답변(마크다운) → 앱에서 보여줄 글.
 * - "안녕하세요… / …안내해 드립니다." 같은 인사말 줄은 뺀다
 * - "**1. 질문에 대한 핵심 설명**" 같은 제목 줄은 "# 제목" 으로 (화면에서 작은 소제목으로 표시)
 * - "* 항목" 글머리표와 ** 굵게 표시는 걷어낸다
 */
export function cleanAnswer(raw: string): string {
  return raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    // 빈 줄, 구분선(---), 인사말 줄은 뺀다
    .filter((l) => l && !/^[-*_]{3,}$/.test(l) && !/^안녕하세요|문의하신 내용|안내해 ?드립니다\.?$/.test(l))
    .map((l) => {
      const heading = l.match(/^#{1,6}\s*(.+)$/) ?? l.match(/^\*\*\s*(\d+\.\s*.+?)\s*\*\*$/);
      if (heading) return `# ${heading[1].replace(/\*\*/g, '').replace(/^\d+\.\s*/, '').trim()}`;
      return l
        .replace(/^[*\-•]\s+/, '')
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*\*/g, '')
        .trim();
    })
    .filter(Boolean)
    // 소제목이 있으면 첫 소제목 앞(인사말·도입 문장)은 모두 뺀다
    .filter((_, i, all) => {
      const first = all.findIndex((l) => l.startsWith('# '));
      return first < 0 || i >= first;
    })
    .join('\n');
}

/** 정리된 답변에서 첫 소제목(핵심 설명) 아래 내용만 꺼낸다. 항목별 쉬운 설명에 사용 */
export function coreOfAnswer(cleaned: string): string {
  const lines = cleaned.split('\n');
  const start = lines.findIndex((l) => l.startsWith('# '));
  if (start < 0) return cleaned;
  const end = lines.findIndex((l, i) => i > start && l.startsWith('# '));
  return lines
    .slice(start + 1, end < 0 ? undefined : end)
    // "효능·효과: …" 처럼 앞에 붙은 항목 이름은 화면 제목과 겹쳐서 뺀다
    .map((l) => l.replace(/^[^:：]{1,15}[:：]\s*/, ''))
    .join('\n');
}

const NOT_FOUND ='공식 의약품 정보에서 이 질문과 관련된 내용을 찾지 못했어요. 정확한 답변은 의사 또는 약사에게 문의해 주세요.';
const FAILED = 'AI 설명을 만드는 중 문제가 생겼어요. 공식 원문을 직접 확인하거나 잠시 후 다시 질문해 주세요.';

/** 질문 답변: status가 answered일 때만 답을 보여주고, 나머지는 안내 문구를 보여준다 */
export function toAskResponse(res: BeExplanationResponse): AskResponse {
  if (res.status === 'answered' && res.answer) {
    return { answerable: true, answer: cleanAnswer(res.answer), citations: toCitations(res.evidence ?? []), notice: res.notice ?? undefined };
  }
  const fallback = res.status === 'generation_failed' ? FAILED : NOT_FOUND;
  return { answerable: false, answer: res.notice?.trim() || fallback, citations: [] };
}

/** FastAPI 에러 응답({ detail })이나 다른 형식에서 사용자에게 보여줄 문장을 꺼낸다 */
export function errorMessage(body: unknown): string | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const b = body as { message?: unknown; detail?: unknown };
  if (typeof b.message === 'string') return b.message;
  if (typeof b.detail === 'string') return b.detail;
  // 422 검증 오류: [{ msg, loc, ... }]
  if (Array.isArray(b.detail)) return '입력한 내용을 다시 확인해 주세요.';
  return undefined;
}
