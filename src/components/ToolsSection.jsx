import React, { useState } from 'react';
import TextEditor from './TextEditor';
import Translation from './Translation';
import { ModelSelector } from './common';

const ToolsSection = ({ model, onModelChange }) => {
  const [activeTab, setActiveTab] = useState('grammar');
  
  // Состояния для GrammarCorrection
  const [grammarText, setGrammarText] = useState('');
  const [correctedText, setCorrectedText] = useState('');
  
  // Состояния для Translation
  const [translationText, setTranslationText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('');

  const tabs = [
    { id: 'grammar', label: 'Text Editor' },
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
            model={model}
            onModelChange={onModelChange}
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
            model={model}
            onModelChange={onModelChange}
          />
        );
      default:
        return (
          <TextEditor 
            text={grammarText}
            setText={setGrammarText}
            correctedText={correctedText}
            setCorrectedText={setCorrectedText}
            model={model}
            onModelChange={onModelChange}
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