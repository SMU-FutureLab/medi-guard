// MEDI GUARD 로고: 위는 십자가 있는 캡슐, 아래는 방패 끝 모양 + 'MediGuard' 글자
import { Text, View } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';
import { useTheme } from '../theme/theme';

/** 로고 색 (확정 로고 기준) */
export const LOGO = {
  green: '#22a06b',
  deep: '#0c5c3c',
  ink: '#13231b',
  mint: '#c9efd9',
};

/**
 * 로고 마크 (가로:세로 = 60:108).
 * variant
 *  - color: 기본 (초록 + 진초록)
 *  - inverse: 초록 바탕 위 (흰색 + 연민트) — 앱 아이콘 안쪽 모양
 */
export function LogoMark({ height = 40, variant = 'color' }: { height?: number; variant?: 'color' | 'inverse' }) {
  const top = variant === 'color' ? LOGO.green : '#ffffff';
  const bottom = variant === 'color' ? LOGO.deep : LOGO.mint;
  const cross = variant === 'color' ? '#ffffff' : LOGO.green;
  return (
    <Svg width={(height * 60) / 108} height={height} viewBox="0 0 60 108" accessibilityLabel="MEDI GUARD 로고">
      {/* 캡슐 윗부분 */}
      <Path d="M0 52V30a30 30 0 0 1 60 0v22Z" fill={top} />
      <Rect x="26" y="19" width="8" height="26" rx="2" fill={cross} />
      <Rect x="17" y="28" width="26" height="8" rx="2" fill={cross} />
      {/* 방패 아랫부분 */}
      <Path d="M0 56h60v10c0 18-14 32-30 42C14 98 0 84 0 66Z" fill={bottom} />
    </Svg>
  );
}

/** 앱 아이콘 모양: 초록 둥근 사각형 안에 흰 로고 */
export function LogoBadge({ size = 44 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size * 0.28, backgroundColor: LOGO.green, alignItems: 'center', justifyContent: 'center' }}>
      <LogoMark height={size * 0.62} variant="inverse" />
    </View>
  );
}

/** 'MediGuard' 글자 (Medi는 진한색, Guard는 초록) */
export function Wordmark({ size = 20, onDark = false }: { size?: number; onDark?: boolean }) {
  const { c, dark } = useTheme();
  const ink = onDark || dark ? c.text : LOGO.ink;
  return (
    <Text style={{ fontFamily: 'Nunito_800ExtraBold', fontSize: size, letterSpacing: -0.3, color: onDark ? '#ffffff' : ink }} accessibilityLabel="MediGuard">
      Medi
      <Text style={{ color: onDark ? LOGO.mint : dark ? c.primary : LOGO.green }}>Guard</Text>
    </Text>
  );
}

/** 마크 + 글자 가로 배치 (헤더용) */
export function LogoLockup({ height = 30, onDark = false }: { height?: number; onDark?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: height * 0.3 }}>
      <LogoMark height={height} />
      <Wordmark size={height * 0.66} onDark={onDark} />
    </View>
  );
}
