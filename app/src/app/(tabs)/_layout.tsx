import { LinearGradient } from 'expo-linear-gradient';
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

/** 탭 구성. 기본 탭바는 숨기고, 화면 위에 떠 있는 유리 탭바를 직접 그린다. */
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

/** 반투명 유리 탭바. 선택된 탭은 빛나는 초록 구슬로 표시한다. */
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
            borderWidth: 1.5,
            borderColor: c.cardBorder,
            overflow: 'hidden',
            shadowColor: c.shadow,
            shadowOpacity: 0.16,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 12 },
            elevation: 8,
          },
          Platform.OS === 'web' ? ({ backdropFilter: 'blur(18px) saturate(160%)' } as object) : null,
        ]}
      >
        {/* 유리 윗면 반사광 */}
        <LinearGradient
          pointerEvents="none"
          colors={[c.barShine, 'rgba(255,255,255,0)']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '60%' }}
        />
        {TABS.map((t) => (
          <TabButton key={t.name} icon={t.icon} label={t.title} active={isActive(t.href)} onPress={() => router.navigate(t.href)} />
        ))}
      </View>
    </View>
  );
}

const SIZE = 54;

function TabButton({ icon, label, active, onPress }: { icon: IconName; label: string; active: boolean; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      aria-selected={active}
      onPress={onPress}
      style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.94 : 1 }] })}
    >
      {active ? (
        // 선택: 초록 그라데이션 구슬 + 빛 번짐 + 윗면 하이라이트 (입체감)
        <View
          style={{
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            shadowColor: c.orbTo,
            shadowOpacity: 0.55,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          }}
        >
          <LinearGradient
            colors={[c.orbFrom, c.orbTo]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={{ flex: 1, borderRadius: SIZE / 2, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.6)' }}
          >
            <View style={{ position: 'absolute', top: 5, width: SIZE * 0.55, height: SIZE * 0.26, borderRadius: SIZE, backgroundColor: 'rgba(255,255,255,0.45)' }} />
            <Icon name={icon} size={24} color="#ffffff" />
          </LinearGradient>
        </View>
      ) : (
        // 기본: 반투명 유리 원
        <View
          style={{
            width: SIZE,
            height: SIZE,
            borderRadius: SIZE / 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: c.barShine,
            borderWidth: 1,
            borderColor: c.cardBorder,
          }}
        >
          <Icon name={icon} size={23} color={c.muted} />
        </View>
      )}
    </Pressable>
  );
}
