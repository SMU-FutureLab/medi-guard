import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { api } from '../../api/client';
import { DrugCard, SearchBar } from '../../components/drug';
import { Chip, Empty, ErrorBox, Row, Screen, Spinner, T } from '../../components/ui';
import { useAsync } from '../../hooks/useAsync';
import { useAppStore } from '../../store/AppStore';
import { fonts } from '../../theme/theme';

const SUGGESTIONS = ['타이레놀', '게보린', '이트라코나졸', '심바스타틴'];

export default function SearchScreen() {
  const router = useRouter();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const query = typeof q === 'string' ? q : '';
  const { history } = useAppStore();
  const search = (next: string) => router.setParams({ q: next });
  const { data, error, loading, retry } = useAsync(() => api.searchDrugs(query), [query], !!query);

  return (
    <Screen>
      <T v="h1">의약품 검색</T>
      <SearchBar initialValue={query} onSearch={search} onClear={() => router.setParams({ q: '' })} autoFocus={!query} />

      {!query && (
        <View style={{ gap: 12 }}>
          <Row wrap gap={8}>
            <T v="label" style={{ fontFamily: fonts.regular }}>
              추천 검색어
            </T>
            {SUGGESTIONS.map((s) => (
              <Chip key={s} label={s} onPress={() => search(s)} />
            ))}
          </Row>
          {history.length > 0 && (
            <>
              <T v="h3" style={{ marginTop: 8 }}>
                최근 조회한 의약품
              </T>
              {history.slice(0, 3).map((h) => (
                <DrugCard key={h.drug.id} drug={h.drug} />
              ))}
            </>
          )}
        </View>
      )}

      {query !== '' && (
        <View style={{ gap: 10 }}>
          {loading && <Spinner label="공식 의약품 정보를 검색하고 있어요…" />}
          {error && <ErrorBox error={error} onRetry={retry} />}
          {data && (
            <>
              <T v="h3">검색 결과 {data.length}건</T>
              {data.length === 0 ? (
                <Empty title={`‘${query}’에 대한 검색 결과가 없어요.`} desc="약 이름을 정확히 입력했는지, 띄어쓰기를 빼고 다시 검색해 보세요." />
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
