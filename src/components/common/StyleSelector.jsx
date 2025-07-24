import React from 'react';

const StyleSelector = ({ onStyleSelect, className = '' }) => {
  // Стили как кнопки
  const STYLES = [
    { code: 'shorter', name: 'Shorter' },
    { code: 'formal', name: 'Formal' },
    { code: 'enhance', name: 'Enhance' },
    { code: 'rephrase', name: 'Rephrase' }
  ];

  // Обработчик клика по кнопке
  const handleButtonClick = (styleCode) => {
    onStyleSelect(styleCode);
  };

  return (
    <div className={`language-selector ${className}`}>
      {/* Стили как кнопки */}
      <div className="language-buttons">
        {STYLES.map(style => (
          <button
            key={style.code}
            type="button"
            className="lang-btn"
            onClick={() => handleButtonClick(style.code)}
          >
            {style.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StyleSelector; 