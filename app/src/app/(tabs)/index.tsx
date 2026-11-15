import { useRouter, type Href } from 'expo-router';
import { Pressable, View, useWindowDimensions } from 'react-native';
import { USE_MOCK } from '../../api/client';
import { SearchBar } from '../../components/drug';
import { Icon, LogoMark, PillArt, type IconName } from '../../components/Icon';
import { Button, Chip, Row, Screen, T } from '../../components/ui';
import { fonts, radius, shadow, useTheme } from '../../theme/theme';

const SUGGESTIONS = ['타이레놀', '게보린', '이트라코나졸', '심바스타틴'];

const FEATURES: { href: Href; icon: IconName; title: string; desc: string }[] = [
  { href: '/search', icon: 'search', title: '의약품 검색', desc: '공식 정보 조회' },
  { href: '/about', icon: 'sparkle', title: 'AI 쉬운 설명', desc: '어려운 용어를 쉽게' },
  { href: '/interactions', icon: 'pill', title: '주의사항 확인', desc: '함께 먹는 약 확인' },
  { href: '/history', icon: 'clock', title: '조회 기록', desc: '최근 검색 내역' },
];

export default function HomeScreen() {
  const { c } = useTheme();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 760;
  const search = (q: string) => router.push({ pathname: '/search', params: { q } });

  return (
    <Screen wide contentStyle={{ gap: 28 }}>
      {/* 상단 로고 */}
      <Row style={{ justifyContent: 'space-between' }}>
        <Row gap={8}>
          <LogoMark />
          <T v="h3" style={{ fontFamily: fonts.display, letterSpacing: -0.2 }}>
            MEDI GUARD
          </T>
        </Row>
      </Row>
      {USE_MOCK && (
        <Row gap={8} style={{ marginTop: -16 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.lime }} />
          <T v="label" style={{ fontFamily: fonts.regular, flex: 1 }}>
            프로토타입 예시 데이터로 동작 중이에요. 실제 의약품 정보와 다를 수 있어요.
          </T>
        </Row>
      )}

      {/* 히어로 */}
      <View style={[{ backgroundColor: c.surface, borderRadius: radius.xl, overflow: 'hidden', flexDirection: wide ? 'row-reverse' : 'column' }, shadow(c)]}>
        <View
          style={{
            flex: wide ? 1 : undefined,
            margin: 10,
            minHeight: wide ? 380 : 270,
            backgroundColor: c.block,
            borderRadius: radius.xl,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <View style={{ position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: c.lime }} />
          <View style={{ zIndex: 1 }}>
            <PillArt size={190} />
          </View>
          <FloatChip icon="shield" label="식약처 공식 데이터" style={{ top: 18, right: 14 }} />
          <FloatChip icon="file" label="근거 원문 함께 제공" style={{ bottom: 20, left: 14 }} />
        </View>
        <View style={{ flex: wide ? 1.05 : undefined, padding: wide ? 44 : 22, paddingTop: wide ? 44 : 10, gap: 16, justifyContent: 'center' }}>
          <Row
            gap={8}
            style={{ alignSelf: 'flex-start', borderWidth: 1.5, borderColor: c.line, borderRadius: radius.pill, paddingVertical: 6, paddingHorizontal: 12 }}
          >
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.lime }} />
            <T v="label" color={c.text2}>
              식약처 공식 의약품 정보 기반
            </T>
          </Row>
          <T v="display" style={{ fontFamily: fonts.bold, fontSize: wide ? 44 : 32, lineHeight: wide ? 52 : 40 }}>
            {'어려운 약 설명서,\n쉬운 말로 읽어요'}
          </T>
          <T color={c.text2}>약 이름만 검색하면 공식 주의사항을 AI가 쉬운 말로 풀어 드려요. 설명마다 근거가 된 원문을 함께 보여 드려요.</T>
          <SearchBar variant="hero" onSearch={search} />
          <Row wrap gap={8}>
            <T v="label" style={{ fontFamily: fonts.regular }}>
              추천
            </T>
            {SUGGESTIONS.map((s) => (
              <Chip key={s} label={s} onPress={() => search(s)} />
            ))}
          </Row>
        </View>
      </View>

      {/* 기능 타일 */}
      <View style={{ backgroundColor: c.surface2, borderRadius: radius.xl, padding: wide ? 40 : 20, gap: 20 }}>
        <T v="h1">{'MEDI GUARD로\n할 수 있는 것'}</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {FEATURES.map((f, i) => {
            const accent = i === 0;
            return (
              <Pressable
                key={f.title}
                onPress={() => router.push(f.href)}
                style={({ pressed }) => ({
                  flexBasis: wide ? '23%' : '47%',
                  flexGrow: 1,
                  minHeight: 156,
                  padding: 18,
                  borderRadius: radius.lg,
                  backgroundColor: accent ? c.block : c.surface,
                  justifyContent: 'space-between',
                  transform: [{ translateY: pressed ? 2 : 0 }],
                })}
              >
                <Icon name={f.icon} size={30} color={accent ? c.lime : c.primary} />
                <View
                  style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: accent ? c.lime : 'transparent',
                    borderWidth: accent ? 0 : 1.5,
                    borderColor: c.line,
                  }}
                >
                  <Icon name="chevronRight" size={18} color={accent ? c.onLime : c.text} />
                </View>
                <View style={{ gap: 2 }}>
                  <T v="h3" color={accent ? c.onBlock : c.text}>
                    {f.title}
                  </T>
                  <T v="label" style={{ fontFamily: fonts.regular }} color={accent ? c.onBlockMuted : c.muted}>
                    {f.desc}
                  </T>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* 상호작용 배너 */}
      <View style={{ backgroundColor: c.block, borderRadius: radius.xl, padding: wide ? 48 : 24, overflow: 'hidden', flexDirection: wide ? 'row' : 'column', gap: 24 }}>
        <View style={{ position: 'absolute', width: 380, height: 380, borderRadius: 190, backgroundColor: c.lime, right: -170, bottom: -200 }} />
        <View style={{ zIndex: 1, flex: wide ? 1 : undefined, gap: 14 }}>
          <T v="h1" color={c.onBlock}>
            {'함께 먹는 약,\n같이 확인해요'}
          </T>
          <T color={c.onBlockMuted}>여러 약을 담으면 식약처 DUR에 등록된 병용금기·성분중복 정보를 찾아 쉬운 말로 알려 드려요.</T>
          <View style={{ marginTop: 8 }}>
            <Button label="상호작용 확인하기" icon="pill" variant="lime" href="/interactions" />
          </View>
        </View>
        <View style={{ zIndex: 1, flex: wide ? 1 : undefined, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 }}>
          <View style={[{ width: '100%', maxWidth: 320, backgroundColor: c.surface, borderRadius: radius.lg, padding: 18, gap: 6, transform: [{ rotate: '-3deg' }] }, shadow(c, 2)]}>
            <Row style={{ justifyContent: 'space-between' }}>
              <View style={{ backgroundColor: c.dangerSoft, borderRadius: radius.pill, paddingVertical: 3, paddingHorizontal: 10 }}>
                <T v="label" color={c.danger}>
                  병용금기
                </T>
              </View>
              <T v="label" style={{ fontFamily: fonts.regular, fontSize: 11 }}>
                예시
              </T>
            </Row>
            <T v="bodyBold">스포라녹스캡슐 + 조코정</T>
            <T v="small" color={c.muted}>
              이트라코나졸 ↔ 심바스타틴
            </T>
            <T v="small" color={c.text2}>
              같이 먹으면 콜레스테롤 약이 몸에 많이 쌓여 근육이 손상될 위험이 커져요.
            </T>
          </View>
        </View>
      </View>

      {/* 근거가 보이는 AI 설명 */}
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: 24, alignItems: wide ? 'center' : 'stretch' }}>
        <View style={{ flex: wide ? 1 : undefined, backgroundColor: c.primarySoft, borderRadius: radius.xl, minHeight: 240, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <View style={[{ width: 220, backgroundColor: c.surface, borderRadius: radius.lg, paddingTop: 42, paddingHorizontal: 22, paddingBottom: 26, gap: 12 }, shadow(c)]}>
            <View style={{ position: 'absolute', top: -20, left: -16, width: 50, height: 50, borderRadius: 25, backgroundColor: c.text, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="sparkle" size={22} color={c.lime} />
            </View>
            {[1, 1, 2, 1, 0.6].map((w, i) => (
              <View key={i} style={{ height: 12, borderRadius: 6, width: `${(w > 1 ? 1 : w) * 100}%`, backgroundColor: w === 2 ? c.lime : c.surface2 }} />
            ))}
          </View>
        </View>
        <View style={{ flex: wide ? 1 : undefined, gap: 14 }}>
          <T v="h1">{'근거가 보이는\nAI 설명'}</T>
          <T color={c.text2}>AI는 공식 원문 안에서만 답해요. 설명 아래 근거 구절을 누르면 원문의 해당 부분을 바로 확인할 수 있어요.</T>
          <Button label="작동 방식 보기" icon="info" href="/about" />
        </View>
      </View>

      <T v="label" style={{ fontFamily: fonts.regular, textAlign: 'center' }}>
        MEDI GUARD는 공식 의약품 정보의 이해를 돕는 보조 서비스이며, 의사·약사의 진료나 복약지도를 대신하지 않습니다. · 팀 머니머니
      </T>
    </Screen>
  );
}

function FloatChip({ icon, label, style }: { icon: IconName; label: string; style: object }) {
  const { c } = useTheme();
  return (
    <Row
      gap={8}
      style={[
        { position: 'absolute', zIndex: 2, backgroundColor: c.surface, borderRadius: radius.pill, paddingVertical: 8, paddingLeft: 8, paddingRight: 14 },
        shadow(c, 2),
        style,
      ]}
    >
      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: c.lime, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={14} color={c.onLime} />
      </View>
      <T v="label" color={c.text}>
        {label}
      </T>
    </Row>
  );
}
