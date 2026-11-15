import type { ReactNode } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { USE_MOCK } from '../api/client';
import { Disclaimer } from './Disclaimer';
import { Icon, LogoMark, type IconName } from './Icon';

const NAV: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/', label: '홈', icon: 'home', end: true },
  { to: '/search', label: '검색', icon: 'search' },
  { to: '/history', label: '기록', icon: 'record' },
  { to: '/my', label: '마이', icon: 'user' },
];

export function Layout() {
  return (
    <>
      {USE_MOCK && (
        <div className="mock-banner" role="note">
          프로토타입 예시 데이터로 동작 중이에요. 실제 의약품 정보와 다를 수 있어요.
        </div>
      )}
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo" aria-label="MEDI GUARD 홈">
            <LogoMark />
            MEDI GUARD
          </Link>
          <nav className="nav" aria-label="주요 메뉴">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end}>
                <Icon name={n.icon} size={22} />
                <span>{n.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="container main">
        <Outlet />
      </main>
      <footer className="footer">
        <div className="container">
          <Disclaimer compact />
          <p className="footer-meta">MEDI GUARD · 팀 머니머니 · 공식 의약품 정보 기반 AI 복약 정보 설명 서비스</p>
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
        <button type="button" className="icon-btn" aria-label="뒤로" onClick={() => navigate(-1)}>
          <Icon name="back" size={22} />
        </button>
      )}
      <h1>{title}</h1>
      {right && <div className="page-top-right">{right}</div>}
    </div>
  );
}
