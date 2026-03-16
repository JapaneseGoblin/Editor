import React from 'react';
import RichTextEditor from './components/RichTextEditor/RichTextEditor';

function App() {
  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 16px' }}>
      <h1>Rich Text Editor</h1>
      <RichTextEditor />
    </div>
  );
}

export default App;