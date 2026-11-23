import type {
  AskResponse,
  DrugDetail,
  DrugSummary,
  InteractionResult,
  SectionExplanation,
  SectionKey,
} from '../types';
import {
  coreOfAnswer,
  errorMessage,
  toAskResponse,
  toDrugDetail,
  toSearchResults,
  type BeExplanationResponse,
  type BeMedicineDetail,
  type BeSearchResponse,
} from './adapter';
import { ApiError } from './errors';
import { mockApi } from './mockApi';

export { ApiError };
export const USE_MOCK = (process.env.EXPO_PUBLIC_USE_MOCK ?? 'true') !== 'false';
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new ApiError('서버에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(errorMessage(body) ?? `요청에 실패했어요. (${res.status})`, res.status);
  }
  return res.json() as Promise<T>;
}

export interface MediGuardApi {
  searchDrugs(query: string): Promise<DrugSummary[]>;
  getDrug(id: string): Promise<DrugDetail>;
  explainDrug(id: string): Promise<SectionExplanation[]>;
  ask(id: string, question: string): Promise<AskResponse>;
  checkInteractions(drugIds: string[]): Promise<InteractionResult>;
}

/** 백엔드 질문 API (POST /api/v1/explanations) */
const postExplanation = (itemSeq: string, question: string) =>
  request<BeExplanationResponse>('/api/v1/explanations', {
    method: 'POST',
    body: JSON.stringify({ item_seq: itemSeq, question }),
  });

/** 항목별 쉬운 설명을 받을 때 항목마다 보내는 질문 */
const SECTION_QUESTIONS: Record<SectionKey, string> = {
  efficacy: '이 약의 효능과 효과를 쉬운 말로 설명해 주세요.',
  usage: '이 약의 용법과 사용법을 쉬운 말로 설명해 주세요.',
  warning: '이 약을 먹을 때 주의할 점을 쉬운 말로 설명해 주세요.',
  interaction: '이 약과 함께 먹으면 안 되는 약이나 음식을 쉬운 말로 설명해 주세요.',
  sideEffect: '이 약의 부작용을 쉬운 말로 설명해 주세요.',
  storage: '이 약의 보관 방법을 쉬운 말로 설명해 주세요.',
};

/** 실제 백엔드(FastAPI) 연결. 응답 형식 변환은 adapter.ts */
const realApi: MediGuardApi = {
  searchDrugs: async (query) =>
    toSearchResults(await request<BeSearchResponse>(`/api/v1/medicines?keyword=${encodeURIComponent(query)}&size=30`)),

  getDrug: async (id) => toDrugDetail(await request<BeMedicineDetail>(`/api/v1/medicines/${encodeURIComponent(id)}`)),

  // 백엔드에 항목별 설명 API가 아직 없어서, 질문 API를 항목마다 동시에 불러 만든다.
  // 백엔드에 전용 API가 생기면 이 부분만 바꾸면 된다.
  explainDrug: async (id) => {
    const drug = await realApi.getDrug(id);
    const results = await Promise.all(
      drug.sections.map(async (s): Promise<SectionExplanation | null> => {
        try {
          const res = toAskResponse(await postExplanation(id, SECTION_QUESTIONS[s.key]));
          return res.answerable ? { sectionKey: s.key, easyText: coreOfAnswer(res.answer), citations: res.citations } : null;
        } catch {
          return null; // 한 항목이 실패해도 나머지는 보여준다 (실패한 항목은 화면에서 안내 문구)
        }
      }),
    );
    return results.filter((r): r is SectionExplanation => r !== null);
  },

  ask: async (id, question) => toAskResponse(await postExplanation(id, question)),

  // 백엔드에 DUR(병용금기·성분중복) API가 아직 없음
  checkInteractions: async () => {
    throw new ApiError('함께 먹는 약 확인 기능은 아직 준비 중이에요. 여러 약을 함께 먹는다면 약사에게 확인해 주세요.', 501);
  },
};

export const api: MediGuardApi = USE_MOCK ? mockApi : realApi;
