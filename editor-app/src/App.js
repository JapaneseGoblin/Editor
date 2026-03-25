import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NewsAndBlogs from './components/NewsAndBlogs/NewsAndBlogs';
import ArticleRenderer from './components/ArticleRenderer/ArticleRenderer';
import EditorPage from './components/EditorPage/EditorPage';

export default function App() {
  return (
    <Routes>
      <Route path="/"                   element={<NewsAndBlogs />} />
      <Route path="/article/:id"        element={<ArticleRenderer />} />
      <Route path="/article/:id/edit"   element={<EditorPage />} />
    </Routes>
  );
}