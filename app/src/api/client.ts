import type {
  AskResponse,
  DrugDetail,
  DrugSummary,
  InteractionResult,
  SectionExplanation,
} from '../types';
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
    throw new ApiError(body?.message ?? `요청에 실패했어요. (${res.status})`, res.status);
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

const realApi: MediGuardApi = {
  searchDrugs: (query) => request(`/api/drugs?query=${encodeURIComponent(query)}`),
  getDrug: (id) => request(`/api/drugs/${encodeURIComponent(id)}`),
  explainDrug: (id) =>
    request(`/api/drugs/${encodeURIComponent(id)}/explanations`, { method: 'POST' }),
  ask: (id, question) =>
    request(`/api/drugs/${encodeURIComponent(id)}/ask`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    }),
  checkInteractions: (drugIds) =>
    request('/api/interactions', { method: 'POST', body: JSON.stringify({ drugIds }) }),
};

export const api: MediGuardApi = USE_MOCK ? mockApi : realApi;
