import React, { useState, useEffect, useRef } from 'react';

const StyleSelector = ({ onStyleSelect, className = '', autofix = false }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(''); // Убираем дефолтное значение
  const dropdownRef = useRef(null);
  const clickTimeoutRef = useRef(null);

  // Стили для выпадающего списка (кроме Fix)
  const DROPDOWN_STYLES = [
    { code: 'shorten', name: 'Shorten' },
    { code: 'enhance', name: 'Enhance' },
    { code: 'formal', name: 'Formal' },
    { code: 'casual', name: 'Casual' },
    { code: 'rephrase', name: 'Rephrase' }
  ];

  // Обработчик клика вне выпадающего списка
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Обработчик клика по кнопке Fix с поддержкой двойного нажатия
  const handleFixClick = () => {
    if (clickTimeoutRef.current) {
      // Это двойное нажатие - включаем Autofix
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      onStyleSelect('autofix'); // Передаем специальный код для включения autofix
    } else {
      // Это первое нажатие - ждем второе
      clickTimeoutRef.current = setTimeout(() => {
        // Если не было второго нажатия, выполняем обычную коррекцию
        onStyleSelect('fix');
        clickTimeoutRef.current = null;
      }, 300); // 300ms для двойного нажатия
    }
  };

  // Обработчик выбора из выпадающего списка
  const handleDropdownSelect = (styleCode) => {
    setSelectedStyle(styleCode);
    setIsDropdownOpen(false);
    onStyleSelect(styleCode);
  };

  // Обработчик переключения выпадающего списка
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className={`language-selector ${className}`}>
      {/* Стили как кнопки */}
      <div className="language-buttons">
        {/* Кнопка Fix/Autofix */}
        <button
          type="button"
          className={`lang-btn ${autofix ? 'autofix-active' : 'fix-btn'}`}
          onClick={handleFixClick}
        >
          {autofix ? 'Autofix' : 'Fix'}
        </button>

        {/* Выпадающий список Improve text */}
        <div className="dropdown" ref={dropdownRef}>
          <button
            type="button"
            className="dropdown-toggle lang-btn"
            onClick={toggleDropdown}
          >
            Improve text
          </button>
          {isDropdownOpen && (
            <ul className="dropdown-menu show">
              {DROPDOWN_STYLES.map(style => (
                <li key={style.code}>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => handleDropdownSelect(style.code)}
                  >
                    {style.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default StyleSelector;