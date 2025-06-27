import React, { useState, useEffect, useCallback } from 'react';
import './GrammarCorrection.css';

const GrammarCorrection = () => {
  const [text, setText] = useState('');
  const [model, setModel] = useState('gemma-3-27b-it');
  const [correctedText, setCorrectedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processingIndicator, setProcessingIndicator] = useState(false);

  // Debounce function
  const debounce = useCallback((func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }, []);

  // Process text function for grammar correction
  const processGrammarText = async () => {
    const trimmedText = text.trim();
    if (!trimmedText || trimmedText.length < 3) {
      setCorrectedText('');
      return;
    }

    setLoading(true);
    setError('');
    setCorrectedText('');

    try {
      const response = await fetch('http://localhost:8080/api/grammar/correct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: trimmedText,
          model
        })
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setCorrectedText(data.correctedText);
    } catch (error) {
      setError('An error occurred while processing your request. Please try again later.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create debounced version of the process function
  const debouncedGrammarProcess = useCallback(
    debounce(() => {
      setProcessingIndicator(false);
      processGrammarText();
    }, 1500),
    [text, model]
  );

  // Handle text input
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    
    if (newText.trim().length === 0) {
      setCorrectedText('');
      setProcessingIndicator(false);
      return;
    }
    
    if (newText.length >= 3) {
      setProcessingIndicator(true);
      debouncedGrammarProcess();
    }
  };

  // Handle model change
  const handleModelChange = (e) => {
    setModel(e.target.value);
    if (text.trim().length >= 3) {
      processGrammarText();
    }
  };

  // Handle paste event
  const handlePaste = () => {
    setTimeout(() => {
      if (text.trim()) {
        processGrammarText();
      }
    }, 100);
  };

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