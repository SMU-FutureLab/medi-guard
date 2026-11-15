import { createContext, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import type { DrugSummary } from '../types';

// 이 기기(브라우저)에만 저장되는 사용자 데이터: 함께 확인할 약, 관심 의약품, 조회 기록
// 로그인 기능이 생기면 백엔드 저장으로 바꾸면 된다.

export interface HistoryEntry {
  drug: DrugSummary;
  viewedAt: string;
}

export interface DrugList {
  items: DrugSummary[];
  has: (id: string) => boolean;
  add: (drug: DrugSummary) => void;
  remove: (id: string) => void;
  toggle: (drug: DrugSummary) => void;
  clear: () => void;
}

interface AppStoreValue {
  medList: DrugList;
  favorites: DrugList;
  history: HistoryEntry[];
  recordView: (drug: DrugSummary) => void;
  removeHistory: (id: string) => void;
  clearHistory: () => void;
}

const MAX_HISTORY = 30;
const AppStoreContext = createContext<AppStoreValue | null>(null);

function usePersisted<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* 저장 불가 환경(시크릿 모드 등)에서는 무시 */
    }
  }, [key, value]);
  return [value, setValue] as const;
}

export const toSummary = ({ id, name, company, ingredients, category, form, classification, strength }: DrugSummary): DrugSummary => ({
  id,
  name,
  company,
  ingredients,
  category,
  form,
  classification,
  strength,
});

function makeList(items: DrugSummary[], set: Dispatch<SetStateAction<DrugSummary[]>>): DrugList {
  return {
    items,
    has: (id) => items.some((d) => d.id === id),
    add: (drug) => set((prev) => (prev.some((d) => d.id === drug.id) ? prev : [...prev, toSummary(drug)])),
    remove: (id) => set((prev) => prev.filter((d) => d.id !== id)),
    toggle: (drug) =>
      set((prev) => (prev.some((d) => d.id === drug.id) ? prev.filter((d) => d.id !== drug.id) : [...prev, toSummary(drug)])),
    clear: () => set([]),
  };
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [medItems, setMedItems] = usePersisted<DrugSummary[]>('mediguard.medList', []);
  const [favItems, setFavItems] = usePersisted<DrugSummary[]>('mediguard.favorites', []);
  const [history, setHistory] = usePersisted<HistoryEntry[]>('mediguard.history', []);

  const value = useMemo<AppStoreValue>(
    () => ({
      medList: makeList(medItems, setMedItems),
      favorites: makeList(favItems, setFavItems),
      history,
      recordView: (drug) =>
        setHistory((prev) =>
          [{ drug: toSummary(drug), viewedAt: new Date().toISOString() }, ...prev.filter((h) => h.drug.id !== drug.id)].slice(
            0,
            MAX_HISTORY,
          ),
        ),
      removeHistory: (id) => setHistory((prev) => prev.filter((h) => h.drug.id !== id)),
      clearHistory: () => setHistory([]),
    }),
    [medItems, favItems, history, setMedItems, setFavItems, setHistory],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext);
  if (!ctx) throw new Error('useAppStore must be used inside AppStoreProvider');
  return ctx;
}
