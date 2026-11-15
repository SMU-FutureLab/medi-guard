import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Link, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AppStoreProvider } from './context/AppStore';
import { DrugChatPage } from './pages/DrugChatPage';
import { DrugDetailPage } from './pages/DrugDetailPage';
import { HistoryPage } from './pages/HistoryPage';
import { HomePage } from './pages/HomePage';
import { AboutPage, FaqPage } from './pages/InfoPages';
import { InteractionPage } from './pages/InteractionPage';
import { FavoritesPage, MyPage } from './pages/MyPage';
import { SearchPage } from './pages/SearchPage';
import './styles.css';

function NotFound() {
  return (
    <div className="page empty">
      <p>페이지를 찾을 수 없어요.</p>
      <Link to="/">홈으로</Link>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppStoreProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="drugs/:id" element={<DrugDetailPage />} />
            <Route path="drugs/:id/ai" element={<DrugChatPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="my" element={<MyPage />} />
            <Route path="my/favorites" element={<FavoritesPage />} />
            <Route path="interactions" element={<InteractionPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
    </AppStoreProvider>
  </StrictMode>,
);
