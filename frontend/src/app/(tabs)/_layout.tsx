import { Tabs } from 'expo-router';
import { TABS } from '../../components/TopTabs';
import { useTheme } from '../../theme/theme';

/** 탭 구성. 기본 하단 탭바는 숨기고, 각 화면 상단 바 아래에 글자 탭(TopTabs)을 둔다. */
export default function TabLayout() {
  const { c } = useTheme();
  return (
    <Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.bg } }} tabBar={() => null}>
      {TABS.map((t) => (
        <Tabs.Screen key={t.name} name={t.name} options={{ title: t.title }} />
      ))}
    </Tabs>
  );
}
