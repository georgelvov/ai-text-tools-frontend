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
import { DEFAULT_TARGET_LANGUAGE } from '../constants/languages';

const Translation = ({ 
  text, 
  setText, 
  translatedText, 
  setTranslatedText, 
  detectedLanguage, 
  setDetectedLanguage 
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState(DEFAULT_TARGET_LANGUAGE);
  
  // Состояние для истории ответов
  const [history, setHistory] = useState(['']); // Инициализируем с пустой строкой
  const [currentIndex, setCurrentIndex] = useState(0); // Начинаем с индекса 0
  
  const { makeRequest, loading, error } = useApiRequest();
  const { model, handleModelChange } = useModelState();
  const selectedLanguageRef = useRef(selectedLanguage);

  // Обновляем ref при изменении языка
  useEffect(() => {
    selectedLanguageRef.current = selectedLanguage;
  }, [selectedLanguage]);

  // Функция добавления ответа в историю
  const addToHistory = useCallback((response) => {
    setHistory(prevHistory => {
      // Не добавляем дубликаты подряд
      if (prevHistory.length > 0 && prevHistory[prevHistory.length - 1] === response) {
        return prevHistory;
      }
      
      const newHistory = [...prevHistory, response];
      // Ограничиваем историю 10 элементами
      if (newHistory.length > 10) {
        return newHistory.slice(-10);
      }
      return newHistory;
    });
    // Автоматически переходим на последний элемент истории
    setCurrentIndex(prevIndex => {
      const newHistoryLength = history.length + 1;
      return Math.min(newHistoryLength - 1, 9); // Максимум 10 элементов
    });
  }, [history.length]);

  // Функция навигации назад
  const goBack = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      setTranslatedText(history[newIndex]);
    }
  }, [currentIndex, history, setTranslatedText]);

  // Функция навигации вперед
  const goForward = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setTranslatedText(history[newIndex]);
    }
  }, [currentIndex, history, setTranslatedText]);

  // Функция обработки перевода с useCallback для стабильности
  const processTranslateText = useCallback(async (inputText) => {
    const trimmedText = inputText.trim();
    if (!trimmedText || trimmedText.length < 3) {
      setTranslatedText('');
      setDetectedLanguage('');
      return;
    }

    const data = await makeRequest(`${process.env.REACT_APP_API_URL}/api/text/translate`, {
      method: 'POST',
      body: JSON.stringify({ 
        text: trimmedText,
        model: model,
        targetLanguage: selectedLanguageRef.current
      }),
    });

    if (data) {
      setDetectedLanguage(`Language: ${data.detectedLanguage}`);
      setTranslatedText(data.translatedText);
      addToHistory(data.translatedText); // Добавляем ответ в историю
    }
  }, [model, selectedLanguage, makeRequest, setTranslatedText, setDetectedLanguage, addToHistory]);

  // Используем custom hook для обработки текста
  const { handleTextChange, handlePaste, cancelDebounce } = useTextProcessing(processTranslateText, text, setText);

  // Эффект для очистки результата когда текст пустой
  useEffect(() => {
    if (!text || text.trim().length === 0) {
      setTranslatedText('');
      setDetectedLanguage('');
    }
  }, [text, setTranslatedText, setDetectedLanguage]);

  // Обработчик изменения модели с немедленной обработкой
  const handleModelChangeWithProcessing = (e) => {
    handleModelChange(e);
    
    if (text.trim().length >= 3) {
      cancelDebounce();
      processTranslateText(text);
    }
  };

  // Обработчик выбора языка с немедленной обработкой
  const handleLanguageSelectWithProcessing = (lang) => {
    setSelectedLanguage(lang);
    selectedLanguageRef.current = lang; // Обновляем ref немедленно
    
    if (text.trim().length >= 3) {
      cancelDebounce();
      // Создаем новую функцию с актуальным языком
      const processWithNewLanguage = async (inputText) => {
        const trimmedText = inputText.trim();
        if (!trimmedText || trimmedText.length < 3) {
          setTranslatedText('');
          setDetectedLanguage('');
          return;
        }

        const data = await makeRequest(`${process.env.REACT_APP_API_URL}/api/text/translate`, {
          method: 'POST',
          body: JSON.stringify({ 
            text: trimmedText,
            model: model,
            targetLanguage: lang
          }),
        });

        if (data) {
          setDetectedLanguage(`Language: ${data.detectedLanguage}`);
          setTranslatedText(data.translatedText);
          addToHistory(data.translatedText); // Добавляем ответ в историю
        }
      };
      
      processWithNewLanguage(text);
    }
  };

  // Обработчик очистки текста
  const handleClearText = () => {
    setText('');
    // Добавляем пустую строку в историю при очистке
    addToHistory('');
    // Сразу переходим на последний элемент (пустую строку)
    setCurrentIndex(history.length);
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
            {/* Определенный язык */}
            {detectedLanguage && (
              <div className="detected-language">
                {detectedLanguage}
              </div>
            )}
          </div>

          {/* Ячейка 2: Выбор языка */}
          <div className="grid-cell empty-cell">
            <LanguageSelector 
              selectedLanguage={selectedLanguage}
              onLanguageSelect={handleLanguageSelectWithProcessing}
            >
              {/* Кнопки навигации по истории */}
              <div className="history-buttons">
                <button
                  type="button"
                  className={`history-btn history-back ${currentIndex <= 0 ? 'disabled' : ''}`}
                  onClick={goBack}
                  disabled={currentIndex <= 0}
                  title="Previous translation"
                >
                  ←
                </button>
                <button
                  type="button"
                  className={`history-btn history-forward ${currentIndex >= history.length - 1 ? 'disabled' : ''}`}
                  onClick={goForward}
                  disabled={currentIndex >= history.length - 1}
                  title="Next translation"
                >
                  →
                </button>
              </div>
            </LanguageSelector>
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
                onChange={(e) => setTranslatedText(e.target.value)}
                readOnly={!translatedText.trim() || loading}
                placeholder={loading ? '' : "Translated text will appear here..."}
                className={`form-control result-textarea result-textarea-grammar ${translatedText.trim() && !loading ? 'filled' : 'empty'}`}
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

      </form>

      <ErrorMessage error={error} />
    </div>
  );
};

export default Translation; 