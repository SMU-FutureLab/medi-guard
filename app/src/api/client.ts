import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
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
/**
 * 웹 개발 중에는 같은 주소('')로 부르고 개발 서버가 백엔드로 전달한다 (metro.config.js) → CORS 문제 없음.
 * 휴대폰 앱은 CORS 제한이 없어서 백엔드 주소로 직접 부른다.
 */
const BASE_URL = Platform.OS === 'web' && __DEV__ ? '' : (process.env.EXPO_PUBLIC_API_BASE_URL ?? '');

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
  // AI 호출이 많으니 결과를 저장해 두고 다시 쓴다 (cachedExplanations). 전용 API가 생기면 이 부분만 바꾸면 된다.
  explainDrug: (id) => cachedExplanations(id, () => fetchExplanations(id)),

  ask: async (id, question) => toAskResponse(await postExplanation(id, question)),

  // 백엔드에 DUR(병용금기·성분중복) API가 아직 없음
  checkInteractions: async () => {
    throw new ApiError('함께 먹는 약 확인 기능은 아직 준비 중이에요. 여러 약을 함께 먹는다면 약사에게 확인해 주세요.', 501);
  },
};

/* ───────── 항목별 쉬운 설명: 저장해 두고 다시 쓰기 ───────── */

const EXPLAIN_TTL = 7 * 24 * 60 * 60 * 1000; // 기기에 7일 보관
const explainKey = (id: string) => `mg:explain:v1:${id}`;
/** 지금 실행 중에 받은 설명 (같은 약을 다시 열거나 동시에 요청해도 한 번만 부름) */
const explainMemory = new Map<string, Promise<SectionExplanation[]>>();

async function cachedExplanations(id: string, load: () => Promise<SectionExplanation[]>): Promise<SectionExplanation[]> {
  const inMemory = explainMemory.get(id);
  if (inMemory) return inMemory;

  const job = (async () => {
    // 1) 기기에 저장된 설명이 있으면 그대로 사용
    try {
      const saved = await AsyncStorage.getItem(explainKey(id));
      if (saved) {
        const { at, data } = JSON.parse(saved) as { at: number; data: SectionExplanation[] };
        if (Date.now() - at < EXPLAIN_TTL && data.length > 0) return data;
      }
    } catch {
      // 저장소를 못 읽으면 새로 받는다
    }
    // 2) 없으면 AI에 요청하고, 하나라도 받았으면 저장
    const data = await load();
    if (data.length > 0) {
      AsyncStorage.setItem(explainKey(id), JSON.stringify({ at: Date.now(), data })).catch(() => {});
    }
    return data;
  })();

  explainMemory.set(id, job);
  // 실패했거나 비어 있으면 다음에 다시 시도할 수 있게 지운다
  job.then(
    (d) => d.length === 0 && explainMemory.delete(id),
    () => explainMemory.delete(id),
  );
  return job;
}

async function fetchExplanations(id: string): Promise<SectionExplanation[]> {
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
}

export const api: MediGuardApi = USE_MOCK ? mockApi : realApi;

/** 추천 검색어: 예시 데이터에 있는 약 / 실제 서버 DB에 있는 약 */
export const SUGGESTIONS = USE_MOCK
  ? ['타이레놀', '게보린', '이트라코나졸', '심바스타틴']
  : ['타이레놀', '게보린', '베아제', '훼스탈'];
