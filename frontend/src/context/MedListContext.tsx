import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { DrugSummary } from '../types';

// "상호작용 확인 목록": 사용자가 함께 확인하고 싶은 약을 모아 두는 곳 (이 브라우저에만 저장)
const STORAGE_KEY = 'mediguard.medList';

interface MedListValue {
  items: DrugSummary[];
  has: (id: string) => boolean;
  add: (drug: DrugSummary) => void;
  remove: (id: string) => void;
  clear: () => void;
}

const MedListContext = createContext<MedListValue | null>(null);

function load(): DrugSummary[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DrugSummary[]) : [];
  } catch {
    return [];
  }
}

export function MedListProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<DrugSummary[]>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* 저장 불가 환경(시크릿 모드 등)에서는 무시 */
    }
  }, [items]);

  const value = useMemo<MedListValue>(
    () => ({
      items,
      has: (id) => items.some((d) => d.id === id),
      add: (drug) => setItems((prev) => (prev.some((d) => d.id === drug.id) ? prev : [...prev, drug])),
      remove: (id) => setItems((prev) => prev.filter((d) => d.id !== id)),
      clear: () => setItems([]),
    }),
    [items],
  );

  return <MedListContext.Provider value={value}>{children}</MedListContext.Provider>;
}

export function useMedList() {
  const ctx = useContext(MedListContext);
  if (!ctx) throw new Error('useMedList must be used inside MedListProvider');
  return ctx;
}
