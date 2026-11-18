import { View } from 'react-native';
import { Icon, type IconName } from '../components/Icon';
import { Card, Disclaimer, PageTop, Row, Screen, T } from '../components/ui';
import { useTheme } from '../theme/theme';

const SECTIONS: { icon: IconName; title: string; items: string[]; numbered?: boolean }[] = [
  {
    icon: 'sparkle',
    title: 'AI 쉬운 설명은 이렇게 만들어져요',
    numbered: true,
    items: [
      '선택한 의약품의 공식 정보(효능, 용법, 주의사항 등)를 먼저 찾아요.',
      '찾은 원문만 AI에게 전달해서 쉬운 말로 바꿔 달라고 해요.',
      'AI 설명 아래에 근거가 된 원문 구절을 함께 보여드려요.',
    ],
  },
  {
    icon: 'shield',
    title: 'AI가 하지 않는 일',
    items: [
      '약을 먹어도 되는지 안전 여부를 판단하지 않아요.',
      '공식 정보에 없는 내용이나 새로운 상호작용을 만들어 내지 않아요.',
      '답을 찾지 못하면 의사나 약사에게 문의하도록 안내해요.',
    ],
  },
  {
    icon: 'file',
    title: '정보 출처',
    items: ['식품의약품안전처 의약품개요정보(e약은요)', '식품의약품안전처 의약품안전사용서비스(DUR) 품목정보'],
  },
];

export default function AboutScreen() {
  const { c } = useTheme();
  return (
    <Screen header={<PageTop title="서비스 안내" />}>
      <T color={c.text2} style={{ fontSize: 17 }}>
        MEDI GUARD는 식품의약품안전처의 공식 의약품 정보를 AI가 쉬운 말로 설명해 주는 서비스예요. 설명마다 근거가 된 공식 원문을 함께
        보여드려요.
      </T>
      {SECTIONS.map((s) => (
        <Card key={s.title}>
          <Row gap={8}>
            <Icon name={s.icon} color={c.primary} />
            <T v="h3">{s.title}</T>
          </Row>
          <View style={{ gap: 6 }}>
            {s.items.map((item, i) => (
              <Row key={item} gap={10} style={{ alignItems: 'flex-start' }}>
                <T v="bodyBold" color={c.primary} style={{ width: 16 }}>
                  {s.numbered ? `${i + 1}.` : '•'}
                </T>
                <T style={{ flex: 1 }}>{item}</T>
              </Row>
            ))}
          </View>
        </Card>
      ))}
      <Disclaimer />
      <T v="small" color={c.muted}>
        만든 사람: 상명대학교 팀 머니머니
      </T>
    </Screen>
  );
}
