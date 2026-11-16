// 장식 요소: 마스코트 '메디', 그라디언트 패널, 빛나는 구, 사선 무늬 카드, 둥근 아이콘 버튼
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Ellipse, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { glass, radius, shadow, useTheme } from '../theme/theme';
import { Icon, type IconName } from './Icon';

/** 마스코트 '메디': 웃는 캡슐 캐릭터 (레퍼런스의 3D 캐릭터 역할) */
export function Mascot({ size = 140, wave = true }: { size?: number; wave?: boolean }) {
  const { c } = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 160 160">
      <Defs>
        <RadialGradient id="shell" cx="38%" cy="28%" r="80%">
          <Stop offset="0" stopColor="#ffffff" />
          <Stop offset="0.65" stopColor="#f1f6f3" />
          <Stop offset="1" stopColor="#d7e4dc" />
        </RadialGradient>
        <RadialGradient id="green" cx="35%" cy="20%" r="90%">
          <Stop offset="0" stopColor="#5fe3a0" />
          <Stop offset="0.6" stopColor="#1cb86c" />
          <Stop offset="1" stopColor="#0b7a43" />
        </RadialGradient>
      </Defs>
      <Ellipse cx="80" cy="150" rx="36" ry="5" fill="#000" opacity={0.12} />
      {/* 팔 */}
      <Path d="M46 98c-12-2-18-10-18-20" stroke="#14a05c" strokeWidth={8} strokeLinecap="round" fill="none" />
      <Path d={wave ? 'M114 92c12-4 18-14 16-28' : 'M114 98c12-2 18-10 18-20'} stroke="#14a05c" strokeWidth={8} strokeLinecap="round" fill="none" />
      {/* 몸통 */}
      <Rect x="44" y="16" width="72" height="128" rx="36" fill="url(#shell)" />
      <Path d="M44 82h72v26a36 36 0 0 1-72 0Z" fill="url(#green)" />
      <Path d="M44 82h72" stroke="#c9d9cf" strokeWidth={1.5} />
      <Ellipse cx="62" cy="38" rx="7" ry="13" fill="#fff" opacity={0.9} />
      <Ellipse cx="60" cy="104" rx="5" ry="10" fill="#fff" opacity={0.28} />
      {/* 얼굴 */}
      <Ellipse cx="68" cy="60" rx="5" ry="6.5" fill="#141b17" />
      <Ellipse cx="92" cy="60" rx="5" ry="6.5" fill="#141b17" />
      <Circle cx="69.8" cy="57.6" r="1.8" fill="#fff" />
      <Circle cx="93.8" cy="57.6" r="1.8" fill="#fff" />
      <Ellipse cx="59" cy="70" rx="6" ry="3.5" fill={c.blush} opacity={0.65} />
      <Ellipse cx="101" cy="70" rx="6" ry="3.5" fill={c.blush} opacity={0.65} />
      <Path d="M73 69q7 7 14 0" stroke="#141b17" strokeWidth={3} strokeLinecap="round" fill="none" />
    </Svg>
  );
}

/** 빛나는 구 (AI 도우미 패널 가운데) */
export function GlowOrb({ size = 160 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 160 160">
      <Defs>
        <RadialGradient id="orb" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#ffffff" stopOpacity={0.95} />
          <Stop offset="0.45" stopColor="#b9f5d6" stopOpacity={0.75} />
          <Stop offset="1" stopColor="#5fe3a0" stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx="80" cy="80" r="80" fill="url(#orb)" />
    </Svg>
  );
}

/** 그린 그라디언트 패널 (레퍼런스의 파란 큰 패널) */
export function GradientPanel({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  return (
    <LinearGradient
      colors={[c.block, c.blockDeep]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ borderRadius: radius.xl, overflow: 'hidden', padding: 20 }, shadow(c, 1.5), style]}
    >
      <View pointerEvents="none" style={{ position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: c.glass, top: -90, right: -60 }} />
      <View pointerEvents="none" style={{ position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: c.glass, bottom: -70, left: -40, opacity: 0.6 }} />
      {children}
    </LinearGradient>
  );
}

/** 둥근 아이콘 버튼 */
export function RoundButton({
  icon,
  onPress,
  label,
  variant = 'surface',
  size = 44,
  active,
}: {
  icon: IconName;
  onPress?: () => void;
  label: string;
  variant?: 'surface' | 'soft' | 'primary' | 'glass' | 'ink';
  size?: number;
  active?: boolean;
}) {
  const { c } = useTheme();
  const bg = { surface: c.card, soft: c.surface2, primary: c.primaryStrong, glass: c.glass, ink: c.ink }[variant];
  const fg = { surface: c.text, soft: c.muted, primary: c.onPrimary, glass: c.onBlock, ink: c.onInk }[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={active !== undefined ? { selected: active } : undefined}
      onPress={onPress}
      style={({ pressed }) => [
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.8 : 1 },
        variant === 'surface' && [glass(c), shadow(c, 0.6)],
      ]}
    >
      <Icon name={icon} size={Math.round(size * 0.45)} color={fg} />
    </Pressable>
  );
}

/** 화면 전체 배경: 위에서 아래로 부드럽게 바뀌는 그라데이션 + 은은한 빛 번짐 */
export function BackgroundGlow() {
  const { c } = useTheme();
  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
      <LinearGradient
        colors={[c.bgGlow, c.bg, c.bgEnd]}
        locations={[0, 0.45, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View style={{ position: 'absolute', width: 320, height: 320, borderRadius: 160, backgroundColor: c.bgGlow, opacity: 0.55, top: -140, right: -120 }} />
    </View>
  );
}
