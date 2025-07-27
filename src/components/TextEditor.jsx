import React, { useCallback, useEffect, useState, useRef } from 'react';
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

const TextEditor = ({ text, setText, correctedText, setCorrectedText }) => {
  const { makeRequest, loading, error } = useApiRequest();
  const { model, handleModelChange } = useModelState();
  const [autofix, setAutofix] = useState(false); // По умолчанию выключен
  
  // Состояние для истории ответов
  const [history, setHistory] = useState(['']); // Инициализируем с пустой строкой
  const [currentIndex, setCurrentIndex] = useState(0); // Начинаем с индекса 0

  // Обработчик выбора стиля коррекции
  const handleStyleSelect = (style) => {
    // Используем текущий текст в поле (correctedText или text)
    const currentText = correctedText || text;
    if (currentText.trim().length >= 3) {
      cancelDebounce();
      processGrammarText(currentText, style);
    }
  };

  // Обработчик изменения чекбокса Autofix
  const handleAutofixChange = (e) => {
    const newAutofixValue = e.target.checked;
    setAutofix(newAutofixValue);
    
    // Если включаем autofix и есть текст, выполняем коррекцию
    if (newAutofixValue && text.trim().length >= 3) {
      cancelDebounce();
      processGrammarText(text, 'fix');
    }
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
      setText(history[newIndex]); // Always set text
      setCorrectedText(''); // Clear correctedText
    }
  }, [currentIndex, history, setText, setCorrectedText]);

  // Функция навигации вперед
  const goForward = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      setText(history[newIndex]); // Always set text
      setCorrectedText(''); // Clear correctedText
    }
  }, [currentIndex, history, setText, setCorrectedText]);

  // Единая функция обработки грамматики с любым стилем
  const processGrammarText = useCallback(async (inputText, style) => {
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
      setText(data.correctedText); // заменяем текст в поле на исправленный
      setCorrectedText(''); // очищаем correctedText
      addToHistory(trimmedText); // Сохраняем то, что отправлялось к бэку
      addToHistory(data.correctedText); // Сохраняем то, что пришло от бэка
    }

    console.log("Req: History length: " + history.length + ". History: " + history);

  }, [model, makeRequest, setText, setCorrectedText, addToHistory]);

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
    } else {
      // Если autofix выключен, просто обновляем текст
      setCorrectedText('');
    }
  };

  // Обработчик вставки для единого поля
  const handlePasteSingle = (e) => {
    if (autofix) {
      handlePaste(e);
    } else {
      setCorrectedText('');
    }
  };

  // Эффект для очистки результата когда текст пустой
  useEffect(() => {
    if (!text || text.trim().length === 0) {
      setCorrectedText('');
    }
  }, [text, setCorrectedText]);

  // Эффект для синхронизации текста при autofix выключен
  useEffect(() => {
    if (!autofix) {
      setCorrectedText(text);
    }
  }, [text, autofix, setCorrectedText]);

  // Обработчик изменения модели с немедленной обработкой
  const handleModelChangeWithProcessing = (e) => {
    handleModelChange(e);
    
    // Обрабатываем только если autofix включен
    if (autofix) {
      const currentText = correctedText || text;
      if (currentText.trim().length >= 3) {
        cancelDebounce();
        processGrammarText(currentText, 'fix');
      }
    }
  };

  // Обработчик очистки текста
  const handleClearText = () => {
    setText('');
    setCorrectedText('');
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

          {/* Ячейка 3: Единое поле ввода/вывода текста */}
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
                <div className="loading-dots-overlay">
                  <LoadingDots />
                </div>
              )}
            </div>
          </div>
        </div>
      </form>

      <ErrorMessage error={error} />
    </div>
  );
};

export default TextEditor;