import { useRouter, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { GradientPanel, Mascot } from '../../components/art';
import { Icon, type IconName } from '../../components/Icon';
import { BarTitle, Card, ListRow, Row, Screen, T } from '../../components/ui';
import { useAppStore } from '../../store/AppStore';
import { fonts, radius, useTheme } from '../../theme/theme';

export default function MyScreen() {
  const { c } = useTheme();
  const router = useRouter();
  const { favorites, history, medList } = useAppStore();

  // 내 약 보관함: 이 기기에 모아 둔 것들의 개수 (누르면 해당 화면으로)
  const stats: { href: Href; icon: IconName; label: string; n: number }[] = [
    { href: '/favorites', icon: 'bookmark', label: '관심 의약품', n: favorites.items.length },
    { href: '/history', icon: 'clock', label: '조회 기록', n: history.length },
    { href: '/interactions', icon: 'pill', label: '함께 먹는 약', n: medList.items.length },
  ];

  const rows: { href: Href; icon: IconName; label: string }[] = [
    { href: '/about', icon: 'info', label: '서비스 안내' },
    { href: '/faq', icon: 'help', label: '자주 묻는 질문 (FAQ)' },
  ];

  return (
    <Screen tabs header={<BarTitle icon="user" title="마이페이지" />}>
      <GradientPanel style={{ gap: 16 }}>
        <Row gap={12}>
          <View style={{ flex: 1, gap: 4, zIndex: 1 }}>
            <T v="h2" color={c.onBlock}>
              내 약 보관함
            </T>
            <T v="small" color={c.onBlockMuted} style={{ fontFamily: fonts.regular }}>
              로그인 없이 이 기기에만 저장돼요
            </T>
          </View>
          <Mascot size={64} />
        </Row>
        <Row gap={8} style={{ alignItems: 'stretch' }}>
          {stats.map((s) => (
            <Pressable
              key={s.label}
              accessibilityRole="button"
              accessibilityLabel={`${s.label} ${s.n}개`}
              onPress={() => router.push(s.href)}
              style={({ pressed }) => ({ flex: 1, gap: 6, paddingVertical: 12, paddingHorizontal: 12, borderRadius: radius.md, backgroundColor: pressed ? c.surface : c.glass })}
            >
              {({ pressed }) => (
                <>
                  <Icon name={s.icon} size={18} color={pressed ? c.primaryStrong : c.onBlock} />
                  <Text style={{ fontFamily: fonts.display, fontSize: 22, lineHeight: 26, color: pressed ? c.text : c.onBlock }}>{s.n}</Text>
                  <Text style={{ fontFamily: fonts.medium, fontSize: 12, lineHeight: 16, color: pressed ? c.text2 : c.onBlockMuted }} numberOfLines={1}>
                    {s.label}
                  </Text>
                </>
              )}
            </Pressable>
          ))}
        </Row>
      </GradientPanel>

      <Card padded={false} style={{ padding: 4, gap: 0, borderRadius: radius.lg }}>
        {rows.map((r, i) => (
          <ListRow key={r.label} icon={r.icon} label={r.label} last={i === rows.length - 1} onPress={() => router.push(r.href)} />
        ))}
      </Card>
    </Screen>
  );
}
