import React from 'react';
import { MODEL_OPTIONS } from '../../constants/models';

const ModelSelector = ({ value, onChange, className = '' }) => {
  return (
    <div className={`model-container ${className}`}>
      <select 
        className="form-select model-select" 
        value={value}
        onChange={onChange}
        required
      >
        {MODEL_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ModelSelector; 