import React from 'react';
import { LANGUAGES } from '../../constants/languages';

const LanguageSelector = ({ selectedLanguage, onLanguageSelect, className = '' }) => {
  return (
    <div className={`language-selector ${className}`}>
      <div className="language-buttons">
        {LANGUAGES.map(lang => (
          <button
            key={lang.code}
            type="button"
            className={`lang-btn ${selectedLanguage === lang.name ? 'active' : ''}`}
            onClick={() => onLanguageSelect(lang.name)}
          >
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector; 