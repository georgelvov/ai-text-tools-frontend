import React from 'react';

const ClearButton = ({ text, onClear, className = '', title = 'Clear text' }) => {
  if (!text || text.trim() === '') return null;

  return (
    <button 
      type="button" 
      className={`btn btn-sm btn-outline-secondary clear-btn ${className}`}
      onClick={onClear}
      title={title}
    >
      ✕
    </button>
  );
};

export default ClearButton; 