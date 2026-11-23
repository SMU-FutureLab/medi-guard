import { useRouter } from 'expo-router';
import { SUGGESTIONS } from '../../api/client';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { GradientPanel, Mascot, RoundButton } from '../../components/art';
import { SearchBar } from '../../components/drug';
import { Icon, type IconName } from '../../components/Icon';
import { LogoLockup } from '../../components/logo';
import { Row, Screen, T } from '../../components/ui';
import { useAppStore } from '../../store/AppStore';
import { fonts, glass, radius, shadow, useTheme } from '../../theme/theme';


export default function HomeScreen() {
  const { c } = useTheme();
  const router = useRouter();
  const { history, favorites } = useAppStore();
  const search = (q: string) => router.push({ pathname: '/search', params: { q } });

  return (
    <Screen
      tabs
      contentStyle={{ gap: 14 }}
      header={
        // 상단 바: 로고 · 관심 의약품 · 마이
        <Row style={{ justifyContent: 'space-between' }}>
          <LogoLockup height={34} />
          <Row gap={10}>
            <RoundButton icon="star" label="관심 의약품" onPress={() => router.push('/favorites')} />
            <RoundButton icon="user" label="마이페이지" variant="primary" onPress={() => router.navigate('/my')} />
          </Row>
        </Row>
      }
    >
      {/* 맨 위 배너: 마스코트 메디 */}
      <GradientPanel style={{ paddingVertical: 22, minHeight: 210 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ flex: 1, gap: 8, zIndex: 1 }}>
            <View style={{ alignSelf: 'flex-start', backgroundColor: c.glass, borderRadius: radius.pill, paddingVertical: 4, paddingHorizontal: 10 }}>
              <T v="label" color={c.onBlock}>
                안녕하세요, 저는 메디예요
              </T>
            </View>
            <T v="h2" color={c.onBlock} style={{ fontSize: 22, lineHeight: 30 }}>
              {'궁금한 약,\n저한테 물어보세요!'}
            </T>
            <T v="small" color={c.onBlockMuted}>
              식약처 공식 정보를 쉬운 말로 알려드려요.
            </T>
          </View>
          <View style={{ marginRight: -14, marginTop: -6 }}>
            <Mascot size={112} />
          </View>
        </View>
        <Row wrap gap={8} style={{ marginTop: 14 }}>
          {SUGGESTIONS.map((s) => (
            <Pressable
              key={s}
              onPress={() => search(s)}
              style={({ pressed }) => ({ backgroundColor: pressed ? c.surface : c.glass, borderRadius: radius.pill, paddingVertical: 7, paddingHorizontal: 14 })}
            >
              {({ pressed }) => <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: pressed ? c.primaryStrong : c.onBlock }}>{s}</Text>}
            </Pressable>
          ))}
        </Row>
      </GradientPanel>

      {/* 배너 바로 아래 검색창 */}
      <SearchBar variant="hero" onSearch={search} placeholder="약 이름을 검색해 보세요" />

      {/* 숫자 카드 2개 */}
      <Row gap={12} style={{ alignItems: 'stretch' }}>
        <StatCard tone="soft" icon="clock" value={history.length} unit="개" label="최근 본 의약품" onPress={() => router.push('/history')} />
        <StatCard tone="plain" icon="bookmark" value={favorites.items.length} unit="개" label="관심 의약품" onPress={() => router.push('/favorites')} />
      </Row>

      {/* 함께 먹는 약 카드 */}
      <Pressable onPress={() => router.push('/interactions')} style={({ pressed }) => [{ ...glass(c), borderRadius: radius.xl, overflow: 'hidden', padding: 24, minHeight: 150, opacity: pressed ? 0.9 : 1 }, shadow(c, 0.6)]}>
        <T v="h2" style={{ fontSize: 21 }}>
          {'이 약들,\n같이 먹어도 될까요?'}
        </T>
        <T v="small" color={c.muted} style={{ marginTop: 4 }}>
          먹고 있는 약을 담으면, 함께 먹으면 안 되는 조합을 알려드려요.
        </T>
        <Row style={{ justifyContent: 'space-between', marginTop: 16 }}>
          <View style={{ backgroundColor: c.mint, borderRadius: radius.pill, paddingVertical: 5, paddingHorizontal: 12 }}>
            <T v="label" color={c.primaryStrong}>
              식약처 공식 정보로 확인
            </T>
          </View>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.primaryStrong, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chevronRight" color={c.onPrimary} />
          </View>
        </Row>
      </Pressable>

      {/* 그린 카드: 근거가 보이는 AI 설명 */}
      <Pressable onPress={() => router.push('/about')}>
        <GradientPanel style={{ minHeight: 140 }}>
          <T v="h2" color={c.onBlock} style={{ fontSize: 21 }}>
            {'근거가 보이는\nAI 설명'}
          </T>
          {/* 줄바꿈 위치를 직접 정해서 한 글자만 다음 줄로 넘어가지 않게 한다 */}
          <T v="small" color={c.onBlockMuted} style={{ marginTop: 4, paddingRight: 60 }}>
            {'설명마다 공식 원문 구절을\n함께 보여드려요.'}
          </T>
          <View style={{ position: 'absolute', right: 18, bottom: 18, width: 44, height: 44, borderRadius: 22, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chevronRight" color={c.primaryStrong} />
          </View>
        </GradientPanel>
      </Pressable>
    </Screen>
  );
}

function StatCard({
  tone,
  icon,
  value,
  unit,
  label,
  onPress,
}: {
  tone: 'soft' | 'plain';
  icon: IconName;
  value: number;
  unit: string;
  label: string;
  onPress: () => void;
}) {
  const { c } = useTheme();
  const soft = tone === 'soft';
  // 좁은 폰에서는 라벨이 두 줄로 꺾이지 않게 간격을 조금 줄인다
  const narrow = useWindowDimensions().width < 400;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        { flex: 1, flexDirection: 'row', alignItems: 'center', gap: narrow ? 10 : 14, borderRadius: radius.lg, paddingVertical: 18, paddingHorizontal: narrow ? 14 : 18, backgroundColor: soft ? c.primarySoft : c.card, opacity: pressed ? 0.85 : 1 },
        !soft && [glass(c), shadow(c, 0.6)],
      ]}
    >
      <View style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: soft ? c.primaryStrong : c.surface2 }}>
        <Icon name={icon} size={18} color={soft ? c.onPrimary : c.text} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <T v="small" color={c.text2}>
          {label}
        </T>
        <Row gap={3} style={{ alignItems: 'baseline' }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 24, lineHeight: 30, color: c.text }}>{value}</Text>
          <T v="small" color={c.muted}>
            {unit}
          </T>
        </Row>
      </View>
    </Pressable>
  );
}
