import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ModelSelector, 
  TextArea, 
  LoadingDots, 
  ErrorMessage,
  LanguageSelector 
} from './common';
import { useApiRequest, useTextProcessing, useModelState } from '../hooks';
import { AI_MODELS } from '../constants/models';
import { DEFAULT_LANGUAGE } from '../constants/languages';
import './Translation.css';

const Translation = () => {
  const [translatedText, setTranslatedText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(DEFAULT_LANGUAGE);
  
  const { makeRequest, loading, error } = useApiRequest();
  const { model, handleModelChange } = useModelState();
  const selectedLanguageRef = useRef(selectedLanguage);

  // Обновляем ref при изменении языка
  useEffect(() => {
    selectedLanguageRef.current = selectedLanguage;
  }, [selectedLanguage]);

  // Функция обработки перевода с useCallback для стабильности
  const processTranslateText = useCallback(async (inputText) => {
    const trimmedText = inputText.trim();
    if (!trimmedText || trimmedText.length < 3) {
      setTranslatedText('');
      setDetectedLanguage('');
      return;
    }

    const data = await makeRequest(`${process.env.REACT_APP_API_URL}/api/translate`, {
      method: 'POST',
      body: JSON.stringify({ 
        text: trimmedText,
        model: model,
        targetLanguage: selectedLanguageRef.current
      }),
    });

    if (data) {
      setDetectedLanguage(`Detected language: ${data.detectedLanguage}`);
      setTranslatedText(data.translatedText);
    }
  }, [model, selectedLanguage, makeRequest]);

  // Используем custom hook для обработки текста
  const { text, handleTextChange, handlePaste, cancelDebounce } = useTextProcessing(processTranslateText);

  // Обработчик изменения модели с немедленной обработкой
  const handleModelChangeWithProcessing = (e) => {
    handleModelChange(e);
    
    if (text.trim().length >= 3) {
      cancelDebounce();
      processTranslateText(text);
    }
  };

  // Обработчик выбора языка с немедленной обработкой
  const handleLanguageSelectWithProcessing = (language) => {
    setSelectedLanguage(language);
    selectedLanguageRef.current = language;
    
    if (text.trim().length >= 3) {
      cancelDebounce();
      processTranslateText(text);
    }
  };

  return (
    <div className="tool-form">
      <form>
        <div className="translation-grid">
          {/* Ячейка 1: Выбор модели */}
          <div className="grid-cell model-cell">
            <ModelSelector 
              value={model}
              onChange={handleModelChangeWithProcessing}
            />
          </div>

          {/* Ячейка 2: Кнопки выбора языка */}
          <div className="grid-cell language-cell">
            <LanguageSelector 
              selectedLanguage={selectedLanguage}
              onLanguageSelect={handleLanguageSelectWithProcessing}
            />
          </div>

          {/* Ячейка 3: Поле ввода текста */}
          <div className="grid-cell input-cell">
            <TextArea 
              value={text}
              onChange={handleTextChange}
              onPaste={handlePaste}
              placeholder="Enter or paste your text here..."
            />
          </div>

          {/* Ячейка 4: Поле перевода */}
          <div className="grid-cell output-cell">
            <div className="result-box">
              {loading ? (
                <LoadingDots />
              ) : (
                <TextArea 
                  value={translatedText}
                  readOnly
                  placeholder="Translated text will appear here..."
                  className="form-control result-textarea"
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

      <ErrorMessage error={error} />
    </div>
  );
};

export default Translation; 