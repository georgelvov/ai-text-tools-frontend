import React, { useState } from 'react';
import TextEditor from './TextEditor';
import Translation from './Translation';

const ToolsSection = () => {
  const [activeTab, setActiveTab] = useState('grammar');
  
  // Состояния для GrammarCorrection
  const [grammarText, setGrammarText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  
  // Состояния для Translation
  const [translationText, setTranslationText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('');

  const tabs = [
    { id: 'grammar', label: 'Grammar Correction' },
    { id: 'translate', label: 'Translation' }
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'grammar':
        return (
          <TextEditor 
            text={grammarText}
            setText={setGrammarText}
            correctedText={correctedText}
            setCorrectedText={setCorrectedText}
          />
        );
      case 'translate':
        return (
          <Translation 
            text={translationText}
            setText={setTranslationText}
            translatedText={translatedText}
            setTranslatedText={setTranslatedText}
            detectedLanguage={detectedLanguage}
            setDetectedLanguage={setDetectedLanguage}
          />
        );
      default:
        return (
          <TextEditor 
            text={grammarText}
            setText={setGrammarText}
            correctedText={correctedText}
            setCorrectedText={setCorrectedText}
          />
        );
    }
  };

  return (
    <>
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
    </>
  );
};

export default ToolsSection; 