import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { api } from '../api/client';
import { SearchBar } from '../components/drug';
import { Icon } from '../components/Icon';
import { Button, Card, Disclaimer, ErrorBox, PageTop, Row, Screen, SourceInfo, Spinner, T } from '../components/ui';
import { useAsync } from '../hooks/useAsync';
import { useAppStore } from '../store/AppStore';
import { fonts, radius, useTheme } from '../theme/theme';
import type { InteractionResult } from '../types';

export default function InteractionsScreen() {
  const { c } = useTheme();
  const router = useRouter();
  const { medList } = useAppStore();
  const [query, setQuery] = useState('');
  const search = useAsync(() => api.searchDrugs(query), [query], !!query);

  const [result, setResult] = useState<InteractionResult>();
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<Error>();
  // 결과를 본 뒤 목록이 바뀌면 이전 결과는 맞지 않으므로 숨긴다
  const [checkedIds, setCheckedIds] = useState('');
  const currentIds = medList.items.map((d) => d.id).join(',');
  const stale = result && checkedIds !== currentIds;

  const check = async () => {
    setChecking(true);
    setCheckError(undefined);
    try {
      setResult(await api.checkInteractions(medList.items.map((d) => d.id)));
      setCheckedIds(currentIds);
    } catch (e) {
      setCheckError(e as Error);
    } finally {
      setChecking(false);
    }
  };

  return (
    <Screen header={<PageTop title="함께 먹어도 될까?" />}>
      <T color={c.muted}>함께 먹는 약을 담으면, 식약처 DUR(의약품안전사용서비스)에 등록된 병용금기·성분중복 정보를 확인해 드려요.</T>

      <Card>
        <T v="h3">약 추가하기</T>
        <SearchBar onSearch={setQuery} onClear={() => setQuery('')} placeholder="추가할 약 이름 검색" />
        {query !== '' && (
          <View>
            {search.loading && <Spinner />}
            {search.error && <ErrorBox error={search.error} onRetry={search.retry} />}
            {search.data?.length === 0 && <T color={c.muted}>검색 결과가 없어요.</T>}
            {search.data?.map((d, i) => (
              <Row key={d.id} gap={12} style={{ paddingVertical: 10, borderBottomWidth: i < search.data!.length - 1 ? 1 : 0, borderBottomColor: c.line }}>
                <View style={{ flex: 1 }}>
                  <T v="bodyBold">{d.name}</T>
                  <T v="small" color={c.muted}>
                    {d.ingredients.join(', ')}
                  </T>
                </View>
                <Button small variant={medList.has(d.id) ? 'ghost' : 'dark'} disabled={medList.has(d.id)} label={medList.has(d.id) ? '담김' : '담기'} onPress={() => medList.add(d)} />
              </Row>
            ))}
          </View>
        )}
      </Card>

      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <T v="h3">담은 약 {medList.items.length}개</T>
          {medList.items.length > 0 && (
            <Pressable onPress={medList.clear}>
              <T v="small" color={c.muted} style={{ textDecorationLine: 'underline' }}>
                모두 비우기
              </T>
            </Pressable>
          )}
        </Row>
        {medList.items.length === 0 ? (
          <T color={c.muted}>아직 담은 약이 없어요. 위에서 검색해 추가하세요.</T>
        ) : (
          <Row wrap gap={8}>
            {medList.items.map((d) => (
              <Row key={d.id} gap={2} style={{ backgroundColor: c.primarySoft, borderRadius: radius.pill, paddingVertical: 4, paddingLeft: 14, paddingRight: 4 }}>
                <Pressable onPress={() => router.push({ pathname: '/drugs/[id]', params: { id: d.id } })}>
                  <T v="bodyBold" color={c.primaryStrong} style={{ fontSize: 15 }}>
                    {d.name}
                  </T>
                </Pressable>
                <Pressable accessibilityLabel={`${d.name} 빼기`} onPress={() => medList.remove(d.id)} style={{ width: 28, height: 28, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="close" size={16} color={c.primaryStrong} />
                </Pressable>
              </Row>
            ))}
          </Row>
        )}
        <Button block label={medList.items.length < 2 ? '약을 2개 이상 담아 주세요' : '상호작용 확인하기'} disabled={medList.items.length < 2 || checking} onPress={check} />
      </Card>

      {checking && <Spinner label="공식 DUR 정보를 확인하고 있어요…" />}
      {checkError && <ErrorBox error={checkError} onRetry={check} />}
      {result && !stale && !checking && (
        <View style={{ gap: 12 }}>
          {result.pairs.length === 0 ? (
            <View style={{ backgroundColor: c.primarySoft, borderRadius: radius.xl, padding: 22, gap: 8 }}>
              <T v="h3" color={c.primaryStrong}>
                공식 정보에서 확인된 병용금기·성분중복이 없어요
              </T>
              <T color={c.text2}>
                다만 이것이 <T v="bodyBold">함께 먹어도 안전하다는 뜻은 아니에요.</T> DUR에 등록되지 않은 상호작용이 있을 수 있으니, 여러 약을 함께
                먹는다면 약사에게 확인하세요.
              </T>
            </View>
          ) : (
            <>
              <T v="h2">
                주의가 필요한 조합 <T v="h2" color={c.danger}>{String(result.pairs.length)}</T>건
              </T>
              {result.pairs.map((p) => (
                <Pair key={`${p.drugA.id}-${p.drugB.id}`} pair={p} />
              ))}
              <T v="small" color={c.muted}>
                임의로 약을 끊지 말고, 처방한 의사나 약사와 먼저 상담하세요.
              </T>
            </>
          )}
        </View>
      )}

      <Disclaimer />
    </Screen>
  );
}

function Pair({ pair: p }: { pair: InteractionResult['pairs'][number] }) {
  const { c } = useTheme();
  const [open, setOpen] = useState(false);
  const danger = p.type === '병용금기';
  return (
    <Card style={{ gap: 6, borderRadius: radius.lg }}>
      <View style={{ alignSelf: 'flex-start', backgroundColor: danger ? c.dangerSoft : c.warnSoft, borderRadius: radius.pill, paddingVertical: 3, paddingHorizontal: 12 }}>
        <T v="label" color={danger ? c.danger : c.warn}>
          {p.type}
        </T>
      </View>
      <T v="h3">
        {p.drugA.name} + {p.drugB.name}
      </T>
      <T v="small" color={c.muted}>
        {p.ingredientA === p.ingredientB ? `공통 성분: ${p.ingredientA}` : `${p.ingredientA} ↔ ${p.ingredientB}`}
      </T>
      <View style={{ backgroundColor: c.primarySoft, borderRadius: radius.md, padding: 14, gap: 6, marginTop: 4 }}>
        <T v="label" color={c.primaryStrong}>
          AI 쉬운 설명
        </T>
        <T>{p.easyExplanation}</T>
      </View>
      <Pressable onPress={() => setOpen((v) => !v)} style={{ paddingVertical: 6 }}>
        <T v="small" color={c.muted} style={{ fontFamily: fonts.medium }}>
          {open ? '공식 원문 사유 접기' : '공식 원문 사유 보기'}
        </T>
      </Pressable>
      {open && (
        <View style={{ gap: 8 }}>
          <View style={{ borderLeftWidth: 3, borderLeftColor: c.lime, backgroundColor: c.quoteBg, padding: 10 }}>
            <T v="small" color={c.text2}>
              {p.reason}
            </T>
          </View>
          <SourceInfo source={p.source} />
        </View>
      )}
    </Card>
  );
}
