// 의약품 관련 조각: 검색창, 결과 카드, 태그, 썸네일
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { fonts, radius, shadow, useTheme } from '../theme/theme';
import type { DrugSummary } from '../types';
import { Icon, PillArt } from './Icon';
import { T } from './ui';

export function ingredientLine(d: DrugSummary) {
  if (d.ingredients.length === 1) return [d.ingredients[0], d.strength].filter(Boolean).join(' ');
  return `${d.ingredients[0]} 외 ${d.ingredients.length - 1}종`;
}

export function DrugTags({ drug }: { drug: DrugSummary }) {
  const { c } = useTheme();
  const tag = (label: string, rx = false) => (
    <View key={label} style={{ paddingVertical: 3, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: rx ? c.text : c.surface2 }}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 12, color: rx ? c.surface : c.text2 }}>{label}</Text>
    </View>
  );
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
      {tag(drug.category, drug.category === '전문의약품')}
      {drug.classification ? tag(drug.classification) : null}
    </View>
  );
}

export function Thumb({ large = false }: { large?: boolean }) {
  const { c } = useTheme();
  return (
    <View
      style={{
        width: large ? '100%' : 72,
        height: large ? 150 : 72,
        borderRadius: large ? radius.lg : radius.md,
        backgroundColor: large ? c.lime : c.surface2,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <PillArt size={large ? 120 : 52} />
    </View>
  );
}

/** 검색 결과 카드 / 조회 기록 행 */
export function DrugCard({ drug, sub, showTags = true }: { drug: DrugSummary; sub?: string; showTags?: boolean }) {
  const { c } = useTheme();
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => router.push({ pathname: '/drugs/[id]', params: { id: drug.id } })}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          padding: 12,
          paddingRight: 14,
          backgroundColor: c.surface,
          borderRadius: radius.lg,
          borderWidth: 1.5,
          borderColor: pressed ? c.text : 'transparent',
        },
        shadow(c, 0.6),
      ]}
    >
      <Thumb />
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <T v="h3" numberOfLines={2}>
          {drug.name}
        </T>
        <T v="small" color={c.muted}>
          {sub ?? ingredientLine(drug)}
        </T>
        {showTags && <DrugTags drug={drug} />}
      </View>
      <Icon name="chevronRight" color={c.muted} />
    </Pressable>
  );
}

/** 검색창. hero: 오른쪽 원형 검색 버튼 / plain: 지우기(X) 버튼 */
export function SearchBar({
  initialValue = '',
  onSearch,
  onClear,
  placeholder = '의약품명을 검색해 보세요. (예: 타이레놀)',
  autoFocus,
  variant = 'plain',
}: {
  initialValue?: string;
  onSearch: (q: string) => void;
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  variant?: 'hero' | 'plain';
}) {
  const { c } = useTheme();
  const [value, setValue] = useState(initialValue);
  useEffect(() => setValue(initialValue), [initialValue]);
  const submit = () => value.trim() && onSearch(value.trim());

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: c.surface,
          borderRadius: radius.pill,
          borderWidth: 1.5,
          borderColor: c.line,
          paddingLeft: 18,
          paddingRight: 6,
          paddingVertical: variant === 'hero' ? 6 : 2,
        },
        variant === 'hero' && shadow(c),
      ]}
    >
      <Icon name="search" color={c.muted} />
      <TextInput
        value={value}
        onChangeText={setValue}
        onSubmitEditing={submit}
        placeholder={placeholder}
        placeholderTextColor={c.muted}
        returnKeyType="search"
        autoFocus={autoFocus}
        accessibilityLabel="의약품 검색"
        style={{ flex: 1, minWidth: 0, fontFamily: fonts.regular, fontSize: 16, color: c.text, paddingVertical: 10 }}
      />
      {variant === 'plain' && value.length > 0 && (
        <Pressable
          accessibilityLabel="검색어 지우기"
          onPress={() => {
            setValue('');
            onClear?.();
          }}
          style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name="close" />
        </Pressable>
      )}
      {variant === 'hero' && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="검색"
          onPress={submit}
          style={{ width: 48, height: 48, borderRadius: radius.pill, backgroundColor: c.primaryStrong, alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name="search" size={22} color={c.onPrimary} />
        </Pressable>
      )}
    </View>
  );
}
