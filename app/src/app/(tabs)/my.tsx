import { useRouter, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { GradientPanel, Mascot } from '../../components/art';
import { Thumb } from '../../components/drug';
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

      {/* 한 카드 안에: 최근 본 의약품(최대 3개) → 구분선 → 서비스 안내·FAQ */}
      <Card padded={false} style={{ padding: 4, gap: 0, borderRadius: radius.lg }}>
        <Row style={{ justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4 }}>
          <T v="label" style={{ fontFamily: fonts.semibold }}>
            최근 본 의약품
          </T>
          {history.length > 0 && (
            <Pressable onPress={() => router.push('/history')} accessibilityRole="link" hitSlop={8}>
              {({ pressed }) => (
                <Row gap={2}>
                  <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: pressed ? c.primaryStrong : c.text2 }}>전체 보기</Text>
                  <Icon name="chevronRight" size={14} color={pressed ? c.primaryStrong : c.text2} />
                </Row>
              )}
            </Pressable>
          )}
        </Row>

        {history.length === 0 ? (
          <View style={{ paddingVertical: 14, paddingHorizontal: 14 }}>
            <T v="small" color={c.muted}>
              아직 조회한 의약품이 없어요.
            </T>
          </View>
        ) : (
          history.slice(0, 3).map((h) => (
            <Pressable
              key={h.drug.id}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/drugs/[id]', params: { id: h.drug.id } })}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                paddingVertical: 10,
                paddingHorizontal: 14,
                borderRadius: 14,
                backgroundColor: pressed ? c.surface3 : 'transparent',
              })}
            >
              <Thumb uri={h.drug.imageUrl} size={36} />
              <View style={{ flex: 1 }}>
                <T v="bodyBold" style={{ fontSize: 15, lineHeight: 21 }} numberOfLines={1}>
                  {h.drug.name}
                </T>
                <T v="label" style={{ fontFamily: fonts.regular, fontSize: 12, lineHeight: 16 }}>
                  조회일 {formatDateTime(h.viewedAt)}
                </T>
              </View>
              <Icon name="chevronRight" color={c.muted} />
            </Pressable>
          ))
        )}

        {/* 구역 구분선 */}
        <View style={{ height: 1, backgroundColor: c.line, marginHorizontal: 14, marginVertical: 6 }} />

        {rows.map((r, i) => (
          <ListRow key={r.label} icon={r.icon} label={r.label} last={i === rows.length - 1} onPress={() => router.push(r.href)} />
        ))}
      </Card>
    </Screen>
  );
}
