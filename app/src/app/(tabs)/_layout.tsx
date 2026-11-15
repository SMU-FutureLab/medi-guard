import { Tabs } from 'expo-router';
import { Icon, type IconName } from '../../components/Icon';
import { fonts, useTheme } from '../../theme/theme';

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: 'index', title: '홈', icon: 'home' },
  { name: 'search', title: '검색', icon: 'search' },
  { name: 'history', title: '기록', icon: 'record' },
  { name: 'my', title: '마이', icon: 'user' },
];

/** 하단 탭바: 홈 · 검색 · 기록 · 마이 */
export default function TabLayout() {
  const { c } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primaryStrong,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { backgroundColor: c.surface, borderTopColor: c.line },
        tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 11 },
        sceneStyle: { backgroundColor: c.bg },
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ color }) => <Icon name={t.icon} size={24} color={String(color)} />,
          }}
        />
      ))}
    </Tabs>
  );
}
