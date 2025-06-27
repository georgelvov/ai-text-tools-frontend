import React, { useState } from 'react';
import './App.css';
import GrammarCorrection from './components/GrammarCorrection';
import Translation from './components/Translation';

function App() {
  const [activeTab, setActiveTab] = useState('grammar');

  return (
    <div className="App">
      <div className="container">
        <h1 className="text-center mb-4">AI Text Tools</h1>
        
        <ul className="nav nav-tabs" id="toolTabs" role="tablist">
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'grammar' ? 'active' : ''}`}
              onClick={() => setActiveTab('grammar')}
              type="button"
            >
              Grammar Correction
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'translate' ? 'active' : ''}`}
              onClick={() => setActiveTab('translate')}
              type="button"
            >
              Translation
            </button>
          </li>
        </ul>

        <div className="tab-content" id="toolTabsContent">
          {activeTab === 'grammar' && (
            <div className="tab-pane fade show active" role="tabpanel">
              <GrammarCorrection />
            </div>
          )}
          {activeTab === 'translate' && (
            <div className="tab-pane fade show active" role="tabpanel">
              <Translation />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
