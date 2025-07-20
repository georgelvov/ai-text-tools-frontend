import React, { useState, useCallback, useEffect } from 'react';
import { 
  ModelSelector, 
  TextArea, 
  LoadingDots, 
  ErrorMessage,
  CopyButton,
  ClearButton
} from './common';
import { useApiRequest, useTextProcessing, useModelState } from '../hooks';

const GrammarCorrection = () => {
  const [correctedText, setCorrectedText] = useState('');
  
  const { makeRequest, loading, error } = useApiRequest();
  const { model, handleModelChange } = useModelState();

  // Функция обработки грамматики с useCallback для стабильности
  const processGrammarText = useCallback(async (inputText) => {
    const trimmedText = inputText.trim();
    if (!trimmedText || trimmedText.length < 3) {
      setCorrectedText('');
      return;
    }

    const data = await makeRequest(`${process.env.REACT_APP_API_URL}/api/grammar/correct`, {
      method: 'POST',
      body: JSON.stringify({ 
        text: trimmedText,
        model: model
      }),
    });

    if (data) {
      setCorrectedText(data.correctedText);
    }
  }, [model, makeRequest]);

  // Используем custom hook для обработки текста
  const { text, handleTextChange, handlePaste, cancelDebounce, setText } = useTextProcessing(processGrammarText);

  // Эффект для очистки результата когда текст пустой
  useEffect(() => {
    if (!text || text.trim().length === 0) {
      setCorrectedText('');
    }
  }, [text]);

  // Обработчик изменения модели с немедленной обработкой
  const handleModelChangeWithProcessing = (e) => {
    handleModelChange(e);
    
    if (text.trim().length >= 3) {
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
          <div className="grid-cell empty-cell" />

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
                readOnly={!text.trim() || loading}
                placeholder={loading ? '' : "Corrected text will appear here..."}
                className={`form-control result-textarea result-textarea-grammar ${text.trim() && !loading ? 'filled' : 'empty'}`}
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