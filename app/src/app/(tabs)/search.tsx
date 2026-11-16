import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { api } from '../../api/client';
import { Mascot, RoundButton } from '../../components/art';
import { DrugCard, SearchBar } from '../../components/drug';
import { Icon } from '../../components/Icon';
import { ErrorBox, Row, Screen, Spinner, T } from '../../components/ui';
import { useAsync } from '../../hooks/useAsync';
import { useAppStore } from '../../store/AppStore';
import { fonts, glass, radius, shadow, useTheme } from '../../theme/theme';

const SUGGESTIONS = ['타이레놀', '게보린', '이트라코나졸', '심바스타틴'];

export default function SearchScreen() {
  const { c } = useTheme();
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const query = typeof q === 'string' ? q : '';
  const { history } = useAppStore();
  const search = (next: string) => router.setParams({ q: next });
  const { data, error, loading, retry } = useAsync(() => api.searchDrugs(query), [query], !!query);

  return (
    <Screen tabs contentStyle={{ gap: 18 }}>
      {/* 헤더 */}
      <Row style={{ justifyContent: 'space-between' }}>
        <T v="h1">의약품 검색</T>
        <RoundButton icon="star" label="관심 의약품" onPress={() => router.push('/favorites')} />
      </Row>

      <SearchBar
        variant="hero"
        initialValue={query}
        onSearch={search}
        onClear={() => router.setParams({ q: '' })}
        placeholder="약 이름 또는 성분명"
        autoFocus={!query}
      />

      {/* 추천 검색어 */}
      {!query && (
        <View style={{ gap: 10 }}>
          <T v="h3">추천 검색어</T>
          <Row wrap gap={8}>
            {SUGGESTIONS.map((s) => (
              <Pressable
                key={s}
                onPress={() => search(s)}
                style={({ pressed }) => [
                  glass(c),
                  { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: radius.pill, paddingVertical: 9, paddingLeft: 10, paddingRight: 16, opacity: pressed ? 0.8 : 1 },
                  shadow(c, 0.4),
                ]}
              >
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c.mint, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="search" size={12} color={c.primaryStrong} />
                </View>
                <Text style={{ fontFamily: fonts.medium, fontSize: 14, color: c.text }}>{s}</Text>
              </Pressable>
            ))}
          </Row>
        </View>
      )}

      {/* 최근 조회 */}
      {!query && history.length > 0 && (
        <View style={{ gap: 10 }}>
          <SectionHead title="최근 조회한 의약품" action="전체 보기" onAction={() => router.navigate('/history')} />
          {history.slice(0, 3).map((h) => (
            <DrugCard key={h.drug.id} drug={h.drug} />
          ))}
        </View>
      )}

      {/* 검색 전 안내 */}
      {!query && history.length === 0 && <Guide text={'약 이름을 입력하면\n공식 정보를 찾아드려요'} />}

      {/* 검색 결과 */}
      {query !== '' && (
        <View style={{ gap: 10 }}>
          {loading && <Spinner label="공식 의약품 정보를 검색하고 있어요…" />}
          {error && <ErrorBox error={error} onRetry={retry} />}
          {data && (
            <>
              <Row gap={8}>
                <T v="h3">검색 결과</T>
                <View style={{ backgroundColor: c.primaryStrong, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 1 }}>
                  <Text style={{ fontFamily: fonts.bold, fontSize: 13, color: c.onPrimary }}>{data.length}</Text>
                </View>
              </Row>
              {data.length === 0 ? (
                <Guide text={`‘${query}’ 검색 결과가 없어요`} sub="약 이름을 정확히 입력했는지, 띄어쓰기를 빼고 다시 검색해 보세요." />
              ) : (
                data.map((d) => <DrugCard key={d.id} drug={d} />)
              )}
            </>
          )}
        </View>
      )}
    </Screen>
  );
}

function SectionHead({ title, action, onAction }: { title: string; action: string; onAction: () => void }) {
  const { c } = useTheme();
  return (
    <Row style={{ justifyContent: 'space-between' }}>
      <T v="h3">{title}</T>
      <Pressable onPress={onAction} style={[glass(c), { borderRadius: radius.pill, paddingVertical: 5, paddingHorizontal: 12 }]}>
        <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: c.text2 }}>{action}</Text>
      </Pressable>
    </Row>
  );
}

/** 마스코트와 함께 보여주는 안내 (검색 전 / 결과 없음) */
function Guide({ text, sub }: { text: string; sub?: string }) {
  const { c } = useTheme();
  return (
    <View style={[glass(c), { borderRadius: radius.xl, paddingVertical: 28, paddingHorizontal: 20, alignItems: 'center', gap: 8 }, shadow(c, 0.5)]}>
      <Mascot size={96} />
      <T v="bodyBold" style={{ textAlign: 'center' }}>
        {text}
      </T>
      {sub ? (
        <T v="small" color={c.muted} style={{ textAlign: 'center' }}>
          {sub}
        </T>
      ) : null}
    </View>
  );
}
