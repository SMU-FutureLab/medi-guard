// 조회 기록: 마이페이지 안의 하위 화면 (상단 탭에는 없음)
import { Pressable } from 'react-native';
import { DrugCard } from '../components/drug';
import { Button, Empty, PageTop, Screen, T } from '../components/ui';
import { useAppStore } from '../store/AppStore';
import { useTheme } from '../theme/theme';
import { formatDateTime } from '../utils';

export default function HistoryScreen() {
  const { c } = useTheme();
  const { history, clearHistory } = useAppStore();

  return (
    <Screen header={<PageTop title="조회 기록" />}>
      <T color={c.muted}>최근에 검색한 의약품을 확인할 수 있어요.</T>
      {history.length === 0 ? (
        <Empty title="아직 조회한 의약품이 없어요." action={<Button label="의약품 검색하기" icon="search" href="/search" />} />
      ) : (
        <>
          {history.map((h) => (
            <DrugCard key={h.drug.id} drug={h.drug} sub={`조회일 ${formatDateTime(h.viewedAt)}`} showTags={false} />
          ))}
          <Pressable onPress={clearHistory} accessibilityRole="button">
            <T v="small" color={c.muted} style={{ textDecorationLine: 'underline' }}>
              조회 기록 모두 지우기
            </T>
          </Pressable>
          <T v="small" color={c.muted}>
            조회 기록은 이 기기에만 저장돼요.
          </T>
        </>
      )}
    </Screen>
  );
}
