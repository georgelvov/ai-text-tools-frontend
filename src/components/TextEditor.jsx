import React, { useCallback, useEffect, useState, useRef } from 'react';
import { 
  TextArea, 
  LoadingDots,
  ErrorMessage,
  CopyButton,
  ClearButton,
  StyleSelector,
  ModelSelector
} from './common';
import { useApiRequest, useTextProcessing } from '../hooks';

const TextEditor = ({ text, setText, correctedText, setCorrectedText, model, onModelChange }) => {
  const { makeRequest, loading, error } = useApiRequest();
  const [autofix, setAutofix] = useState(true); // По умолчанию включен
  
  // Состояние для истории ответов
  const [history, setHistory] = useState(['']); // Инициализируем с пустой строкой
  const [currentIndex, setCurrentIndex] = useState(0); // Начинаем с индекса 0

  // Обработчик выбора стиля коррекции с двойным нажатием для Autofix
  const handleStyleSelect = (style) => { 
    if (style === 'autofix') {
      // Двойное нажатие - включаем Autofix
      setAutofix(true);
      // Если есть текст, сразу отправляем запрос
      if (text && text.trim && text.trim().length >= 3) {
        cancelDebounce();
        processGrammarText(text, 'fix');
      }
      return;
    } else if (style === 'fix') {
      // Если уже включен autofix, то выключаем
      if (autofix) {
        setAutofix(false);
        return;
      }
      
      // Если есть текст, выполняем коррекцию
      if (text && text.trim && text.trim().length >= 3) {
        cancelDebounce();
        processGrammarText(text, style);
      }
    } else {
      // Для других стилей обычная логика
      if (text && text.trim && text.trim().length >= 3) {
        cancelDebounce();
        processGrammarText(text, style);
      }
    }
  };

  // Обработчик двойного нажатия на Fix для включения Autofix
  const handleFixDoubleClick = () => {
    setAutofix(true);
  };

  const addToHistory = useCallback((entry) => {
    setHistory(prevHistory => {
      // Не добавляем дубликаты подряд
      if (prevHistory.length > 0 && prevHistory[prevHistory.length - 1] === entry) {
        return prevHistory;
      }
      
      const newHistory = [...prevHistory, entry];
      // Ограничиваем историю 10 элементами
      if (newHistory.length > 10) {
        return newHistory.slice(-10);
      }

      setCurrentIndex(newHistory.length - 1);

      return newHistory;
    });
  }, []);

  // Функция навигации назад
  const goBack = useCallback(() => {
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    setText(history[newIndex] || ''); // Добавляем fallback на пустую строку
  }, [currentIndex, history, setText]);

  // Функция навигации вперед
  const goForward = useCallback(() => {
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    setText(history[newIndex] || ''); // Добавляем fallback на пустую строку
  }, [currentIndex, history, setText]);

  // Единая функция обработки грамматики с любым стилем
  const processGrammarText = useCallback(async (inputText, style) => {
    const originalText = inputText.trim();

    if (!originalText || originalText.length < 3) {
      return;
    }

    const data = await makeRequest(`${process.env.REACT_APP_API_URL}/api/text/modify`, {
      method: 'POST',
      body: JSON.stringify({ 
        type: style,
        text: originalText,
        model: model
      }),
    });

    if (data) {
      const correctedText = data.correctedText.trim();
      setText(correctedText); // заменяем текст в поле на исправленный
      addToHistory(originalText); // Сохраняем то, что отправлялось к бэку
      addToHistory(correctedText); // Сохраняем то, что пришло от бэка
    }

    console.log("Req: History length: " + history.length + ". History: " + history);

  }, [model, makeRequest, setText, addToHistory]);

  // Используем custom hook для обработки текста с учетом autofix
  const { handleTextChange, handlePaste, cancelDebounce } = useTextProcessing(
    autofix ? (text) => processGrammarText(text, 'fix') : null, // Передаем функцию с явным указанием стиля
    text, 
    setText,
    3,
    2000 // 2 секунды задержка
  );

  // Обработчик изменения текста для единого поля
  const handleTextChangeSingle = (e) => {
    const newText = e.target.value;
    setText(newText);
    
    if (autofix) {
      // Если autofix включен, используем стандартную обработку с debounce
      handleTextChange(e);
    }
  };

  // Обработчик вставки для единого поля
  const handlePasteSingle = (e) => {
    if (autofix) {
      handlePaste(e);
    }
  };

  // Обработчик очистки текста
  const handleClearText = () => {
    setText('');
    addToHistory('');
  };

  return (
    <div className="tool-form">
      <form>
        <div className="grammar-grid">
          {/* Ячейка 1: Кнопки истории и стили */}
          <div className="grid-cell model-cell">
            <div className="buttons-row">
              <div className="history-buttons">
                <button
                  type="button"
                  className={`history-btn history-back ${currentIndex <= 0 ? 'disabled' : ''}`}
                  onClick={goBack}
                  disabled={currentIndex < 0}
                  title="Previous response"
                >
                  ←
                </button>
                <button
                  type="button"
                  className={`history-btn history-forward ${currentIndex == history.length - 1 ? 'disabled' : ''}`}
                  onClick={goForward}
                  disabled={currentIndex >= history.length - 1}
                  title="Next response"
                >
                  →
                </button>
              </div>
              <StyleSelector 
                onStyleSelect={handleStyleSelect}
                autofix={autofix}
              />
            </div>
          </div>

          {/* Ячейка 2: Единое поле ввода/вывода текста */}
          <div className="grid-cell input-cell" style={{ gridColumn: '1 / -1' }}>
            <div className="input-container">
              <TextArea 
                value={text || ''}
                onChange={handleTextChangeSingle}
                onPaste={handlePasteSingle}
                placeholder="Enter or paste your text here..."
                readOnly={false}
              />
              <CopyButton 
                text={text}
                className="copy-btn-input"
                title="Copy text"
              />
              <ClearButton 
                text={text}
                onClear={handleClearText}
                className="clear-btn-input"
                title="Clear text"
              />
              {loading && (
                <div className="text-editor-loading-dots-overlay">
                  <LoadingDots />
                </div>
              )}
            </div>
            
            {/* Выбор модели в правом нижнем углу */}
            <div className="model-selector-bottom">
              <ModelSelector 
                value={model}
                onChange={onModelChange}
                className="d-inline-block"
              />
            </div>
          </div>
        </div>
      </form>

      <ErrorMessage error={error} />
    </div>
  );
};

export default TextEditor;