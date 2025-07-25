import React, { useCallback, useEffect, useState } from 'react';
import { 
  ModelSelector, 
  TextArea, 
  LoadingDots, 
  ErrorMessage,
  CopyButton,
  ClearButton,
  StyleSelector
} from './common';
import { useApiRequest, useTextProcessing, useModelState } from '../hooks';

const GrammarCorrection = ({ text, setText, correctedText, setCorrectedText }) => {
  const { makeRequest, loading, error } = useApiRequest();
  const { model, handleModelChange } = useModelState();
  const [autofix, setAutofix] = useState(false); // По умолчанию выключен
  
  // Состояние для истории ответов
  const [history, setHistory] = useState(['']); // Инициализируем с пустой строкой
  const [currentIndex, setCurrentIndex] = useState(0); // Начинаем с индекса 0

  // Обработчик выбора стиля коррекции
  const handleStyleSelect = (style) => {
    // Если есть текст, перезапускаем обработку с новым стилем
    if (text.trim().length >= 3) {
      cancelDebounce();
      processGrammarTextWithStyle(text, style);
    }
  };

  // Обработчик изменения чекбокса Autofix
  const handleAutofixChange = (e) => {
    setAutofix(e.target.checked);
  };

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
      setCorrectedText(history[newIndex]);
    }
  }, [currentIndex, history, setCorrectedText]);

  // Функция навигации вперед
  const goForward = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setCorrectedText(history[newIndex]);
    }
  }, [currentIndex, history, setCorrectedText]);

  // Функция обработки грамматики с конкретным стилем
  const processGrammarTextWithStyle = useCallback(async (inputText, style) => {
    const trimmedText = inputText.trim();
    if (!trimmedText || trimmedText.length < 3) {
      setCorrectedText('');
      return;
    }

    const data = await makeRequest(`${process.env.REACT_APP_API_URL}/api/text/modify`, {
      method: 'POST',
      body: JSON.stringify({
        type: style,
        text: trimmedText,
        model: model
      }),
    });

    if (data) {
      setCorrectedText(data.correctedText);
      addToHistory(data.correctedText); // Добавляем ответ в историю
    }
  }, [model, makeRequest, setCorrectedText, addToHistory]);

  // Функция обработки грамматики с useCallback для стабильности
  const processGrammarText = useCallback(async (inputText) => {
    const trimmedText = inputText.trim();
    if (!trimmedText || trimmedText.length < 3) {
      setCorrectedText('');
      return;
    }

    const data = await makeRequest(`${process.env.REACT_APP_API_URL}/api/text/modify`, {
      method: 'POST',
      body: JSON.stringify({ 
        type: 'fix',
        text: trimmedText,
        model: model
      }),
    });

    if (data) {
      setCorrectedText(data.correctedText);
      addToHistory(data.correctedText); // Добавляем ответ в историю
    }
  }, [model, makeRequest, setCorrectedText, addToHistory]);

  // Используем custom hook для обработки текста с учетом autofix
  const { handleTextChange, handlePaste, cancelDebounce } = useTextProcessing(
    autofix ? processGrammarText : null, // Передаем null если autofix выключен
    text, 
    setText
  );

  // Эффект для очистки результата когда текст пустой
  useEffect(() => {
    if (!text || text.trim().length === 0) {
      setCorrectedText('');
      // НЕ добавляем пустую строку в историю автоматически при изменении текста
    }
  }, [text, setCorrectedText]);

  // Обработчик изменения модели с немедленной обработкой
  const handleModelChangeWithProcessing = (e) => {
    handleModelChange(e);
    
    // Обрабатываем только если autofix включен
    if (autofix && text.trim().length >= 3) {
      cancelDebounce();
      processGrammarText(text);
    }
  };

  // Обработчик изменения исправленного текста
  const handleCorrectedTextChange = (e) => {
    setCorrectedText(e.target.value);
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
          {/* Ячейка 1: Выбор модели для ввода */}
          <div className="grid-cell model-cell">
            <div className="model-autofix-container">
              <ModelSelector 
                value={model}
                onChange={handleModelChangeWithProcessing}
              />
              {/* Чекбокс Autofix */}
              <div className="autofix-checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={autofix}
                    onChange={handleAutofixChange}
                  />
                  <span>Autofix</span>
                </label>
              </div>
            </div>
          </div>

          {/* Ячейка 2: Выбор стиля коррекции */}
          <div className="grid-cell empty-cell">
            <div className="language-selector">
              <StyleSelector 
                onStyleSelect={handleStyleSelect}
              />
              {/* Кнопки навигации по истории справа от кнопок стилей */}
              <div className="history-buttons">
                <button
                  type="button"
                  className={`history-btn history-back ${currentIndex <= 0 ? 'disabled' : ''}`}
                  onClick={goBack}
                  disabled={currentIndex <= 0}
                  title="Previous response"
                >
                  ←
                </button>
                <button
                  type="button"
                  className={`history-btn history-forward ${currentIndex >= history.length - 1 ? 'disabled' : ''}`}
                  onClick={goForward}
                  disabled={currentIndex >= history.length - 1}
                  title="Next response"
                >
                  →
                </button>
              </div>
            </div>
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

          {/* Ячейка 4: Поле с исправленным текстом */}
          <div className="grid-cell output-cell">
            <div className="result-container">
              <TextArea 
                value={loading ? '' : correctedText}
                onChange={handleCorrectedTextChange}
                readOnly={!correctedText.trim() || loading}
                placeholder={loading ? '' : "Corrected text will appear here..."}
                className={`form-control result-textarea result-textarea-grammar ${correctedText.trim() && !loading ? 'filled' : 'empty'}`}
              />
              {loading && (
                <div className="loading-dots-overlay">
                  <LoadingDots />
                </div>
              )}
              <CopyButton 
                text={correctedText}
                className="copy-btn-output"
                title="Copy corrected text"
              />
            </div>
          </div>
        </div>
      </form>

      <ErrorMessage error={error} />
    </div>
  );
};

export default GrammarCorrection;