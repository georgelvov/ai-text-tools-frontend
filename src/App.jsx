import React, { useState } from 'react';
import GrammarCorrection from './components/GrammarCorrection';
import Translation from './components/Translation';
import './App.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('grammar');

  const tabs = [
    { id: 'grammar', label: 'Grammar Correction' },
    { id: 'translate', label: 'Translation' }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'grammar':
        return <GrammarCorrection />;
      case 'translate':
        return <Translation />;
      default:
        return <GrammarCorrection />;
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1 className="text-center mb-4">AI Text Tools</h1>
        
        <ul className="nav nav-tabs" id="toolTabs" role="tablist">
          {tabs.map(tab => (
            <li key={tab.id} className="nav-item" role="presentation">
              <button 
                className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                type="button"
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="tab-content" id="toolTabsContent">
          <div className="tab-pane fade show active" role="tabpanel">
            {renderActiveTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App; 