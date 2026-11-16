import type { ImageSourcePropType } from 'react-native';

/** 식약처 낱알 사진의 배경색. 둥근 썸네일 배경을 이 색으로 맞춰 사진이 자연스럽게 이어지게 한다. */
export const PILL_PHOTO_BG = '#a5c0eb';

// 앱에 함께 넣어 둔 의약품 사진 (출처: 식품의약품안전처 의약품안전나라 의약품 상세정보)
// 목업 데이터는 'local:<이름>' 형식의 주소를 쓰고, 실제 API는 https:// 주소를 보낸다.
const LOCAL: Record<string, ImageSourcePropType> = {
  'tylenol-500-pill': require('../../assets/drugs/tylenol-500-pill.jpg'),
  'tylenol-500-package': require('../../assets/drugs/tylenol-500-package.jpg'),
  'geborin-pill': require('../../assets/drugs/geborin-pill.jpg'),
  'geborin-package': require('../../assets/drugs/geborin-package.jpg'),
  'sporanox-pill': require('../../assets/drugs/sporanox-pill.jpg'),
  'zocor-20-pill': require('../../assets/drugs/zocor-20-pill.jpg'),
  'zocor-20-package': require('../../assets/drugs/zocor-20-package.jpg'),
  // 둥근 썸네일용: 낱알 사진에서 알약 하나를 정사각형으로 잘라낸 것
  'tylenol-500-thumb': require('../../assets/drugs/tylenol-500-thumb.jpg'),
  'geborin-thumb': require('../../assets/drugs/geborin-thumb.jpg'),
  'sporanox-thumb': require('../../assets/drugs/sporanox-thumb.jpg'),
  'zocor-20-thumb': require('../../assets/drugs/zocor-20-thumb.jpg'),
};

/** 사진 주소 → <Image source>. 'local:' 주소는 앱에 넣어 둔 사진을 쓴다. */
export function imageSource(url: string): ImageSourcePropType | undefined {
  if (url.startsWith('local:')) return LOCAL[url.slice('local:'.length)];
  return { uri: url };
}
