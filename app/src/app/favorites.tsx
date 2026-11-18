import { DrugCard, ingredientLine } from '../components/drug';
import { Empty, PageTop, Screen } from '../components/ui';
import { useAppStore } from '../store/AppStore';

export default function FavoritesScreen() {
  const { favorites } = useAppStore();
  return (
    <Screen header={<PageTop title="관심 의약품" />}>
      {favorites.items.length === 0 ? (
        <Empty title="찜한 의약품이 없어요." desc="의약품 상세 화면에서 별 버튼을 누르면 여기에 모여요." />
      ) : (
        favorites.items.map((d) => <DrugCard key={d.id} drug={d} sub={ingredientLine(d)} />)
      )}
    </Screen>
  );
}
