// 화면 맨 아래 푸터: 로고·소개 / 메뉴 묶음 / 안내 문구·저작권
import { useRouter, type Href } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { fonts, useTheme } from '../theme/theme';
import { LogoLockup } from './logo';

type FooterLink = { label: string; href?: Href };

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: '서비스',
    links: [
      { label: '의약품 검색', href: '/search' },
      { label: '함께 먹는 약 확인', href: '/interactions' },
      { label: '관심 의약품', href: '/favorites' },
    ],
  },
  {
    title: '지원',
    links: [
      { label: '서비스 안내', href: '/about' },
      { label: '자주 묻는 질문', href: '/faq' },
    ],
  },
  {
    title: '정보 출처',
    links: [{ label: '식약처 e약은요' }, { label: '식약처 DUR 정보' }],
  },
];

export function Footer() {
  const { c } = useTheme();
  const router = useRouter();

  return (
    <View style={{ marginTop: 40, backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.line }}>
      <View style={{ width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 24, paddingTop: 32, paddingBottom: 28 }}>
        {/* 로고 + 소개 */}
        <View style={{ gap: 10 }}>
          <LogoLockup height={26} />
          <Text style={[small, { color: c.muted }]}>
            {'어려운 의약품 정보를, 쉬운 말로 잇는 MEDI GUARD.\n식약처 공식 정보와 근거 원문을 함께 보여드려요.'}
          </Text>
        </View>

        {/* 메뉴 묶음 */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 26, rowGap: 22 }}>
          {COLUMNS.map((col) => (
            <View key={col.title} style={{ flexBasis: '33.33%', flexGrow: 1, minWidth: 110, gap: 8 }}>
              <Text style={{ fontFamily: fonts.bold, fontSize: 13, lineHeight: 18, color: c.text }}>{col.title}</Text>
              {col.links.map((l) =>
                l.href ? (
                  <Pressable key={l.label} accessibilityRole="link" onPress={() => router.push(l.href!)}>
                    {({ pressed }) => <Text style={[small, { color: pressed ? c.primaryStrong : c.text2 }]}>{l.label}</Text>}
                  </Pressable>
                ) : (
                  <Text key={l.label} style={[small, { color: c.text2 }]}>
                    {l.label}
                  </Text>
                ),
              )}
            </View>
          ))}
        </View>

        {/* 구분선 + 안내 + 저작권 */}
        <View style={{ height: 1, backgroundColor: c.line, marginTop: 28, marginBottom: 18 }} />
        <Text style={[small, { color: c.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' }]}>
          MEDI GUARD는 공식 의약품 정보의 이해를 돕는 보조 서비스이며, 의사·약사의 진료나 복약지도를 대신하지 않습니다.
        </Text>
        <Text style={[small, { color: c.muted, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 6 }]}>
          © 2026 MEDI GUARD · 상명대학교 팀 케로케로
        </Text>
      </View>
    </View>
  );
}

const small = { fontFamily: fonts.regular, fontSize: 13, lineHeight: 20 };
