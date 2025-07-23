import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  ModelSelector, 
  TextArea, 
  LoadingDots, 
  ErrorMessage,
  LanguageSelector,
  CopyButton,
  ClearButton
} from './common';
import { useApiRequest, useTextProcessing, useModelState } from '../hooks';
import { DEFAULT_LANGUAGE } from '../constants/languages';

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
  const { text, handleTextChange, handlePaste, cancelDebounce, setText } = useTextProcessing(processTranslateText);

  // Эффект для очистки результата когда текст пустой
  useEffect(() => {
    if (!text || text.trim().length === 0) {
      setTranslatedText('');
      setDetectedLanguage('');
    }
  }, [text]);

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

  // Обработчик очистки текста
  const handleClearText = () => {
    setText('');
  };

  return (
    <div className="tool-form">
      <form>
        <div className="grammar-grid">
          {/* Ячейка 1: Выбор модели */}
          <div className="grid-cell model-cell">
            <ModelSelector 
              value={model}
              onChange={handleModelChangeWithProcessing}
            />
          </div>

          {/* Ячейка 2: Пустая для симметрии */}
          <div className="grid-cell empty-cell">
            <LanguageSelector 
              selectedLanguage={selectedLanguage}
              onLanguageSelect={handleLanguageSelectWithProcessing}
            />
          </div>

          {/* Ячейка 3: Поле ввода текста */}
          <div className="grid-cell input-cell">
            <div className="input-container">
              <TextArea 
                value={text}
                onChange={handleTextChange}
                onPaste={handlePaste}
                placeholder="Enter or paste your text here..."
              />
              <CopyButton 
                text={text}
                className="copy-btn-input"
                title="Copy input text"
              />
              <ClearButton 
                text={text}
                onClear={handleClearText}
                className="clear-btn-input"
                title="Clear input text"
              />
            </div>
          </div>

          {/* Ячейка 4: Поле с переведенным текстом */}
          <div className="grid-cell output-cell">
            <div className="result-container">
              <TextArea 
                value={loading ? '' : translatedText}
                readOnly
                placeholder={loading ? '' : "Translated text will appear here..."}
                className={`form-control result-textarea result-textarea-grammar ${text.trim() && !loading ? 'filled' : 'empty'}`}
              />
              {loading && (
                <div className="loading-dots-overlay">
                  <LoadingDots />
                </div>
              )}
              <CopyButton 
                text={translatedText}
                className="copy-btn-output"
                title="Copy translated text"
              />
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