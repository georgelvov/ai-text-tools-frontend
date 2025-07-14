import { useState, useRef, useCallback, useEffect } from 'react';
import { useDebounce } from './useDebounce';

export const useTextProcessing = (processFunction = null, minLength = 3) => {
  const [text, setText] = useState('');
  const isPastingRef = useRef(false);
  const textRef = useRef(text);
  const processFunctionRef = useRef(processFunction);
  
  // Обновляем ref функции при изменении
  useEffect(() => {
    processFunctionRef.current = processFunction;
  }, [processFunction]);

  const { debouncedCallback, cancelDebounce } = useDebounce(() => {
    if (processFunctionRef.current) {
      processFunctionRef.current(textRef.current);
    }
  });

  // Обновляем ref при изменении текста
  const updateText = useCallback((newText) => {
    setText(newText);
    textRef.current = newText;
  }, []);

  const handleTextChange = useCallback((e) => {
    const newText = e.target.value;
    updateText(newText);
    
    // Если это вставка, не запускаем debounce
    if (isPastingRef.current) {
      return;
    }
    
    if (newText.trim().length === 0) {
      cancelDebounce();
      return;
    }
    
    if (newText.length >= minLength && processFunctionRef.current) {
      debouncedCallback();
    }
  }, [debouncedCallback, cancelDebounce, minLength, updateText]);

  const handlePaste = useCallback(() => {
    // Устанавливаем флаг вставки
    isPastingRef.current = true;
    
    // Очищаем debounce timeout, так как вставка должна обрабатываться сразу
    cancelDebounce();
    
    // Небольшая задержка, чтобы текст успел вставиться и onChange сработал
    setTimeout(() => {
      if (textRef.current.trim() && processFunctionRef.current) {
        processFunctionRef.current(textRef.current);
      }
      // Сбрасываем флаг вставки
      isPastingRef.current = false;
    }, 100);
  }, [cancelDebounce]);

  return {
    text,
    setText: updateText,
    handleTextChange,
    handlePaste,
    cancelDebounce,
  };
}; 