import type { ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { USE_MOCK } from '../api/client';
import { Icon, LogoMark, type IconName } from './Icon';

const NAV: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/', label: '홈', icon: 'home', end: true },
  { to: '/search', label: '검색', icon: 'search' },
  { to: '/history', label: '기록', icon: 'record' },
  { to: '/my', label: '마이', icon: 'user' },
];

export function Layout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';
  return (
    <>
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo" aria-label="MEDI GUARD 홈">
            <LogoMark />
            <span>
              MEDI<b>GUARD</b>
            </span>
          </Link>
          <nav className="nav" aria-label="주요 메뉴">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end}>
                <Icon name={n.icon} size={20} />
                <span>{n.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      {USE_MOCK && (
        <p className="container mock-note" role="note">
          <span className="dot" /> 프로토타입 예시 데이터로 동작 중이에요. 실제 의약품 정보와 다를 수 있어요.
        </p>
      )}
      <main className={`container main${isHome ? ' main-wide' : ''}`}>
        <Outlet />
      </main>
      <footer className="container footer-wrap">
        <div className="footer-block">
          <Link to="/" className="logo logo-inverse" aria-label="MEDI GUARD 홈">
            <LogoMark inverse />
            <span>
              MEDI<b>GUARD</b>
            </span>
          </Link>
          <p className="footer-title">
            어려운 약 정보를
            <br />
            쉽고 정확하게.
          </p>
          <div className="footer-cols">
            <div>
              <h3>메뉴</h3>
              <Link to="/">홈</Link>
              <Link to="/search">의약품 검색</Link>
              <Link to="/history">조회 기록</Link>
              <Link to="/my">마이페이지</Link>
            </div>
            <div>
              <h3>도움말</h3>
              <Link to="/interactions">함께 먹는 약 확인</Link>
              <Link to="/about">서비스 안내</Link>
              <Link to="/faq">자주 묻는 질문</Link>
            </div>
            <div>
              <h3>데이터 출처</h3>
              <span>식약처 의약품개요정보(e약은요)</span>
              <span>식약처 의약품안전사용서비스(DUR)</span>
            </div>
          </div>
          <p className="footer-note">
            MEDI GUARD는 공식 의약품 정보의 이해를 돕는 보조 서비스이며, 의사·약사의 진료나 복약지도를 대신하지 않습니다.
          </p>
          <p className="footer-meta">팀 머니머니 · 상명대학교</p>
        </div>
      </footer>
    </>
  );
}

/** 하위 화면 상단: 뒤로가기 + 제목 (+ 오른쪽 버튼) */
export function PageTop({ title, right, back = true }: { title: string; right?: ReactNode; back?: boolean }) {
  const navigate = useNavigate();
  return (
    <div className="page-top">
      {back && (
        <button type="button" className="icon-btn round" aria-label="뒤로" onClick={() => navigate(-1)}>
          <Icon name="back" size={20} />
        </button>
      )}
      <h1>{title}</h1>
      {right && <div className="page-top-right">{right}</div>}
    </div>
  );
}
