import { Tabs, usePathname, useRouter, type Href } from 'expo-router';
import { Platform, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from '../../components/Icon';
import { radius, useTheme } from '../../theme/theme';

const TABS: { name: string; href: Href; title: string; icon: IconName }[] = [
  { name: 'index', href: '/', title: '홈', icon: 'home' },
  { name: 'search', href: '/search', title: '검색', icon: 'search' },
  { name: 'history', href: '/history', title: '기록', icon: 'record' },
  { name: 'my', href: '/my', title: '마이', icon: 'user' },
];

/** 탭 구성. 기본 탭바는 숨기고, 화면 위에 떠 있는 반투명 탭바를 직접 그린다. */
export default function TabLayout() {
  const { c } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Tabs screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: 'transparent' } }} tabBar={() => null}>
        {TABS.map((t) => (
          <Tabs.Screen key={t.name} name={t.name} options={{ title: t.title }} />
        ))}
      </Tabs>
      <FloatingTabBar />
    </View>
  );
}

/** 반투명 유리 탭바. 선택된 탭은 진한 원, 나머지는 반투명 원. */
function FloatingTabBar() {
  const { c } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const isActive = (href: Href) => (href === '/' ? pathname === '/' : pathname.startsWith(String(href)));

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: Math.max(insets.bottom, 16), alignItems: 'center' }}>
      <View
        accessibilityRole="tablist"
        style={[
          {
            flexDirection: 'row',
            gap: 10,
            padding: 8,
            borderRadius: radius.pill,
            backgroundColor: c.barGlass,
            borderWidth: 1,
            borderColor: c.cardBorder,
            shadowColor: c.shadow,
            shadowOpacity: 0.1,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 8 },
            elevation: 6,
          },
          Platform.OS === 'web' ? ({ backdropFilter: 'blur(18px) saturate(160%)' } as object) : null,
        ]}
      >
        {TABS.map((t) => {
          const active = isActive(t.href);
          return (
            <Pressable
              key={t.name}
              accessibilityRole="tab"
              accessibilityLabel={t.title}
              accessibilityState={{ selected: active }}
              aria-selected={active}
              onPress={() => router.navigate(t.href)}
              style={({ pressed }) => ({
                width: 52,
                height: 52,
                borderRadius: 26,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: active ? c.ink : c.barShine,
                borderWidth: active ? 0 : 1,
                borderColor: c.cardBorder,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Icon name={t.icon} size={23} color={active ? c.onInk : c.muted} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
