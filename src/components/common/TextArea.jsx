import React from 'react';

const TextArea = ({ 
  value, 
  onChange, 
  onPaste, 
  placeholder = "Enter or paste your text here...",
  maxLength = 1500,
  readOnly = false,
  className = "form-control",
  style = {},
  ...props 
}) => {
  return (
    <div className="textarea-container">
      <textarea 
        className={className}
        value={value}
        onChange={onChange}
        onPaste={onPaste}
        maxLength={maxLength}
        readOnly={readOnly}
        placeholder={placeholder}
        style={style}
        {...props}
      />
      {!readOnly && (
        <div className="char-counter">
          <span>{value.length}</span>/{maxLength}
        </div>
      )}
    </div>
  );
};

export default TextArea; 