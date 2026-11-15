import { Link } from 'react-router-dom';
import { DrugRow, ingredientLine } from '../components/DrugCard';
import { Icon, type IconName } from '../components/Icon';
import { PageTop } from '../components/Layout';
import { useAppStore } from '../context/AppStore';

function MenuRow({ to, icon, label, count }: { to: string; icon: IconName; label: string; count?: number }) {
  return (
    <Link to={to} className="menu-row">
      <Icon name={icon} size={22} />
      <span>{label}</span>
      {count !== undefined && count > 0 && <span className="count">{count}</span>}
      <Icon name="chevronRight" className="chevron" />
    </Link>
  );
}

export function MyPage() {
  const { favorites, history, medList } = useAppStore();
  return (
    <div className="page">
      <header className="title-block">
        <h1>
          <Icon name="user" size={26} /> 마이페이지
        </h1>
      </header>

      <section className="profile">
        <span className="avatar">
          <Icon name="user" size={34} />
        </span>
        <div>
          <strong>사용자</strong>
          <p className="muted small">로그인 없이 이 기기에 저장돼요</p>
        </div>
      </section>

      <nav className="menu-group" aria-label="내 정보">
        <MenuRow to="/my/favorites" icon="bookmark" label="관심 의약품 (찜한 목록)" count={favorites.items.length} />
        <MenuRow to="/history" icon="clock" label="조회 기록" count={history.length} />
        <MenuRow to="/interactions" icon="pill" label="함께 먹는 약 확인" count={medList.items.length} />
      </nav>
      <nav className="menu-group" aria-label="도움말">
        <MenuRow to="/about" icon="info" label="서비스 안내" />
        <MenuRow to="/faq" icon="help" label="자주 묻는 질문 (FAQ)" />
      </nav>
    </div>
  );
}

export function FavoritesPage() {
  const { favorites } = useAppStore();
  return (
    <div className="page">
      <PageTop title="관심 의약품" />
      {favorites.items.length === 0 ? (
        <div className="empty">
          <p>찜한 의약품이 없어요.</p>
          <p className="muted small">의약품 상세 화면에서 별 버튼을 누르면 여기에 모여요.</p>
        </div>
      ) : (
        <ul className="card-list">
          {favorites.items.map((d) => (
            <li key={d.id}>
              <DrugRow drug={d} sub={ingredientLine(d)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
