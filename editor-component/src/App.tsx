import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ArticleRenderer       from './components/ArticleRenderer/ArticleRenderer';
import EditorPage            from './components/EditorPage/EditorPage';
import ArticleFormPage       from './components/ArticleForm/ArticleFormPage';
import { TileLayoutEditor }  from './components/TileLayoutEditor';
import { seedArticles }      from './data/seed';

// Mock tartalmak betöltése localStorage-ba (csak ha még nincsenek ott)
seedArticles();

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                  element={<TileLayoutEditor />} />
        <Route path="/article/new"       element={<ArticleFormPage />} />
        <Route path="/article/:id/form"  element={<ArticleFormPage />} />
        <Route path="/article/:id"       element={<ArticleRenderer />} />
        <Route path="/article/:id/edit"  element={<EditorPage />} />
        <Route path="*"                  element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}