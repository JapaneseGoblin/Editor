import React, { useState } from 'react';
import RichTextEditor from './components/RichTextEditor/RichTextEditor';
import ArticleRenderer from './components/ArticleRenderer/ArticleRenderer';

export default function App() {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div style={{ maxWidth: '1600px', margin: '24px auto', padding: '0 32px' }}>
      {isEditing ? (
        <>
          <button
            onClick={() => setIsEditing(false)}
            style={{ marginBottom: 16, cursor: 'pointer' }}
          >
            ← Vissza a cikkhez
          </button>
          <RichTextEditor />
        </>
      ) : (
        <ArticleRenderer onEdit={() => setIsEditing(true)} />
      )}
    </div>
  );
}