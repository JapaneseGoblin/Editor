import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import NewsAndBlogs from './components/NewsAndBlogs/NewsAndBlogs';
import ArticleRenderer from './components/ArticleRenderer/ArticleRenderer';
import EditorPage from './components/EditorPage/EditorPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                 element={<NewsAndBlogs />} />
        <Route path="/article/:id"      element={<ArticleRenderer />} />
        <Route path="/article/:id/edit" element={<EditorPage />} />
        <Route path="*"                 element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
} 