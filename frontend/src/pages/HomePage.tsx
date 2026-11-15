import { Link, useNavigate } from 'react-router-dom';
import { Icon, PillArt, type IconName } from '../components/Icon';
import { SearchBar } from '../components/SearchBar';

const SUGGESTIONS = ['타이레놀', '게보린', '이트라코나졸', '심바스타틴'];

const FEATURES: { to: string; icon: IconName; title: string; desc: string }[] = [
  { to: '/search', icon: 'search', title: '의약품 검색', desc: '공식 정보 조회' },
  { to: '/about', icon: 'sparkle', title: 'AI 쉬운 설명', desc: '어려운 용어를 쉽게' },
  { to: '/interactions', icon: 'pill', title: '주의사항 확인', desc: '함께 먹는 약 확인' },
  { to: '/history', icon: 'clock', title: '조회 기록', desc: '최근 검색 내역' },
];

export function HomePage() {
  const navigate = useNavigate();
  const search = (q: string) => navigate(`/search?q=${encodeURIComponent(q)}`);

  return (
    <div className="home">
      {/* 히어로: 왼쪽 문구·검색, 오른쪽 초록 패널 */}
      <section className="hero-card">
        <div className="hero-copy">
          <span className="eyebrow-pill">
            <span className="dot" /> 식약처 공식 의약품 정보 기반
          </span>
          <h1>
            어려운 약 설명서,
            <br />
            쉬운 말로 읽어요
          </h1>
          <p className="hero-text">
            약 이름만 검색하면 공식 주의사항을 AI가 쉬운 말로 풀어 드려요. 설명마다 근거가 된 원문을 함께 보여 드려요.
          </p>
          <SearchBar variant="hero" onSearch={search} />
          <div className="chips">
            <span className="muted small">추천</span>
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" className="chip" onClick={() => search(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="hero-visual" aria-hidden>
          <span className="blob" />
          <PillArt size={210} />
          <span className="float-chip c1">
            <span className="chip-ico">
              <Icon name="shield" size={14} />
            </span>
            식약처 공식 데이터
          </span>
          <span className="float-chip c2">
            <span className="chip-ico">
              <Icon name="file" size={14} />
            </span>
            근거 원문 함께 제공
          </span>
        </div>
      </section>

      {/* 기능 타일 */}
      <section className="tile-section">
        <h2 className="display-2">
          MEDI GUARD로
          <br />할 수 있는 것
        </h2>
        <nav className="tiles" aria-label="주요 기능">
          {FEATURES.map((f, i) => (
            <Link key={f.title} to={f.to} className={`tile${i === 0 ? ' tile-accent' : ''}`}>
              <Icon name={f.icon} size={30} className="tile-icon" />
              <span className="tile-text">
                <strong>{f.title}</strong>
                <span>{f.desc}</span>
              </span>
              <span className="tile-arrow">
                <Icon name="chevronRight" size={18} />
              </span>
            </Link>
          ))}
        </nav>
      </section>

      {/* 상호작용 확인 배너 */}
      <section className="band">
        <div className="band-copy">
          <h2 className="display-2">
            함께 먹는 약,
            <br />
            같이 확인해요
          </h2>
          <p>여러 약을 담으면 식약처 DUR에 등록된 병용금기·성분중복 정보를 찾아 쉬운 말로 알려 드려요.</p>
          <Link to="/interactions" className="btn btn-lime">
            <Icon name="pill" /> 상호작용 확인하기
          </Link>
        </div>
        <div className="band-visual" aria-hidden>
          <span className="band-blob" />
          <div className="mock-result">
            <span className="mock-row">
              <span className="mock-tag">병용금기</span>
              <span className="mock-example">예시</span>
            </span>
            <strong>스포라녹스캡슐 + 조코정</strong>
            <span className="muted small">이트라코나졸 ↔ 심바스타틴</span>
            <p>같이 먹으면 콜레스테롤 약이 몸에 많이 쌓여 근육이 손상될 위험이 커져요.</p>
          </div>
        </div>
      </section>

      {/* 근거가 보이는 AI 설명 */}
      <section className="split">
        <div className="split-visual" aria-hidden>
          <div className="doc-card">
            <span className="doc-bolt">
              <Icon name="sparkle" size={22} />
            </span>
            <i />
            <i />
            <i className="hl" />
            <i />
            <i className="short" />
          </div>
        </div>
        <div className="split-copy">
          <h2 className="display-2">
            근거가 보이는
            <br />
            AI 설명
          </h2>
          <p>AI는 공식 원문 안에서만 답해요. 설명 아래 근거 구절을 누르면 원문의 해당 부분을 바로 확인할 수 있어요.</p>
          <Link to="/about" className="btn btn-primary">
            <Icon name="info" /> 작동 방식 보기
          </Link>
        </div>
      </section>
    </div>
  );
}
