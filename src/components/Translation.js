import React, { useState, useCallback } from 'react';
import './Translation.css';

const Translation = () => {
  const [text, setText] = useState('');
  const [model, setModel] = useState('gemma-3-27b-it');
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processingIndicator, setProcessingIndicator] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('Russian');
  const [showDropdown, setShowDropdown] = useState(false);

  const languages = [
    { name: 'Russian', code: 'Russian' },
    { name: 'German', code: 'German' },
    { name: 'English', code: 'English' },
    { name: 'Greek', code: 'Greek' }
  ];

  // Debounce function
  const debounce = useCallback((func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }, []);

  // Process text function for translation
  const processTranslateText = async () => {
    const trimmedText = text.trim();
    if (!trimmedText || trimmedText.length < 3) {
      setTranslatedText('');
      setDetectedLanguage('');
      setProcessingIndicator(false);
      return;
    }

    setLoading(true);
    setError('');
    setTranslatedText('');
    setDetectedLanguage('');

    // Show processing indicator
    setProcessingIndicator(true);

    try {
      const response = await fetch('http://localhost:8080/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: trimmedText,
          model,
          targetLanguage: selectedLanguage
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setDetectedLanguage(`Detected language: ${data.detectedLanguage}`);
      setTranslatedText(data.translatedText);
      setProcessingIndicator(false);
    } catch (error) {
      setError('An error occurred while processing your request. Please try again later.');
      console.error('Error:', error);
      setTranslatedText('');
      setProcessingIndicator(false);
    } finally {
      setLoading(false);
    }
  };

  // Create debounced version of the process function
  const debouncedTranslateProcess = useCallback(
    debounce(() => {
      setProcessingIndicator(false);
      processTranslateText();
    }, 1500),
    [text, model, selectedLanguage]
  );

  // Handle text input
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    
    if (newText.trim().length === 0) {
      setTranslatedText('');
      setDetectedLanguage('');
      setProcessingIndicator(false);
      return;
    }
    
    if (newText.length >= 3) {
      setProcessingIndicator(true);
      debouncedTranslateProcess();
    }
  };

  // Handle model change
  const handleModelChange = (e) => {
    setModel(e.target.value);
    if (text.trim().length >= 3) {
      processTranslateText();
    }
  };

  // Handle language selection
  const handleLanguageClick = (language) => {
    setSelectedLanguage(language);
    setShowDropdown(false);
    if (text.trim().length >= 3) {
      processTranslateText();
    }
  };

  // Handle paste event
  const handlePaste = () => {
    setTimeout(() => {
      if (text.trim()) {
        processTranslateText();
      }
    }, 100);
  };

  return (
    <div className="tool-form">
      <form>
        <div className="text-boxes">
          <div className="text-box-section">
            <div className="controls">
              <div className="controls-row">
                <div className="model-container">
                  <select 
                    className="form-select model-select" 
                    value={model}
                    onChange={handleModelChange}
                    required
                  >
                    <option value="gemma-3-27b-it">gemma-3-27b-it</option>
                    <option value="gemini-2.5-flash">gemini-2.5-flash</option>
                  </select>
                </div>
                <div className="detected-language">
                  {detectedLanguage}
                </div>
              </div>
            </div>
            <div className="text-box">
              <textarea 
                className="form-control" 
                value={text}
                onChange={handleTextChange}
                onPaste={handlePaste}
                maxLength="5000" 
                required 
                placeholder="Enter or paste your text here..."
              />
              <div className="char-counter">
                <span>{text.length}</span>/5000
              </div>
            </div>
          </div>
          <div className="text-box-section">
            <div className="language-selector">
              <div className="language-buttons">
                {languages.slice(0, 3).map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    className={`lang-btn ${selectedLanguage === lang.name ? 'active' : ''}`}
                    onClick={() => handleLanguageClick(lang.name)}
                  >
                    {lang.name}
                  </button>
                ))}
                <div className="dropdown">
                  <button 
                    type="button" 
                    className="lang-btn dropdown-toggle"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    {/* <i className="arrow-down">▼</i> */}
                  </button>
                  <ul className={`dropdown-menu ${showDropdown ? 'show' : ''}`}>
                    {languages.slice(3).map(lang => (
                      <li key={lang.code}>
                        <button 
                          type="button" 
                          className="dropdown-item"
                          onClick={() => handleLanguageClick(lang.name)}
                        >
                          {lang.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="text-box">
              <div className="result-box">
                {processingIndicator && (
                  <div className="processing-indicator">Processing...</div>
                )}
                {translatedText}
              </div>
            </div>
          </div>
        </div>
      </form>

      {loading && (
        <div className="loading">
          <div className="spinner-border loading-spinner text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Translating...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default Translation; 