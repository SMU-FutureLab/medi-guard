// 공통 UI 조각: 글자, 화면 틀, 버튼, 칩, 카드, 상태 표시 등
import { useRouter, type Href } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  Animated,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, glass, radius, shadow, useTheme } from '../theme/theme';
import type { Source } from '../types';
import { PILL_PHOTO_BG, imageSource } from '../api/images';
import { BackgroundGlow, Mascot, RoundButton } from './art';
import { TopTabs } from './TopTabs';
import { Icon, type IconName } from './Icon';

/* ───────── 글자 ───────── */
type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodyBold' | 'small' | 'label' | 'easy';

const VARIANTS: Record<Variant, TextStyle> = {
  display: { fontSize: 34, lineHeight: 40, letterSpacing: -0.6 },
  h1: { fontSize: 26, lineHeight: 33, letterSpacing: -0.4 },
  h2: { fontSize: 20, lineHeight: 27, letterSpacing: -0.2 },
  h3: { fontSize: 17, lineHeight: 24 },
  body: { fontSize: 16, lineHeight: 25 },
  bodyBold: { fontSize: 16, lineHeight: 25 },
  small: { fontSize: 14, lineHeight: 21 },
  label: { fontSize: 13, lineHeight: 18 },
  easy: { fontSize: 17, lineHeight: 29 },
};

const HEADINGS: Variant[] = ['display', 'h1', 'h2', 'h3'];

export function T({
  v = 'body',
  color,
  style,
  children,
  ...rest
}: TextProps & { v?: Variant; color?: string; style?: StyleProp<TextStyle> }) {
  const { c } = useTheme();
  const isHeading = HEADINGS.includes(v);
  // 제목·굵은 글씨는 Pretendard Bold, 작은 라벨은 SemiBold, 본문은 Regular
  const fontFamily = isHeading || v === 'bodyBold' ? fonts.bold : v === 'label' ? fonts.semibold : fonts.regular;
  return (
    // 아이폰: 한글을 단어 단위로 줄바꿈
    <Text lineBreakStrategyIOS="hangul-word" style={[VARIANTS[v], { fontFamily, color: color ?? (v === 'label' ? c.muted : c.text) }, style]} {...rest}>
      {children}
    </Text>
  );
}

/* ───────── 화면 틀 ───────── */

export function Screen({
  children,
  scroll = true,
  wide = false,
  tabs = false,
  header,
  footer,
  contentStyle,
}: {
  children: ReactNode;
  /** 상단 바에 넣을 내용 (제목, 버튼 등) */
  header?: ReactNode;
  scroll?: boolean;
  wide?: boolean;
  /** 탭 화면(홈·검색·기록·마이)이면 true: 상단 바 아래에 탭을 보여준다 */
  tabs?: boolean;
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const inner = (
    <View style={[{ width: '100%', maxWidth: wide ? 1040 : 640, alignSelf: 'center', paddingHorizontal: 24, gap: 16 }, contentStyle]}>
      {children}
    </View>
  );
  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: header ? 0 : insets.top }}>
      <BackgroundGlow />
      {header ? <TopBar below={tabs ? <TopTabs /> : undefined}>{header}</TopBar> : null}
      {scroll ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 14, paddingBottom: 40 + insets.bottom }} keyboardShouldPersistTaps="handled">
          {inner}
        </ScrollView>
      ) : (
        inner
      )}
      {footer}
    </View>
  );
}

/** 화면 맨 위에 고정되는 상단 바. 흰 바탕 + 아래 구분선 + 옅은 그림자로 내용과 나눈다. */
export function TopBar({ children, below }: { children: ReactNode; /** 제목 줄 아래에 붙는 내용 (예: 탭) */ below?: ReactNode }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        paddingTop: insets.top,
        backgroundColor: c.surface,
        borderBottomWidth: 1,
        borderBottomColor: c.line,
        zIndex: 5,
        shadowColor: c.shadow,
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
      }}
    >
      <View style={{ width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 24, minHeight: 62, paddingVertical: 9, justifyContent: 'center' }}>
        {children}
      </View>
      {below ? <View style={{ width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 24 }}>{below}</View> : null}
    </View>
  );
}

/** 상단 바 제목 (아이콘 + 제목 + 오른쪽 버튼) */
export function BarTitle({ icon, title, right }: { icon?: IconName; title: string; right?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      {icon ? <Icon name={icon} size={24} /> : null}
      <T v="h2" style={{ flex: 1 }}>
        {title}
      </T>
      {right}
    </View>
  );
}

/** 하위 화면 상단: 뒤로가기 + 제목 (+ 오른쪽) */
export function PageTop({ title, right, center = false, image }: { title: string; right?: ReactNode; center?: boolean; image?: string }) {
  const router = useRouter();
  const { c } = useTheme();
  const src = image ? imageSource(image) : undefined;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <RoundButton icon="back" label="뒤로" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      {src ? (
        <View style={[{ width: 52, height: 52, borderRadius: 26, overflow: 'hidden', backgroundColor: PILL_PHOTO_BG, borderWidth: 2, borderColor: c.cardBorder }, shadow(c, 0.6)]}>
          <Image source={src} resizeMode="cover" style={{ width: '100%', height: '100%' }} accessibilityLabel={`${title} 사진`} />
        </View>
      ) : null}
      <T v={center ? 'h3' : 'h2'} style={{ flex: 1, textAlign: center ? 'center' : 'left' }} numberOfLines={2}>
        {title}
      </T>
      {right ?? (center ? <View style={{ width: 44 }} /> : null)}
    </View>
  );
}

/** 화면 제목 블록 (아이콘 + 제목 + 설명) */
export function TitleBlock({ icon, title, desc }: { icon: IconName; title: string; desc?: string }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Icon name={icon} size={26} />
        <T v="h1">{title}</T>
      </View>
      {desc ? <T color={c.muted}>{desc}</T> : null}
    </View>
  );
}

/* ───────── 버튼 ───────── */
type BtnVariant = 'primary' | 'lime' | 'ghost' | 'dark';

export function Button({
  label,
  icon,
  onPress,
  href,
  variant = 'primary',
  disabled,
  block,
  small,
}: {
  label: string;
  icon?: IconName;
  onPress?: () => void;
  href?: Href;
  variant?: BtnVariant;
  disabled?: boolean;
  block?: boolean;
  small?: boolean;
}) {
  const { c } = useTheme();
  const router = useRouter();
  const colors: Record<BtnVariant, { bg: string; fg: string; border: string }> = {
    primary: { bg: c.primaryStrong, fg: c.onPrimary, border: c.primaryStrong },
    lime: { bg: c.lime, fg: c.onLime, border: c.lime },
    ghost: { bg: c.surface, fg: c.text, border: c.line },
    dark: { bg: c.text, fg: c.surface, border: c.text },
  };
  const col = disabled ? { bg: c.surface2, fg: c.muted, border: c.surface2 } : colors[variant];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => (href ? router.push(href) : onPress?.())}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        alignSelf: block ? 'stretch' : 'flex-start',
        paddingVertical: small ? 7 : 13,
        paddingHorizontal: small ? 14 : 22,
        borderRadius: radius.pill,
        borderWidth: 1.5,
        backgroundColor: col.bg,
        borderColor: col.border,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {icon && <Icon name={icon} size={small ? 16 : 18} color={col.fg} />}
      <Text style={{ fontFamily: fonts.bold, fontSize: small ? 13 : 15, color: col.fg }}>{label}</Text>
    </Pressable>
  );
}

export function Chip({ label, onPress, disabled }: { label: string; onPress?: () => void; disabled?: boolean }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => ({
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: radius.pill,
        borderWidth: 1.5,
        borderColor: pressed ? c.text : c.line,
        backgroundColor: c.surface,
        opacity: disabled ? 0.5 : 1,
      })}
    >
      <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: c.text }}>{label}</Text>
    </Pressable>
  );
}

export function Row({ children, gap = 8, wrap, style }: { children: ReactNode; gap?: number; wrap?: boolean; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap, flexWrap: wrap ? 'wrap' : 'nowrap' }, style]}>{children}</View>;
}

/** 흰 카드 */
export function Card({ children, style, padded = true }: { children: ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={[glass(c), { borderRadius: radius.xl, padding: padded ? 24 : 0, gap: 12 }, shadow(c), style]}>
      {children}
    </View>
  );
}

/** 목록 행 (메뉴, 펼침 머리 등) */
export function ListRow({
  icon,
  iconColor,
  label,
  right,
  onPress,
  last,
}: {
  icon?: IconName;
  iconColor?: string;
  label: string;
  right?: ReactNode;
  onPress?: () => void;
  last?: boolean;
}) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 16,
        paddingHorizontal: 14,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: c.line,
        backgroundColor: pressed ? c.surface3 : 'transparent',
        borderRadius: 14,
      })}
    >
      {icon && <Icon name={icon} size={22} color={iconColor ?? c.primary} />}
      <T v="bodyBold" style={{ flex: 1 }}>
        {label}
      </T>
      {right ?? <Icon name="chevronRight" color={c.muted} />}
    </Pressable>
  );
}

/* ───────── 정보 표시 ───────── */
export function SourceInfo({ source }: { source: Source }) {
  const { c } = useTheme();
  const date = new Date(source.retrievedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  return (
    <Row gap={6} wrap>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: c.primary }} />
      <T v="label" style={{ fontFamily: fonts.regular }}>
        출처:{' '}
        <Text
          style={{ color: c.primaryStrong, textDecorationLine: source.url ? 'underline' : 'none' }}
          onPress={source.url ? () => Linking.openURL(source.url!) : undefined}
        >
          {source.name}
        </Text>{' '}
        · {date} 조회
      </T>
    </Row>
  );
}

export function Disclaimer() {
  const { c } = useTheme();
  return (
    <View style={{ backgroundColor: c.surface2, borderRadius: radius.lg, padding: 16, gap: 2 }}>
      <T v="bodyBold" style={{ fontSize: 14 }}>
        꼭 확인하세요
      </T>
      <T v="small" color={c.text2}>
        AI 설명은 공식 의약품 정보를 쉬운 말로 바꾼 것으로, 안전 여부를 판단하지 않습니다. 복용을 시작하거나 멈추기 전에는 반드시 의사
        또는 약사와 상담하세요.
      </T>
    </View>
  );
}

export function Spinner({ label = '불러오는 중…' }: { label?: string }) {
  const { c } = useTheme();
  return (
    <Row gap={10} style={{ justifyContent: 'center', paddingVertical: 32 }}>
      <ActivityIndicator color={c.primary} />
      <T color={c.muted}>{label}</T>
    </Row>
  );
}

export function ErrorBox({ error, onRetry }: { error: Error; onRetry?: () => void }) {
  const { c } = useTheme();
  return (
    <View style={{ backgroundColor: c.dangerSoft, borderRadius: radius.md, padding: 16, gap: 10, flex: 1 }}>
      <T color={c.danger}>{error.message}</T>
      {onRetry && <Button label="다시 시도" variant="ghost" small onPress={onRetry} />}
    </View>
  );
}

/** 불러오는 동안 깜빡이는 회색 줄 */
export function Skeleton({ lines = 3 }: { lines?: number }) {
  const { c } = useTheme();
  const opacity = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return (
    <Animated.View style={{ gap: 10, opacity }}>
      {Array.from({ length: lines }, (_, i) => (
        <View key={i} style={{ height: 14, borderRadius: 7, backgroundColor: c.surface2, width: `${90 - i * 18}%` }} />
      ))}
    </Animated.View>
  );
}

export function Empty({ title, desc, action }: { title: string; desc?: string; action?: ReactNode }) {
  const { c } = useTheme();
  return (
    <View style={[{ alignItems: 'center', gap: 8, paddingVertical: 28, paddingHorizontal: 20, ...glass(c), borderRadius: radius.xl }, shadow(c, 0.5)]}>
      <Mascot size={96} halo="mint" />
      <T v="bodyBold" style={{ textAlign: 'center' }}>
        {title}
      </T>
      {desc ? (
        <T v="small" color={c.muted} style={{ textAlign: 'center' }}>
          {desc}
        </T>
      ) : null}
      {action ? <View style={{ alignItems: 'center', marginTop: 6 }}>{action}</View> : null}
    </View>
  );
}

/** 원문에서 근거 구절을 형광펜처럼 표시 */
export function Highlight({ text, quotes, active }: { text: string; quotes: string[]; active?: string }) {
  const { c } = useTheme();
  const valid = quotes.filter((q) => q && text.includes(q));
  if (valid.length === 0) return <>{text}</>;
  const escaped = valid.map((q) => q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const parts = text.split(new RegExp(`(${escaped.join('|')})`, 'g'));
  return (
    <>
      {parts.map((p, i) =>
        valid.includes(p) ? (
          <Text key={i} style={{ backgroundColor: p === active ? c.markActive : c.mark, color: c.markFg }}>
            {p}
          </Text>
        ) : (
          p
        ),
      )}
    </>
  );
}

/** 펼침/접힘 상태 하나 */
export function useToggle(initial = false) {
  const [on, set] = useState(initial);
  return [on, () => set((v) => !v), set] as const;
}
