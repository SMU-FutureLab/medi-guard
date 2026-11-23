const pad = (n: number) => String(n).padStart(2, '0');

/** 2026.11.14 15:20 형식 */
export const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** 두 글자열이 몇 글자 다른지 (오타 비교용, 레벤슈타인 거리) */
export function editDistance(a: string, b: string) {
  const dp = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return dp[b.length];
}

/** 검색어 비교용: 띄어쓰기·괄호 내용 제거 */
export const normalizeName = (s: string) => s.replace(/\(.*?\)/g, '').replace(/\s/g, '');

/** 문장 단위로 나눠 목록으로 보여줄 때 사용 */
export const toBullets = (text: string) => text.split(/(?<=[.!?])\s+/).filter(Boolean);
