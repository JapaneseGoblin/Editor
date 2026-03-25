import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RichTextEditor from '../RichTextEditor/RichTextEditor';

export default function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '1600px', margin: '24px auto', padding: '0 32px' }}>
      <button
        onClick={() => navigate(`/article/${id}`)}
        style={{ marginBottom: 16, cursor: 'pointer' }}
      >
        ← Vissza a cikkhez
      </button>
      <RichTextEditor articleId={id} />
    </div>
  );
}