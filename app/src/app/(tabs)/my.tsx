import { useRouter, type Href } from 'expo-router';
import { View } from 'react-native';
import { Icon, type IconName } from '../../components/Icon';
import { Card, ListRow, Row, Screen, T, TitleBlock } from '../../components/ui';
import { useAppStore } from '../../store/AppStore';
import { fonts, radius, useTheme } from '../../theme/theme';

export default function MyScreen() {
  const { c } = useTheme();
  const router = useRouter();
  const { favorites, history, medList } = useAppStore();

  const count = (n: number) =>
    n > 0 ? (
      <Row gap={8}>
        <View style={{ minWidth: 26, paddingHorizontal: 9, paddingVertical: 1, borderRadius: radius.pill, backgroundColor: c.lime }}>
          <T v="label" color={c.onLime} style={{ textAlign: 'center' }}>
            {String(n)}
          </T>
        </View>
        <Icon name="chevronRight" color={c.muted} />
      </Row>
    ) : undefined;

  const rows: { href: Href; icon: IconName; label: string; n?: number }[][] = [
    [
      { href: '/favorites', icon: 'bookmark', label: '관심 의약품 (찜한 목록)', n: favorites.items.length },
      { href: '/history', icon: 'clock', label: '조회 기록', n: history.length },
      { href: '/interactions', icon: 'pill', label: '함께 먹는 약 확인', n: medList.items.length },
    ],
    [
      { href: '/about', icon: 'info', label: '서비스 안내' },
      { href: '/faq', icon: 'help', label: '자주 묻는 질문 (FAQ)' },
    ],
  ];

  return (
    <Screen>
      <TitleBlock icon="user" title="마이페이지" />

      <View style={{ backgroundColor: c.block, borderRadius: radius.xl, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: c.lime, right: -40, top: -60 }} />
        <View style={{ zIndex: 1, width: 60, height: 60, borderRadius: 30, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="user" size={32} color={c.primaryStrong} />
        </View>
        <View style={{ zIndex: 1, flex: 1 }}>
          <T v="h2" color={c.onBlock}>
            사용자
          </T>
          <T v="small" color={c.onBlockMuted} style={{ fontFamily: fonts.regular }}>
            로그인 없이 이 기기에 저장돼요
          </T>
        </View>
      </View>

      {rows.map((group, gi) => (
        <Card key={gi} padded={false} style={{ padding: 4, gap: 0, borderRadius: radius.lg }}>
          {group.map((r, i) => (
            <ListRow key={r.label} icon={r.icon} label={r.label} last={i === group.length - 1} right={count(r.n ?? 0)} onPress={() => router.push(r.href)} />
          ))}
        </Card>
      ))}
    </Screen>
  );
}
