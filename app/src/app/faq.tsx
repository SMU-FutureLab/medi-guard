import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Icon } from '../components/Icon';
import { Card, PageTop, Screen, T } from '../components/ui';
import { radius, useTheme } from '../theme/theme';

const FAQ = [
  {
    q: 'AI 설명을 그대로 믿어도 되나요?',
    a: 'AI 설명은 공식 원문을 쉬운 말로 바꾼 것이에요. 설명 아래의 근거 원문을 함께 확인하고, 복용을 결정할 때는 의사나 약사와 상담하세요.',
  },
  {
    q: '함께 먹는 약 확인에서 아무것도 안 나오면 안전한 건가요?',
    a: '아니요. 공식 DUR 정보에 등록된 병용금기·성분중복이 없다는 뜻일 뿐이에요. 여러 약을 함께 먹는다면 약사에게 확인하세요.',
  },
  {
    q: '질문했는데 답을 찾지 못했다고 나와요.',
    a: '공식 의약품 정보에 없는 내용은 AI가 지어내지 않도록 했어요. 그런 질문은 의사나 약사에게 문의해 주세요.',
  },
  {
    q: '조회 기록과 관심 의약품은 어디에 저장되나요?',
    a: '지금 사용하는 기기에만 저장돼요. 다른 기기에서는 보이지 않아요.',
  },
];

export default function FaqScreen() {
  const { c } = useTheme();
  const [open, setOpen] = useState<number | null>(null);
  return (
    <Screen header={<PageTop title="자주 묻는 질문" />}>
      <Card padded={false} style={{ padding: 4, gap: 0, borderRadius: radius.lg }}>
        {FAQ.map((f, i) => {
          const isOpen = open === i;
          return (
            <View key={f.q} style={{ borderTopWidth: i === 0 ? 0 : 1, borderTopColor: c.line }}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded: isOpen }}
                onPress={() => setOpen(isOpen ? null : i)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, paddingHorizontal: 14 }}
              >
                <Icon name="help" color={c.primary} />
                <T v="bodyBold" style={{ flex: 1 }}>
                  {f.q}
                </T>
                <Icon name={isOpen ? 'chevronUp' : 'chevronDown'} color={c.muted} />
              </Pressable>
              {isOpen && (
                <T color={c.text2} style={{ paddingHorizontal: 14, paddingBottom: 16, paddingLeft: 48, fontSize: 15 }}>
                  {f.a}
                </T>
              )}
            </View>
          );
        })}
      </Card>
    </Screen>
  );
}
