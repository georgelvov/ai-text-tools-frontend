import React, { useState, useEffect, useCallback, useRef } from 'react';
import './GrammarCorrection.css';

const GrammarCorrection = () => {
  const [text, setText] = useState('');
  const [model, setModel] = useState('gemma-3-27b-it');
  const [correctedText, setCorrectedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processingIndicator, setProcessingIndicator] = useState(false);
  
  // Ref для хранения текущего запроса, чтобы его можно было отменить
  const currentRequestRef = useRef(null);
  // Ref для хранения debounce timeout
  const debounceTimeoutRef = useRef(null);
  // Refs для доступа к актуальным значениям в debounced функции
  const textRef = useRef(text);
  const modelRef = useRef(model);

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
      setProcessingIndicator(false);
      return;
    }

    // Отменяем предыдущий запрос, если он еще выполняется
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
    }

    setLoading(true);
    setError('');
    setCorrectedText('');
    setProcessingIndicator(false);

    try {
      // Создаем AbortController для возможности отмены запроса
      const abortController = new AbortController();
      currentRequestRef.current = abortController;

      const response = await fetch('http://localhost:8080/api/grammar/correct', {
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
    
    if (newText.trim().length === 0) {
      setCorrectedText('');
      setProcessingIndicator(false);
      // Очищаем debounce timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      return;
    }
    
    if (newText.length >= 3) {
      setProcessingIndicator(true);
      debouncedGrammarProcess();
    }
  };

  // Handle paste event (immediate processing)
  const handlePaste = () => {
    // Очищаем debounce timeout, так как вставка должна обрабатываться сразу
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    
    // Небольшая задержка, чтобы текст успел вставиться
    setTimeout(() => {
      if (textRef.current.trim()) {
        processGrammarText();
      }
    }, 100);
  };

  // Handle model change
  const handleModelChange = (e) => {
    setModel(e.target.value);
    if (textRef.current.trim().length >= 3) {
      // Очищаем debounce timeout и сразу обрабатываем
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      processGrammarText();
    }
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
          </div>
        </div>

        <div className="text-boxes">
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
          <div className="text-box">
            <div className="result-box">
              {processingIndicator && (
                <div className="processing-indicator">Processing...</div>
              )}
              {correctedText}
            </div>
          </div>
        </div>
      </form>

      {loading && (
        <div className="loading">
          <div className="spinner-border loading-spinner text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Fixing grammar...</p>
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

export default GrammarCorrection; 