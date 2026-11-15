import { Link, useNavigate } from 'react-router-dom';
import { Icon, PillArt, type IconName } from '../components/Icon';
import { SearchBar } from '../components/SearchBar';

const SUGGESTIONS = ['타이레놀', '게보린', '이트라코나졸', '심바스타틴'];

const FEATURES: { to: string; icon: IconName; title: string; desc: string }[] = [
  { to: '/search', icon: 'search', title: '의약품 검색', desc: '공식 정보 조회' },
  { to: '/about', icon: 'file', title: 'AI 쉬운 설명', desc: '어려운 용어 쉽게' },
  { to: '/interactions', icon: 'pill', title: '주의사항 확인', desc: '함께 먹는 약 확인' },
  { to: '/history', icon: 'clock', title: '조회 기록', desc: '최근 검색 내역' },
];

export function HomePage() {
  const navigate = useNavigate();
  const search = (q: string) => navigate(`/search?q=${encodeURIComponent(q)}`);

  return (
    <div className="page home">
      <section className="hero">
        <PillArt size={104} />
        <h1>MEDI GUARD</h1>
        <p className="hero-sub">의약품 정보를 더 쉽고, 더 안전하게</p>
        <SearchBar variant="hero" onSearch={search} />
        <div className="chips center">
          <span className="muted small">추천 검색어</span>
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" className="chip" onClick={() => search(s)}>
              {s}
            </button>
          ))}
        </div>
      </section>

      <nav className="features" aria-label="주요 기능">
        {FEATURES.map((f) => (
          <Link key={f.title} to={f.to} className="feature">
            <span className="feature-icon">
              <Icon name={f.icon} size={28} />
            </span>
            <strong>{f.title}</strong>
            <span className="muted small">{f.desc}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
