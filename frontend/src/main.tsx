import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Link, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { MedListProvider } from './context/MedListContext';
import { DrugDetailPage } from './pages/DrugDetailPage';
import { InteractionPage } from './pages/InteractionPage';
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
    <MedListProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<SearchPage />} />
            <Route path="drugs/:id" element={<DrugDetailPage />} />
            <Route path="interactions" element={<InteractionPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </HashRouter>
    </MedListProvider>
  </StrictMode>,
);
