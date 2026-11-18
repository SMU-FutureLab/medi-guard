import { useRouter, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { GradientPanel, Mascot } from '../../components/art';
import { DrugCard } from '../../components/drug';
import { Icon, type IconName } from '../../components/Icon';
import { BarTitle, Card, ListRow, Row, Screen, T } from '../../components/ui';
import { useAppStore } from '../../store/AppStore';
import { fonts, glass, radius, useTheme } from '../../theme/theme';
import { formatDateTime } from '../../utils';

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

      {/* 조회 기록: 최근 3개만 보여주고 전체는 조회 기록 화면에서 */}
      <View style={{ gap: 10 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <T v="h3">최근 본 의약품</T>
          {history.length > 0 && (
            <Pressable onPress={() => router.push('/history')} style={[glass(c), { borderRadius: radius.pill, paddingVertical: 5, paddingHorizontal: 12 }]}>
              <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: c.text2 }}>전체 보기</Text>
            </Pressable>
          )}
        </Row>
        {history.length === 0 ? (
          <View style={[glass(c), { borderRadius: radius.lg, paddingVertical: 20, paddingHorizontal: 20, alignItems: 'center', gap: 4 }]}>
            <T v="small" color={c.muted}>
              아직 조회한 의약품이 없어요.
            </T>
          </View>
        ) : (
          history.slice(0, 3).map((h) => <DrugCard key={h.drug.id} drug={h.drug} sub={`조회일 ${formatDateTime(h.viewedAt)}`} showTags={false} />)
        )}
      </View>

      <Card padded={false} style={{ padding: 4, gap: 0, borderRadius: radius.lg }}>
        {rows.map((r, i) => (
          <ListRow key={r.label} icon={r.icon} label={r.label} last={i === rows.length - 1} onPress={() => router.push(r.href)} />
        ))}
      </Card>
    </Screen>
  );
}
