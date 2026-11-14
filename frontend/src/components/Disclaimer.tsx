export function Disclaimer({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="disclaimer-compact">
        MEDI GUARD는 공식 의약품 정보의 이해를 돕는 보조 서비스이며, 의사·약사의 진료나 복약지도를 대신하지 않습니다.
      </p>
    );
  }
  return (
    <aside className="disclaimer" role="note">
      <strong>꼭 확인하세요</strong>
      <p>
        AI 설명은 공식 의약품 정보를 쉬운 말로 바꾼 것으로, 안전 여부를 판단하지 않습니다. 복용을 시작하거나 멈추기
        전에는 반드시 의사 또는 약사와 상담하세요.
      </p>
    </aside>
  );
}
