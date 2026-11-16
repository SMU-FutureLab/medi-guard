import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../../../api/client';
import { DrugTags, ingredientLine } from '../../../components/drug';
import { DrugGallery } from '../../../components/gallery';
import { Icon, type IconName } from '../../../components/Icon';
import { Button, Card, Disclaimer, ErrorBox, Highlight, PageTop, Skeleton, SourceInfo, Spinner, T } from '../../../components/ui';
import { useAsync } from '../../../hooks/useAsync';
import { useAppStore } from '../../../store/AppStore';
import { BackgroundGlow } from '../../../components/art';
import { fonts, glass, radius, shadow, useTheme } from '../../../theme/theme';
import type { SectionKey } from '../../../types';

const SECTION_ICONS: Record<SectionKey, IconName> = {
  efficacy: 'shield',
  usage: 'pill',
  warning: 'alert',
  interaction: 'link',
  sideEffect: 'pulse',
  storage: 'layers',
};

type Tab = 'official' | 'easy';

export default function DrugDetailScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const store = useAppStore();
  const drug = useAsync(() => api.getDrug(id), [id]);
  // 원문을 먼저 보여주고, AI 설명은 따로 불러와 준비되는 대로 채운다
  const explain = useAsync(() => api.explainDrug(id), [id], !!drug.data);

  const [tab, setTab] = useState<Tab>('official');
  const [open, setOpen] = useState<Set<SectionKey>>(() => new Set(['efficacy']));
  const [focus, setFocus] = useState<{ key: SectionKey; quote: string }>();
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const sectionY = useRef<Partial<Record<SectionKey, number>>>({});
  const listY = useRef(0);

  useEffect(() => {
    if (drug.data) store.recordView(drug.data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drug.data]);

  if (drug.loading) return <Wrap><Spinner label="의약품 정보를 불러오고 있어요…" /></Wrap>;
  if (drug.error || !drug.data)
    return (
      <Wrap>
        <ErrorBox error={drug.error ?? new Error('정보가 없어요.')} onRetry={drug.retry} />
      </Wrap>
    );

  const d = drug.data;
  const fav = store.favorites.has(d.id);
  const inMedList = store.medList.has(d.id);

  const toggle = (key: SectionKey) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // AI 설명의 근거 구절 → 공식 정보 탭에서 해당 항목을 열고 구절을 표시
  const showEvidence = (key: SectionKey, quote: string) => {
    setTab('official');
    setOpen((prev) => new Set(prev).add(key));
    setFocus({ key, quote });
    setTimeout(() => {
      const y = sectionY.current[key];
      if (y !== undefined) scrollRef.current?.scrollTo({ y: listY.current + y - 80, animated: true });
    }, 50);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }}>
      <BackgroundGlow />
      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 + insets.bottom }}>
        <View style={{ width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 16, gap: 16 }}>
          <PageTop
            title={d.name}
            right={
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={fav ? '관심 의약품에서 빼기' : '관심 의약품에 추가'}
                accessibilityState={{ selected: fav }}
                onPress={() => store.favorites.toggle(d)}
                style={{ width: 42, height: 42, alignItems: 'center', justifyContent: 'center' }}
              >
                <Icon name="star" size={26} color={fav ? c.primary : c.text} fill={fav ? c.primary : 'none'} />
              </Pressable>
            }
          />
          <View style={{ marginTop: -8, paddingLeft: 52 }}>
            <DrugTags drug={d} />
          </View>

          {/* 사진 (패키지 · 알약 모양) */}
          <DrugGallery drug={d} />

          {/* 정보 표 */}
          <Card style={{ paddingVertical: 6, paddingHorizontal: 10, gap: 0 }}>
            <View>
              {[
                ['주성분', d.ingredients.length === 1 ? ingredientLine(d) : d.ingredients.join(', ')],
                ['제형', d.form ?? '정보 없음'],
                ['업체명', d.company],
              ].map(([k, v], i) => (
                <View key={k} style={{ flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: i < 2 ? 1 : 0, borderBottomColor: c.line }}>
                  <T v="label" style={{ width: 66 }}>
                    {k}
                  </T>
                  <T v="body" style={{ flex: 1, fontFamily: fonts.medium }}>
                    {v}
                  </T>
                </View>
              ))}
            </View>
          </Card>
          <SourceInfo source={d.source} />

          {/* 탭 */}
          <View style={{ flexDirection: 'row', gap: 8 }} accessibilityRole="tablist">
            {(
              [
                ['official', '공식 정보'],
                ['easy', 'AI 쉽게 설명'],
              ] as const
            ).map(([k, label]) => {
              const on = tab === k;
              return (
                <Pressable
                  key={k}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: on }}
                  aria-selected={on}
                  onPress={() => setTab(k)}
                  style={[{ flex: 1, paddingVertical: 12, borderRadius: radius.pill, alignItems: 'center', backgroundColor: on ? c.primaryStrong : c.card }, !on && [glass(c), shadow(c, 0.4)]]}
                >
                  <Text style={{ fontFamily: on ? fonts.bold : fonts.medium, fontSize: 15, color: on ? c.onPrimary : c.text2 }}>{label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* 항목별 펼침 목록 */}
          <View
            onLayout={(e) => (listY.current = e.nativeEvent.layout.y)}
            style={{ gap: 10 }}
          >
            {d.sections.map((s, i) => {
              const isOpen = open.has(s.key);
              const exp = explain.data?.find((e) => e.sectionKey === s.key);
              const important = s.key === 'warning' || s.key === 'interaction';
              return (
                <View
                  key={s.key}
                  onLayout={(e) => (sectionY.current[s.key] = e.nativeEvent.layout.y)}
                  style={[{ borderRadius: radius.lg, borderWidth: 1.5, borderColor: isOpen ? c.mintLine : 'transparent', backgroundColor: isOpen ? c.mint : c.card, overflow: 'hidden' }, !isOpen && [glass(c), shadow(c, 0.5)]]}
                >
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isOpen }}
                    onPress={() => toggle(s.key)}
                    style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 14, opacity: pressed ? 0.8 : 1 })}
                  >
                    <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: isOpen ? c.surface : important ? c.warnSoft : c.primarySoft }}>
                      <Icon name={SECTION_ICONS[s.key]} size={18} color={important ? c.warn : c.primaryStrong} />
                    </View>
                    <T v="bodyBold" style={{ flex: 1 }}>
                      {s.title}
                    </T>
                    <Icon name={isOpen ? 'chevronUp' : 'chevronDown'} color={isOpen ? c.primaryStrong : c.muted} />
                  </Pressable>
                  {isOpen && (
                    <View style={{ paddingHorizontal: 16, paddingBottom: 18, gap: 10 }}>
                      {tab === 'official' ? (
                        <T v="body" color={c.text2} style={{ fontSize: 15 }}>
                          <Highlight text={s.original} quotes={focus?.key === s.key ? [focus.quote] : []} active={focus?.quote} />
                        </T>
                      ) : explain.loading ? (
                        <>
                          <AiLabel text="AI가 공식 정보를 쉬운 말로 정리하고 있어요…" />
                          <Skeleton />
                        </>
                      ) : exp ? (
                        <>
                          <AiLabel text="AI 쉬운 설명" />
                          <T v="easy">{exp.easyText}</T>
                          {exp.citations.length > 0 && (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, paddingTop: 10, borderTopWidth: 1, borderTopColor: c.line, borderStyle: 'dashed' }}>
                              <T v="label">근거 원문</T>
                              {exp.citations.map((cit) => (
                                <Pressable
                                  key={cit.quote}
                                  onPress={() => showEvidence(s.key, cit.quote)}
                                  style={({ pressed }) => ({ borderWidth: 1.5, borderColor: pressed ? c.text : c.line, borderRadius: radius.pill, paddingVertical: 4, paddingHorizontal: 12 })}
                                >
                                  <T v="label" style={{ fontFamily: fonts.regular }}>
                                    “{cit.quote.length > 22 ? `${cit.quote.slice(0, 22)}…` : cit.quote}”
                                  </T>
                                </Pressable>
                              ))}
                            </View>
                          )}
                        </>
                      ) : (
                        <T v="small" color={c.warn}>
                          이 항목은 AI 설명을 불러오지 못했어요. 공식 정보 탭에서 원문을 확인해 주세요.
                        </T>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          <View style={{ gap: 10 }}>
            <Button label="AI에게 이 약에 대해 질문하기" icon="sparkle" block href={{ pathname: '/drugs/[id]/ai', params: { id: d.id } }} />
            <Button
              label={inMedList ? '함께 먹는 약 목록에 담겨 있어요' : '함께 먹는 약 확인에 담기'}
              icon={inMedList ? 'check' : 'plus'}
              variant="ghost"
              block
              onPress={() => (inMedList ? store.medList.remove(d.id) : store.medList.add(d))}
            />
            {inMedList && store.medList.items.length >= 2 && (
              <Pressable onPress={() => router.push('/interactions')} style={{ alignItems: 'center', paddingVertical: 6 }}>
                <T v="bodyBold" color={c.primaryStrong}>
                  담은 약 {store.medList.items.length}개 상호작용 확인하기 →
                </T>
              </Pressable>
            )}
          </View>

          <Disclaimer />
        </View>
      </ScrollView>
    </View>
  );
}

function AiLabel({ text }: { text: string }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Icon name="sparkle" size={16} color={c.primaryStrong} />
      <T v="label" color={c.primaryStrong}>
        {text}
      </T>
    </View>
  );
}

function Wrap({ children }: { children: ReactNode }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 12, paddingHorizontal: 16, gap: 16 }}>
      <PageTop title="" />
      {children}
    </View>
  );
}
