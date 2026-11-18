// 상단 탭: 홈 · 검색 · 기록 · 마이
// 글자만 있는 탭. 선택된 탭은 굵은 글씨 + 초록 밑줄, 누르거나 마우스를 올리면 옅은 둥근 배경.
import { usePathname, useRouter, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { fonts, radius, useTheme } from '../theme/theme';

export const TABS: { name: string; href: Href; title: string }[] = [
  { name: 'index', href: '/', title: '홈' },
  { name: 'search', href: '/search', title: '검색' },
  { name: 'history', href: '/history', title: '기록' },
  { name: 'my', href: '/my', title: '마이' },
];

export function TopTabs() {
  const { c } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const isActive = (href: Href) => (href === '/' ? pathname === '/' : pathname.startsWith(String(href)));

  return (
    <View accessibilityRole="tablist" style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
      {TABS.map((t) => {
        const active = isActive(t.href);
        return (
          <Pressable
            key={t.name}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            aria-selected={active}
            onPress={() => router.navigate(t.href)}
            style={(state) => {
              const hovered = (state as { hovered?: boolean }).hovered;
              return {
                paddingHorizontal: 12,
                paddingTop: 8,
                paddingBottom: 10,
                borderRadius: radius.md,
                backgroundColor: !active && (state.pressed || hovered) ? c.surface2 : 'transparent',
              };
            }}
          >
            <Text style={{ fontFamily: active ? fonts.bold : fonts.medium, fontSize: 16, color: active ? c.text : c.muted }}>{t.title}</Text>
            <View style={{ position: 'absolute', left: 12, right: 12, bottom: 2, height: 2.5, borderRadius: 2, backgroundColor: active ? c.primaryStrong : 'transparent' }} />
          </Pressable>
        );
      })}
    </View>
  );
}
