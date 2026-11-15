import type { ReactNode } from 'react';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { useTheme } from '../theme/theme';

// 선 아이콘 모음 (24x24). 웹 버전과 같은 모양.
const PATHS = {
  home: (
    <>
      <Path d="M3 10.5 12 3l9 7.5" />
      <Path d="M5 9.5V21h14V9.5" />
      <Path d="M10 21v-6h4v6" />
    </>
  ),
  search: (
    <>
      <Circle cx="11" cy="11" r="7" />
      <Path d="m20 20-3.5-3.5" />
    </>
  ),
  record: (
    <>
      <Rect x="5" y="3" width="14" height="18" rx="2" />
      <Path d="M9 8h6M9 12h6M9 16h4" />
    </>
  ),
  user: (
    <>
      <Circle cx="12" cy="8" r="4" />
      <Path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </>
  ),
  chevronRight: <Path d="m9 6 6 6-6 6" />,
  chevronDown: <Path d="m6 9 6 6 6-6" />,
  chevronUp: <Path d="m6 15 6-6 6 6" />,
  back: (
    <>
      <Path d="M20 12H4" />
      <Path d="m10 6-6 6 6 6" />
    </>
  ),
  close: <Path d="M6 6l12 12M18 6 6 18" />,
  star: <Path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />,
  clock: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 7v5l3 2" />
    </>
  ),
  pill: (
    <>
      <Path d="M10.5 3.5a5 5 0 0 1 7 7l-7 7a5 5 0 0 1-7-7l7-7Z" />
      <Path d="m7 7 7 7" />
    </>
  ),
  shield: (
    <>
      <Path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3Z" />
      <Path d="m9 12 2 2 4-4" />
    </>
  ),
  alert: (
    <>
      <Path d="M12 3.5 2.5 20h19L12 3.5Z" />
      <Path d="M12 10v4M12 17h.01" />
    </>
  ),
  link: (
    <>
      <Path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <Path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </>
  ),
  pulse: <Path d="M3 12h4l2-5 4 10 2-5h6" />,
  layers: (
    <>
      <Path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <Path d="m3 13 9 5 9-5" />
    </>
  ),
  sparkle: (
    <>
      <Path d="M11 4c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7Z" />
      <Path d="M19 2.5v4M17 4.5h4" />
    </>
  ),
  file: (
    <>
      <Path d="M14 3H6v18h12V7l-4-4Z" />
      <Path d="M14 3v4h4M9 12h6M9 16h6" />
    </>
  ),
  bookmark: <Path d="M6 3h12v18l-6-4-6 4V3Z" />,
  info: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M12 11v6M12 7.5h.01" />
    </>
  ),
  help: (
    <>
      <Circle cx="12" cy="12" r="9" />
      <Path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01" />
    </>
  ),
  plus: <Path d="M12 5v14M5 12h14" />,
  check: <Path d="m5 12 5 5 9-10" />,
  send: <Path d="M4 12 20 4l-6 16-3-7-7-1Z" />,
} satisfies Record<string, ReactNode>;

export type IconName = keyof typeof PATHS;

export function Icon({ name, size = 20, color, fill }: { name: IconName; size?: number; color?: string; fill?: string }) {
  const { c } = useTheme();
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill ?? 'none'}
      stroke={color ?? c.text}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name]}
    </Svg>
  );
}

/** 로고 마크: 초록·라임 두 색이 겹친 십자 */
export function LogoMark({ size = 28, inverse = false }: { size?: number; inverse?: boolean }) {
  const { c } = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 28 28">
      <Rect x="2" y="10" width="24" height="8.5" rx="4.25" fill={c.lime} />
      <Rect x="9.75" y="2" width="8.5" height="24" rx="4.25" fill={inverse ? c.onBlock : c.primary} />
    </Svg>
  );
}

/** 캡슐 일러스트 (의약품 이미지가 없을 때 쓰는 대표 이미지) */
export function PillArt({ size = 96 }: { size?: number }) {
  const { c } = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <G transform="rotate(-40 60 60)">
        <Rect x="16" y="41" width="88" height="38" rx="19" fill={c.pillShell} stroke={c.pillLine} strokeWidth="2" />
        <Path d="M60 41h25a19 19 0 0 1 0 38H60Z" fill={c.primary} />
        <Path d="M60 41v38" stroke={c.pillLine} strokeWidth="2" />
        <Rect x="27" y="49" width="24" height="6" rx="3" fill={c.pillShine} />
      </G>
    </Svg>
  );
}
