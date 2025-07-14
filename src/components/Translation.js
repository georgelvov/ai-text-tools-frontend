import React, { useState, useCallback, useRef, useEffect } from 'react';
import './Translation.css';

const Translation = () => {
  const [text, setText] = useState('');
  const [model, setModel] = useState('gemma-3-27b-it');
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('Russian');

  // Refs для доступа к актуальным значениям в debounced функции
  const textRef = useRef(text);
  const modelRef = useRef(model);
  const selectedLanguageRef = useRef(selectedLanguage);
  const debounceTimeoutRef = useRef(null);
  const isPastingRef = useRef(false);

  // Обновляем refs при изменении значений
  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    modelRef.current = model;
  }, [model]);

  useEffect(() => {
    selectedLanguageRef.current = selectedLanguage;
  }, [selectedLanguage]);

  const languages = [
    { name: 'Russian', code: 'Russian' },
    { name: 'German', code: 'German' },
    { name: 'English', code: 'English' },
    { name: 'Greek', code: 'Greek' }
  ];

  // Process text function for translation
  const processTranslateText = async () => {
    const trimmedText = textRef.current.trim();
    if (!trimmedText || trimmedText.length < 3) {
      setTranslatedText('');
      setDetectedLanguage('');
      return;
    }

    setLoading(true);
    setError('');
    setTranslatedText('');
    setDetectedLanguage('');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: trimmedText,
          model: modelRef.current,
          targetLanguage: selectedLanguageRef.current
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setDetectedLanguage(`Detected language: ${data.detectedLanguage}`);
      setTranslatedText(data.translatedText);
    } catch (error) {
      setError('An error occurred while processing your request. Please try again later.');
      console.error('Error:', error);
      setTranslatedText('');
    } finally {
      setLoading(false);
    }
  };

  // Create debounced version of the process function
  const debouncedTranslateProcess = useCallback(() => {
    // Очищаем предыдущий timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      debounceTimeoutRef.current = null;
      processTranslateText();
    }, 1500);
  }, []); // Убираем зависимости, так как используем refs

  // Handle text input
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    
    // Если это вставка, не запускаем debounce
    if (isPastingRef.current) {
      return;
    }
    
    if (newText.trim().length === 0) {
      setTranslatedText('');
      setDetectedLanguage('');
      // Очищаем debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      return;
    }
    
    if (newText.length >= 3) {
      debouncedTranslateProcess();
    }
  };

  // Handle model change
  const handleModelChange = (e) => {
    const newModel = e.target.value;
    setModel(newModel);
    // Сразу обновляем ref для модели
    modelRef.current = newModel;
    
    if (textRef.current.trim().length >= 3) {
      // Очищаем debounce timeout и сразу обрабатываем
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      processTranslateText();
    }
  };

  // Handle language selection
  const handleLanguageClick = (language) => {
    setSelectedLanguage(language);
    // Сразу обновляем ref для языка
    selectedLanguageRef.current = language;
    
    if (textRef.current.trim().length >= 3) {
      // Очищаем debounce timeout и сразу обрабатываем
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      processTranslateText();
    }
  };

  // Handle paste event
  const handlePaste = () => {
    // Устанавливаем флаг вставки
    isPastingRef.current = true;
    
    // Очищаем debounce timeout, так как вставка должна обрабатываться сразу
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    
    // Небольшая задержка, чтобы текст успел вставиться и onChange сработал
    setTimeout(() => {
      if (textRef.current.trim()) {
        processTranslateText();
      }
      // Сбрасываем флаг вставки
      isPastingRef.current = false;
    }, 100);
  };

  // Cleanup при размонтировании компонента
  useEffect(() => {
    return () => {
      // Очищаем debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="tool-form">
      <form>
        <div className="translation-grid">
          {/* Ячейка 1: Выбор модели */}
          <div className="grid-cell model-cell">
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
          </div>

          {/* Ячейка 2: Кнопки выбора языка */}
          <div className="grid-cell language-cell">
            <div className="language-selector">
              <div className="language-buttons">
                {languages.map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    className={`lang-btn ${selectedLanguage === lang.name ? 'active' : ''}`}
                    onClick={() => handleLanguageClick(lang.name)}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Ячейка 3: Поле ввода текста */}
          <div className="grid-cell input-cell">
            <textarea 
              className="form-control" 
              value={text}
              onChange={handleTextChange}
              onPaste={handlePaste}
              maxLength="1500" 
              required 
              placeholder="Enter or paste your text here..."
            />
            <div className="char-counter">
              <span>{text.length}</span>/1500
            </div>
          </div>

          {/* Ячейка 4: Поле перевода */}
          <div className="grid-cell output-cell">
            <div className="result-box">
              {loading ? (
                <div className="loading-dots">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </div>
              ) : (
                <textarea 
                  className="form-control result-textarea" 
                  value={translatedText}
                  readOnly
                  placeholder="Translated text will appear here..."
                  style={{ 
                    background: 'transparent', 
                    color: '#6c757d',
                    border: 'none',
                    padding: '0',
                    resize: 'none',
                    minHeight: '300px',
                    height: '300px',
                    boxShadow: 'none',
                    outline: 'none',
                    opacity: text.trim() && !loading ? 1 : 0.6
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Определенный язык */}
        <div className="detected-language">
          {detectedLanguage}
        </div>
      </form>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default Translation; 