import { useColorScheme } from 'react-native';

// 디자인 토큰. 디자인 레퍼런스가 바뀌면 이 파일부터 고친다.
// 메인 컬러 그린 + 포인트 라임, 큰 라운드, 알약형 버튼.

const light = {
  bg: '#f6f7f4',
  surface: '#ffffff',
  surface2: '#eef1ec',
  surface3: '#f8f9f7',
  text: '#0e1a13',
  text2: '#34423a',
  muted: '#66746b',
  line: '#e3e7e1',
  primary: '#0b9a55',
  primaryStrong: '#06703d',
  primarySoft: '#e2f4e8',
  primaryDisabled: '#a9cdb8',
  onPrimary: '#ffffff',
  block: '#0b9a55',
  blockDeep: '#077a43',
  onBlock: '#ffffff',
  onBlockMuted: 'rgba(255,255,255,0.8)',
  lime: '#c4f03c',
  onLime: '#0e1a13',
  warn: '#a55f00',
  warnSoft: '#fff3dc',
  danger: '#c0392b',
  dangerSoft: '#fdecea',
  mark: '#eafbb0',
  markActive: '#c4f03c',
  markFg: '#0e1a13',
  quoteBg: '#f4fbe0',
  pillShell: '#ffffff',
  pillLine: '#cfdacf',
  pillShine: 'rgba(255,255,255,0.9)',
  shadow: '#0e1a13',
};

export type Colors = typeof light;

const dark: Colors = {
  ...light,
  bg: '#0b100d',
  surface: '#131b16',
  surface2: '#1b261f',
  surface3: '#17211b',
  text: '#eaf1ec',
  text2: '#c6d2ca',
  muted: '#8e9e94',
  line: '#26332b',
  primary: '#34d17f',
  primaryStrong: '#34d17f',
  primarySoft: '#133222',
  primaryDisabled: '#22402f',
  onPrimary: '#04210f',
  block: '#0e5f37',
  blockDeep: '#0a4a2a',
  onBlockMuted: 'rgba(255,255,255,0.75)',
  lime: '#b8e636',
  warn: '#f0a94a',
  warnSoft: '#3a2a12',
  danger: '#ff7b6e',
  dangerSoft: '#3d1d1a',
  mark: '#3d4a12',
  markActive: '#6b7f1c',
  markFg: '#f4ffd6',
  quoteBg: '#1f2612',
  pillShell: '#dce6de',
  pillLine: '#3a4a40',
  pillShine: 'rgba(255,255,255,0.6)',
  shadow: '#000000',
};

export const radius = { xl: 32, lg: 24, md: 16, pill: 999 };

/** 폰트 이름(@expo-google-fonts). 굵기마다 다른 파일이라 fontWeight 대신 fontFamily로 고른다. */
export const fonts = {
  display: 'Sora_700Bold',
  displayMedium: 'Sora_600SemiBold',
  regular: 'NotoSansKR_400Regular',
  medium: 'NotoSansKR_500Medium',
  bold: 'NotoSansKR_700Bold',
};

/** 한글이 섞인 제목: Sora에는 한글이 없어서 한글 굵은 글꼴을 쓴다 */
export const hasHangul = (s: string) => /[가-힣]/.test(s);

export function useTheme() {
  const scheme = useColorScheme();
  const c = scheme === 'dark' ? dark : light;
  return { c, dark: scheme === 'dark' };
}

export const shadow = (c: Colors, strength = 1) => ({
  shadowColor: c.shadow,
  shadowOpacity: 0.07 * strength,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 8 },
  elevation: 2 * strength,
});
