const pad = (n: number) => String(n).padStart(2, '0');

/** 2026.11.14 15:20 형식 */
export const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** 문장 단위로 나눠 목록으로 보여줄 때 사용 */
export const toBullets = (text: string) => text.split(/(?<=[.!?])\s+/).filter(Boolean);
