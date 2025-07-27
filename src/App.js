import React, { useState } from 'react';
import Header from './components/Header';
import ToolsSection from './components/ToolsSection';
import { useModelState } from './hooks';

function App() {
  const { model, handleModelChange } = useModelState();

  return (
    <main style={{ paddingTop: '3rem' }}>
      <Header />
      <ToolsSection model={model} onModelChange={handleModelChange} />
    </main>
  );
}

export default App; 