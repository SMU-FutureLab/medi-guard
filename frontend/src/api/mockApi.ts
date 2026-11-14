import type { AskResponse, DrugSummary, SectionKey } from '../types';
import type { MediGuardApi } from './client';
import { ApiError } from './errors';
import { DUR_SOURCE, MOCK_DRUGS, MOCK_EXPLANATIONS, MOCK_INTERACTIONS } from './mockData';

const delay = (ms = 400 + Math.random() * 400) => new Promise((r) => setTimeout(r, ms));

const toSummary = ({ id, name, company, ingredients, category }: DrugSummary): DrugSummary => ({
  id,
  name,
  company,
  ingredients,
  category,
});

function findDrug(id: string) {
  const drug = MOCK_DRUGS.find((d) => d.id === id);
  if (!drug) throw new ApiError('해당 의약품을 찾을 수 없어요.', 404);
  return drug;
}

// 질문 키워드 → 관련 항목 (실제 서비스에서는 백엔드 RAG 검색이 이 역할을 함)
const KEYWORDS: [RegExp, SectionKey][] = [
  [/술|알코올|음주|간 ?질환|간에/, 'warning'],
  [/같이|함께|병용|커피|자몽|주스|다른 약/, 'interaction'],
  [/몇 ?알|몇 ?번|하루|용량|얼마나|언제|간격|식후|식전/, 'usage'],
  [/부작용|증상|메스|구토|두드러기/, 'sideEffect'],
  [/보관|냉장|어디에 ?두/, 'storage'],
  [/효능|효과|무슨 약|어디에 ?써|왜 먹/, 'efficacy'],
];

export const mockApi: MediGuardApi = {
  async searchDrugs(query) {
    await delay();
    const q = query.trim().replace(/\s/g, '');
    if (!q) return [];
    return MOCK_DRUGS.filter(
      (d) => d.name.includes(q) || d.ingredients.some((i) => i.includes(q)) || d.company.includes(q),
    ).map(toSummary);
  },

  async getDrug(id) {
    await delay();
    return findDrug(id);
  },

  async explainDrug(id) {
    await delay(900);
    findDrug(id);
    return MOCK_EXPLANATIONS[id] ?? [];
  },

  async ask(id, question): Promise<AskResponse> {
    await delay(800);
    findDrug(id);
    const match = KEYWORDS.find(([re]) => re.test(question));
    const exp = match && MOCK_EXPLANATIONS[id]?.find((e) => e.sectionKey === match[1]);
    if (!exp) {
      return {
        answerable: false,
        answer:
          '공식 의약품 정보에서 이 질문과 관련된 내용을 찾지 못했어요. 정확한 답변은 의사 또는 약사에게 문의해 주세요.',
        citations: [],
      };
    }
    return { answerable: true, answer: exp.easyText, citations: exp.citations };
  },

  async checkInteractions(drugIds) {
    await delay(700);
    const ids = new Set(drugIds);
    const pairs = MOCK_INTERACTIONS.filter((p) => ids.has(p.a) && ids.has(p.b)).map(({ a, b, ...rest }) => ({
      ...rest,
      drugA: toSummary(findDrug(a)),
      drugB: toSummary(findDrug(b)),
      source: DUR_SOURCE,
    }));
    return { pairs, checkedAt: new Date().toISOString() };
  },
};
