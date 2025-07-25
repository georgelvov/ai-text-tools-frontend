import React from 'react';

const StyleSelector = ({ onStyleSelect, className = '' }) => {
  // Стили как кнопки
  const STYLES = [
    { code: 'fix', name: 'Fix' },
    { code: 'shorten', name: 'Shorten' },
    { code: 'enhance', name: 'Enhance' },
    { code: 'formal', name: 'Formal' },
    { code: 'casual', name: 'Casual' },
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