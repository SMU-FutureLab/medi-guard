import { Tabs, usePathname, useRouter, type Href } from 'expo-router';
import { Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RoundButton } from '../../components/art';
import type { IconName } from '../../components/Icon';
import { radius, shadow, useTheme } from '../../theme/theme';

const TABS: { name: string; href: Href; title: string; icon: IconName }[] = [
  { name: 'index', href: '/', title: '홈', icon: 'home' },
  { name: 'search', href: '/search', title: '검색', icon: 'search' },
  { name: 'history', href: '/history', title: '기록', icon: 'record' },
  { name: 'my', href: '/my', title: '마이', icon: 'user' },
];

/** 탭 구성. 기본 탭바는 숨기고, 화면 위에 떠 있는 알약형 탭바를 직접 그린다. */
export default function TabLayout() {
  const { c } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: c.bg } }} tabBar={() => null}>
        {TABS.map((t) => (
          <Tabs.Screen key={t.name} name={t.name} options={{ title: t.title }} />
        ))}
      </Tabs>
      <FloatingTabBar />
    </View>
  );
}

function FloatingTabBar() {
  const { c, dark } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const isActive = (href: Href) => (href === '/' ? pathname === '/' : pathname.startsWith(String(href)));

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: Math.max(insets.bottom, 14), alignItems: 'center' }}>
      <View
        accessibilityRole="tablist"
        style={[
          {
            flexDirection: 'row',
            gap: 10,
            padding: 8,
            borderRadius: radius.pill,
            backgroundColor: dark ? 'rgba(28,37,32,0.92)' : 'rgba(255,255,255,0.9)',
            borderWidth: 1,
            borderColor: c.line,
          },
          Platform.OS === 'web' ? ({ backdropFilter: 'blur(14px)' } as object) : null,
          shadow(c, 2),
        ]}
      >
        {TABS.map((t) => {
          const active = isActive(t.href);
          return (
            <RoundButton
              key={t.name}
              icon={t.icon}
              label={t.title}
              size={52}
              active={active}
              variant={active ? 'ink' : 'soft'}
              onPress={() => router.navigate(t.href)}
            />
          );
        })}
      </View>
    </View>
  );
}
