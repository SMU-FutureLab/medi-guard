import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../../../api/client';
import { BackgroundGlow, GlowOrb, GradientPanel, Mascot, RoundButton } from '../../../components/art';
import { Icon } from '../../../components/Icon';
import { ErrorBox, PageTop, TopBar, Row, Skeleton, SourceInfo, Spinner, T } from '../../../components/ui';
import { useAsync } from '../../../hooks/useAsync';
import { fonts, glass, radius, shadow, useTheme } from '../../../theme/theme';
import type { AskResponse, DrugDetail } from '../../../types';
import { toBullets } from '../../../utils';

const EXAMPLES = ['복용 시 주의해야 할 점이 있나요?', '하루에 몇 번 먹어요?', '다른 약이랑 같이 먹어도 돼요?', '어떻게 보관해요?'];

interface QA {
  question: string;
  response?: AskResponse;
  error?: Error;
}

export default function DrugChatScreen() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const drug = useAsync(() => api.getDrug(id), [id]);

  if (!drug.data)
    return (
      <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + 12, paddingHorizontal: 16, gap: 16 }}>
        <PageTop title="AI 도우미" center />
        {drug.loading ? <Spinner /> : <ErrorBox error={drug.error ?? new Error('정보가 없어요.')} onRetry={drug.retry} />}
      </View>
    );
  return <Chat drug={drug.data} />;
}

function Chat({ drug }: { drug: DrugDetail }) {
  const { c } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<QA[]>([]);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const pending = messages.some((m) => !m.response && !m.error);

  const ask = async (q: string) => {
    const text = q.trim();
    if (!text || pending) return;
    setQuestion('');
    const index = messages.length;
    setMessages((m) => [...m, { question: text }]);
    const update = (patch: Partial<QA>) => setMessages((m) => m.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    try {
      update({ response: await api.ask(drug.id, text) });
    } catch (e) {
      update({ error: e as Error });
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <BackgroundGlow />
      <TopBar>
          <PageTop
            title="AI 도우미"
            center
            right={<RoundButton icon="file" label="공식 정보 보기" onPress={() => router.push({ pathname: '/drugs/[id]', params: { id: drug.id } })} />}
          />
      </TopBar>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 24, gap: 18 }}>

          {/* 마스코트 패널: 대화 전에는 크게, 대화 중에는 작게 */}
          <GradientPanel style={{ padding: 16, minHeight: messages.length === 0 ? 300 : undefined }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Row gap={8} style={{ backgroundColor: c.glass, borderRadius: radius.pill, paddingVertical: 6, paddingLeft: 6, paddingRight: 12, flexShrink: 1 }}>
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="pill" size={16} color={c.primaryStrong} />
                </View>
                <T v="label" color={c.onBlock} numberOfLines={1} style={{ flexShrink: 1 }}>
                  {drug.name}
                </T>
              </Row>
            </Row>
            {messages.length === 0 ? (
              <View style={{ alignItems: 'center', marginTop: 8 }}>
                <View style={{ width: 190, height: 190, alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ position: 'absolute' }}>
                    <GlowOrb size={190} />
                  </View>
                  <View style={{ zIndex: 1 }}>
                    <Mascot size={130} />
                  </View>
                </View>
                <View style={{ backgroundColor: c.glass, borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 16, marginTop: -6 }}>
                  <T v="small" color={c.onBlock} style={{ fontFamily: fonts.medium }}>
                    무엇이 궁금하세요?
                  </T>
                </View>
              </View>
            ) : (
              <Row gap={10} style={{ marginTop: 10 }}>
                <Mascot size={44} wave={false} />
                <T v="small" color={c.onBlock} style={{ flex: 1 }}>
                  공식 의약품 정보에 있는 내용만 쉬운 말로 알려드려요.
                </T>
              </Row>
            )}
          </GradientPanel>

          {messages.length === 0 && (
            <>
              <Row style={{ justifyContent: 'space-between' }}>
                <Row gap={6}>
                  <Icon name="shield" size={18} color={c.primary} />
                  <T v="small" style={{ fontFamily: fonts.medium }}>
                    공식 정보 안에서만 답해요
                  </T>
                </Row>
                <T v="label" style={{ fontFamily: fonts.regular }}>
                  식약처 e약은요
                </T>
              </Row>
              <Row wrap gap={8}>
                {EXAMPLES.map((ex, i) => (
                  <Pressable
                    key={ex}
                    onPress={() => ask(ex)}
                    style={({ pressed }) => ({ borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: i === 0 ? c.primaryStrong : c.surface, opacity: pressed ? 0.85 : 1 })}
                  >
                    <T v="small" color={i === 0 ? c.onPrimary : c.text} style={{ fontFamily: fonts.medium }}>
                      {ex}
                    </T>
                  </Pressable>
                ))}
              </Row>
            </>
          )}

          {messages.map((m, i) => (
            <View key={i} style={{ gap: 12 }}>
              <Row gap={8} style={{ alignSelf: 'flex-end', maxWidth: '85%', backgroundColor: c.primarySoft, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 22, borderBottomRightRadius: 6 }}>
                <Icon name="user" size={18} color={c.primaryStrong} />
                <T color={c.text} style={{ fontFamily: fonts.medium, flexShrink: 1 }}>
                  {m.question}
                </T>
              </Row>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: c.primaryStrong, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="sparkle" size={20} color={c.onPrimary} />
                </View>
                <View style={{ flex: 1, minWidth: 0, gap: 10 }}>
                  {m.error ? (
                    <ErrorBox error={m.error} />
                  ) : !m.response ? (
                    <Bubble>
                      <Skeleton />
                    </Bubble>
                  ) : (
                    <Answer drug={drug} response={m.response} />
                  )}
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 입력창 */}
      <View style={{ paddingHorizontal: 24, paddingTop: 10, paddingBottom: 10 + insets.bottom, backgroundColor: c.bg }}>
        <Row gap={8} style={{ width: '100%', maxWidth: 640 - 48, alignSelf: 'center' }}>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            onSubmitEditing={() => ask(question)}
            placeholder="이 약에 대해 궁금한 점을 물어보세요"
            placeholderTextColor={c.muted}
            returnKeyType="send"
            maxLength={200}
            accessibilityLabel="질문 입력"
            style={{ flex: 1, minWidth: 0, ...glass(c), borderWidth: 1.5, borderRadius: radius.pill, paddingVertical: 12, paddingHorizontal: 20, fontFamily: fonts.regular, fontSize: 16, color: c.text }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="질문 보내기"
            disabled={pending || !question.trim()}
            onPress={() => ask(question)}
            style={{ width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', backgroundColor: pending || !question.trim() ? c.surface2 : c.primaryStrong }}
          >
            <Icon name="send" color={pending || !question.trim() ? c.muted : c.onPrimary} />
          </Pressable>
        </Row>
      </View>
    </KeyboardAvoidingView>
  );
}

function Bubble({ children, muted }: { children: ReactNode; muted?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={[{ backgroundColor: muted ? c.surface2 : c.surface, borderRadius: 22, borderTopLeftRadius: 6, padding: 18, gap: 8 }, !muted && shadow(c)]}>
      {children}
    </View>
  );
}

function Answer({ drug, response }: { drug: DrugDetail; response: AskResponse }) {
  const { c } = useTheme();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!response.answerable)
    return (
      <Bubble muted>
        <T color={c.text2}>{response.answer}</T>
      </Bubble>
    );

  const sectionTitle = drug.sections.find((s) => s.key === response.citations[0]?.sectionKey)?.title;

  return (
    <>
      <Bubble>
        <T v="bodyBold">공식 정보에서 찾은 내용이에요.</T>
        {toBullets(response.answer).map((b) => (
          <Row key={b} gap={10} style={{ alignItems: 'flex-start' }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.primary, marginTop: 10 }} />
            <T style={{ flex: 1 }}>{b}</T>
          </Row>
        ))}
        {response.notice ? (
          <T v="label" style={{ fontFamily: fonts.regular, marginTop: 4 }}>
            {response.notice}
          </T>
        ) : null}
      </Bubble>
      {response.citations.length > 0 && (
        <View style={[glass(c), { borderRadius: radius.lg, overflow: 'hidden' }, shadow(c, 0.5)]}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: open }}
            onPress={() => setOpen((v) => !v)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, paddingHorizontal: 16 }}
          >
            <Icon name="file" />
            <T v="bodyBold" style={{ flex: 1 }}>
              답변 근거 (공식 원문)
            </T>
            <Icon name={open ? 'chevronDown' : 'chevronRight'} color={c.muted} />
          </Pressable>
          {open && (
            <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 8 }}>
              {sectionTitle ? <T v="label">{sectionTitle}</T> : null}
              {response.citations.map((cit) => (
                <View key={cit.quote} style={{ borderLeftWidth: 3, borderLeftColor: c.mintLine, backgroundColor: c.quoteBg, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                  <T v="small" color={c.text2}>
                    {cit.quote}
                  </T>
                </View>
              ))}
              <SourceInfo source={drug.source} />
              <Pressable onPress={() => router.push({ pathname: '/drugs/[id]', params: { id: drug.id } })}>
                <T v="bodyBold" color={c.primaryStrong} style={{ fontSize: 15 }}>
                  공식 정보 전체 보기 →
                </T>
              </Pressable>
            </View>
          )}
        </View>
      )}
    </>
  );
}
