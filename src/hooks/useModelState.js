import { useState, useRef, useEffect } from 'react';
import { AI_MODELS } from '../constants/models';

export const useModelState = (initialModel = AI_MODELS.GEMMA_3_27B_IT) => {
  const [model, setModel] = useState(initialModel);
  const modelRef = useRef(model);

  // Обновляем ref при изменении модели
  useEffect(() => {
    modelRef.current = model;
  }, [model]);

  const handleModelChange = (e) => {
    const newModel = e.target.value;
    setModel(newModel);
    modelRef.current = newModel;
  };

  return {
    model,
    setModel,
    modelRef,
    handleModelChange,
  };
}; 