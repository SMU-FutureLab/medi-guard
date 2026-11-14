import { Link, NavLink, Outlet } from 'react-router-dom';
import { USE_MOCK } from '../api/client';
import { useMedList } from '../context/MedListContext';
import { Disclaimer } from './Disclaimer';

export function Layout() {
  const { items } = useMedList();
  return (
    <>
      {USE_MOCK && (
        <div className="mock-banner" role="note">
          프로토타입 예시 데이터로 동작 중입니다. 실제 의약품 정보와 다를 수 있어요.
        </div>
      )}
      <header className="header">
        <div className="container header-inner">
          <Link to="/" className="logo" aria-label="MEDI GUARD 홈">
            <span className="logo-mark" aria-hidden>
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path
                  d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z"
                  fill="currentColor"
                  opacity=".2"
                />
                <path d="M12 7v10M7 12h10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
              </svg>
            </span>
            MEDI GUARD
          </Link>
          <nav className="nav">
            <NavLink to="/" end>
              약 검색
            </NavLink>
            <NavLink to="/interactions">
              함께 먹어도 될까?
              {items.length > 0 && <span className="nav-count">{items.length}</span>}
            </NavLink>
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
