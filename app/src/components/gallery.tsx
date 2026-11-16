// 의약품 사진 갤러리: [패키지 | 알약 모양] 두 장을 옆으로 넘겨 본다.
// 사진이 없으면 기본 알약 그림과 '사진 준비 중' 안내를 보여준다.
import { useRef, useState, type ComponentRef } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { fonts, glass, radius, shadow, useTheme } from '../theme/theme';
import type { DrugDetail, DrugImage } from '../types';
import { PillArt } from './Icon';
import { Row, T } from './ui';

const SLIDES: { kind: DrugImage['kind']; label: string }[] = [
  { kind: 'package', label: '패키지' },
  { kind: 'pill', label: '알약 모양' },
];

const HEIGHT = 230;

export function DrugGallery({ drug }: { drug: DrugDetail }) {
  const { c } = useTheme();
  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(0);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  const go = (i: number) => {
    setPage(i);
    scrollRef.current?.scrollTo({ x: i * width, animated: true });
  };

  const id = drug.identification;
  const idChips = id
    ? ([
        ['모양', id.shape],
        ['색상', id.color],
        ['앞면', id.markFront],
        ['뒷면', id.markBack],
        ['크기', id.size],
      ].filter(([, v]) => v) as [string, string][])
    : [];

  return (
    <View style={{ gap: 10 }}>
      <View
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        style={[glass(c), { height: HEIGHT, borderRadius: radius.xl, overflow: 'hidden' }, shadow(c)]}
      >
        {width > 0 && (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
            onScroll={(e) => {
              // 웹에서는 momentum 이벤트가 없어서 스크롤 위치로 페이지를 맞춘다
              const p = Math.round(e.nativeEvent.contentOffset.x / width);
              if (p !== page) setPage(p);
            }}
            scrollEventThrottle={64}
          >
            {SLIDES.map((s) => {
              const img = drug.images?.find((im) => im.kind === s.kind);
              return (
                <View key={s.kind} style={{ width, height: HEIGHT, alignItems: 'center', justifyContent: 'center', backgroundColor: s.kind === 'pill' ? c.mint : 'transparent' }}>
                  {img ? (
                    <Image
                      source={{ uri: img.url }}
                      resizeMode="contain"
                      accessibilityLabel={`${drug.name} ${s.label} 사진`}
                      style={{ width: width - 40, height: HEIGHT - 70, marginTop: 20 }}
                    />
                  ) : (
                    <View style={{ alignItems: 'center', gap: 4, marginTop: 16 }}>
                      <PillArt size={110} />
                      <T v="label" style={{ fontFamily: fonts.regular }}>
                        {s.label} 사진 준비 중
                      </T>
                    </View>
                  )}
                  {img?.source ? (
                    <T v="label" style={{ position: 'absolute', bottom: 12, right: 16, fontFamily: fonts.regular, fontSize: 11 }}>
                      사진: {img.source}
                    </T>
                  ) : null}
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* 위쪽 전환 버튼 */}
        <Row gap={6} style={{ position: 'absolute', top: 12, left: 12 }}>
          {SLIDES.map((s, i) => {
            const on = page === i;
            return (
              <Pressable
                key={s.kind}
                accessibilityRole="tab"
                accessibilityState={{ selected: on }}
                aria-selected={on}
                onPress={() => go(i)}
                style={[
                  { paddingVertical: 6, paddingHorizontal: 13, borderRadius: radius.pill },
                  on ? { backgroundColor: c.primaryStrong } : glass(c),
                ]}
              >
                <Text style={{ fontFamily: on ? fonts.bold : fonts.medium, fontSize: 13, color: on ? c.onPrimary : c.text2 }}>{s.label}</Text>
              </Pressable>
            );
          })}
        </Row>

        {/* 아래쪽 점 */}
        <Row gap={6} style={{ position: 'absolute', bottom: 14, alignSelf: 'center' }}>
          {SLIDES.map((s, i) => (
            <View key={s.kind} style={{ width: page === i ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: page === i ? c.primary : c.line }} />
          ))}
        </Row>
      </View>

      {/* 알약 모양 정보 (낱알식별) */}
      {idChips.length > 0 && (
        <Row wrap gap={6}>
          {idChips.map(([k, v]) => (
            <View key={k} style={[glass(c), { flexDirection: 'row', gap: 4, borderRadius: radius.pill, paddingVertical: 5, paddingHorizontal: 12 }]}>
              <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: c.muted }}>{k}</Text>
              <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: c.text }}>{v}</Text>
            </View>
          ))}
        </Row>
      )}
    </View>
  );
}
