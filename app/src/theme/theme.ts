import { Platform, useColorScheme } from 'react-native';

// 디자인 토큰. 디자인 레퍼런스가 바뀌면 이 파일부터 고친다.
// 분위기: 부드러운 파스텔 배경, 큰 라운드 카드, 선명한 그린 패널, 민트 선택 상태, 떠 있는 탭바.
// 메인 컬러를 바꾸려면 primary·block·mint 계열만 바꾸면 된다.

const light = {
  bg: '#f2f7f4',
  bgGlow: '#d6f3e5',
  /** 화면 배경 그라데이션: 위(bgGlow) → 가운데(bg) → 아래(bgEnd) */
  bgEnd: '#e9f4ef',
  /** 반투명 유리 카드 */
  card: 'rgba(255,255,255,0.82)',
  cardBorder: 'rgba(255,255,255,0.95)',
  /** 떠 있는 탭바 유리 */
  barGlass: 'rgba(255,255,255,0.55)',
  barShine: 'rgba(255,255,255,0.75)',
  /** 선택된 탭 구슬 그라데이션 */
  orbFrom: '#8af0bf',
  orbTo: '#12a35d',
  surface: '#ffffff',
  surface2: '#eef3f0',
  surface3: '#f7faf8',
  text: '#101814',
  text2: '#3a4740',
  muted: '#7a8780',
  line: '#e4ebe7',
  primary: '#16a862',
  primaryStrong: '#0f8f51',
  primarySoft: '#e3f6ec',
  primaryDisabled: '#b4dfc8',
  onPrimary: '#ffffff',
  /** 그린 패널 그라디언트 */
  block: '#1cb86c',
  blockDeep: '#0b8048',
  onBlock: '#ffffff',
  onBlockMuted: 'rgba(255,255,255,0.82)',
  glass: 'rgba(255,255,255,0.22)',
  /** 포인트(민트) — 장식 원, 배지, 강조 */
  lime: '#cdf5e0',
  onLime: '#0b5c34',
  /** 선택된 항목(레퍼런스의 민트 선택 상태) */
  mint: '#e2f8ee',
  mintLine: '#86dbb3',
  /** 떠 있는 탭바의 선택 버튼 */
  ink: '#141b17',
  onInk: '#ffffff',
  warn: '#b26a00',
  warnSoft: '#fff3dc',
  danger: '#d64535',
  dangerSoft: '#fdecea',
  mark: '#d9f6e8',
  markActive: '#9fe6c4',
  markFg: '#101814',
  quoteBg: '#eefaf4',
  pillShell: '#ffffff',
  pillLine: '#d3e2d9',
  pillShine: 'rgba(255,255,255,0.9)',
  blush: '#ff9fb2',
  shadow: '#1d4a33',
};

export type Colors = typeof light;

const dark: Colors = {
  ...light,
  bg: '#0c110e',
  bgGlow: '#123222',
  bgEnd: '#0e1712',
  card: 'rgba(24,33,28,0.82)',
  cardBorder: 'rgba(255,255,255,0.06)',
  barGlass: 'rgba(30,40,34,0.6)',
  barShine: 'rgba(255,255,255,0.08)',
  orbFrom: '#6ff0ae',
  orbTo: '#119c58',
  surface: '#151c18',
  surface2: '#1c2520',
  surface3: '#18211c',
  text: '#e9f1ec',
  text2: '#c4d0c9',
  muted: '#8c9c93',
  line: '#26322b',
  primary: '#3ddc8a',
  primaryStrong: '#3ddc8a',
  primarySoft: '#14301f',
  primaryDisabled: '#23402f',
  onPrimary: '#04210f',
  block: '#159457',
  blockDeep: '#0a5a33',
  onBlockMuted: 'rgba(255,255,255,0.78)',
  glass: 'rgba(255,255,255,0.14)',
  lime: '#1f4a33',
  onLime: '#bdf3d6',
  mint: '#15291f',
  mintLine: '#2f8a5f',
  ink: '#e9f1ec',
  onInk: '#0c110e',
  warn: '#f0a94a',
  warnSoft: '#3a2a12',
  danger: '#ff7b6e',
  dangerSoft: '#3d1d1a',
  mark: '#1d4a33',
  markActive: '#2f8a5f',
  markFg: '#e9fff2',
  quoteBg: '#14261c',
  pillShell: '#dce6de',
  pillLine: '#3a4a40',
  pillShine: 'rgba(255,255,255,0.6)',
  shadow: '#000000',
};

export const radius = { xl: 32, lg: 26, md: 20, pill: 999 };

/** 폰트 이름(@expo-google-fonts). 굵기마다 다른 파일이라 fontWeight 대신 fontFamily로 고른다. */
export const fonts = {
  display: 'Sora_700Bold',
  displayMedium: 'Sora_600SemiBold',
  regular: 'NotoSansKR_400Regular',
  medium: 'NotoSansKR_500Medium',
  bold: 'NotoSansKR_700Bold',
};

/** 한글이 섞인 제목: Sora에는 한글이 없어서 한글 글꼴을 쓴다 */
export const hasHangul = (s: string) => /[가-힣]/.test(s);

export function useTheme() {
  const scheme = useColorScheme();
  const c = scheme === 'dark' ? dark : light;
  return { c, dark: scheme === 'dark' };
}

/** 부드럽게 퍼지는 그림자 (레퍼런스의 떠 있는 카드 느낌) */
export const shadow = (c: Colors, strength = 1) => ({
  shadowColor: c.shadow,
  shadowOpacity: 0.08 * strength,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 },
  elevation: 3 * strength,
});

/** 반투명 유리 카드: 흰 테두리 + (웹에서는) 배경 흐림 */
export const glass = (c: Colors) => ({
  backgroundColor: c.card,
  borderWidth: 1,
  borderColor: c.cardBorder,
  ...(Platform.OS === 'web' ? ({ backdropFilter: 'blur(16px)' } as object) : {}),
});
