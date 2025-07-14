import React, { useState, useEffect, useCallback, useRef } from 'react';
import './GrammarCorrection.css';

const GrammarCorrection = () => {
  const [text, setText] = useState('');
  const [model, setModel] = useState('gemma-3-27b-it');
  const [correctedText, setCorrectedText] = useState('');
  const [originalCorrectedText, setOriginalCorrectedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Ref для хранения текущего запроса, чтобы его можно было отменить
  const currentRequestRef = useRef(null);
  // Ref для хранения debounce timeout
  const debounceTimeoutRef = useRef(null);
  // Refs для доступа к актуальным значениям в debounced функции
  const textRef = useRef(text);
  const modelRef = useRef(model);
  // Флаг для отслеживания вставки текста
  const isPastingRef = useRef(false);

  // Обновляем refs при изменении значений
  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    modelRef.current = model;
  }, [model]);

  // Process text function for grammar correction
  const processGrammarText = async () => {
    const trimmedText = textRef.current.trim();
    if (!trimmedText || trimmedText.length < 3) {
      setCorrectedText('');
      return;
    }

    // Отменяем предыдущий запрос, если он еще выполняется
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
    }

    setLoading(true);
    setError('');
    setCorrectedText('');

    try {
      // Создаем AbortController для возможности отмены запроса
      const abortController = new AbortController();
      currentRequestRef.current = abortController;

      console.log('Grammar Correction API URL: ' + `${process.env.REACT_APP_API_URL}/api/grammar/correct`);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/grammar/correct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: trimmedText,
          model: modelRef.current
        }),
        signal: abortController.signal
      });

      // Проверяем, не был ли запрос отменен
      if (abortController.signal.aborted) {
        return;
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setCorrectedText(data.correctedText);
      setOriginalCorrectedText(data.correctedText);
    } catch (error) {
      // Игнорируем ошибку отмены запроса
      if (error.name === 'AbortError') {
        return;
      }
      setError('An error occurred while processing your request. Please try again later.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
      currentRequestRef.current = null;
    }
  };

  // Create debounced version of the process function (1.5 seconds)
  const debouncedGrammarProcess = useCallback(() => {
    // Очищаем предыдущий timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      debounceTimeoutRef.current = null;
      processGrammarText();
    }, 1500);
  }, []); // Убираем зависимости

  // Handle text input (typing)
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    
    // Если это вставка, не запускаем debounce
    if (isPastingRef.current) {
      return;
    }
    
    if (newText.trim().length === 0) {
      setCorrectedText('');
      // Очищаем debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      return;
    }
    
    if (newText.length >= 3) {
      debouncedGrammarProcess();
    }
  };

  // Handle paste event (immediate processing)
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
        processGrammarText();
      }
      // Сбрасываем флаг вставки
      isPastingRef.current = false;
    }, 100);
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
      processGrammarText();
    }
  };

  // Handle corrected text changes
  const handleCorrectedTextChange = (e) => {
    setCorrectedText(e.target.value);
  };

  // Reset to original corrected text
  const handleResetToOriginal = () => {
    setCorrectedText(originalCorrectedText);
  };

  // Cleanup при размонтировании компонента
  useEffect(() => {
    return () => {
      // Отменяем текущий запрос при размонтировании
      if (currentRequestRef.current) {
        currentRequestRef.current.abort();
      }
      // Очищаем debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="tool-form">
      <form>
        <div className="grammar-grid">
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

          {/* Ячейка 2: Пустая для симметрии */}
          <div className="grid-cell empty-cell">
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

          {/* Ячейка 4: Поле с исправленным текстом */}
          <div className="grid-cell output-cell">
            <div className="result-container">
              <textarea 
                className="form-control result-textarea" 
                value={loading ? '' : correctedText}
                readOnly={!text.trim() || loading}
                placeholder={loading ? '' : "Corrected text will appear here..."}
                style={{ 
                  background: '#f8f9fa', 
                  color: '#6c757d',
                  minHeight: '300px',
                  resize: 'none',
                  opacity: text.trim() && !loading ? 1 : 0.6
                }}
                onChange={handleCorrectedTextChange}
              />
              {loading && (
                <div className="loading-dots-overlay">
                  <div className="loading-dots">
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                  </div>
                </div>
              )}
              {correctedText !== originalCorrectedText && originalCorrectedText && correctedText.trim() !== '' && text.trim() !== '' && !loading && (
                <button 
                  type="button" 
                  className="btn btn-sm btn-outline-secondary reset-btn"
                  onClick={handleResetToOriginal}
                  title="Show original correction"
                >
                  Show original
                </button>
              )}
            </div>
          </div>
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

export default GrammarCorrection; 