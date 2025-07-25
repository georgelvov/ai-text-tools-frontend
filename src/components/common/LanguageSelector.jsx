import React, { useState, useEffect, useRef } from 'react';
import { MAIN_LANGUAGES, ADDITIONAL_LANGUAGES } from '../../constants/languages';

const LanguageSelector = ({ selectedLanguage, onLanguageSelect, className = '', children }) => {
  // Состояние для хранения текущих кнопок языков
  const [currentButtons, setCurrentButtons] = useState(MAIN_LANGUAGES);
  // Состояние для хранения дополнительных языков
  const [additionalLangs, setAdditionalLangs] = useState(ADDITIONAL_LANGUAGES);
  // Состояние для выпадающего списка
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Все языки для выпадающего списка
  const dropdownLanguages = additionalLangs
    .filter(lang => !currentButtons.some(btn => btn.code === lang.code))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Функция для разделения языков по столбцам
  const createColumns = (languages) => {
    const columns = 3;
    const itemsPerColumn = Math.ceil(languages.length / columns);
    const result = [];
    
    for (let i = 0; i < columns; i++) {
      const startIndex = i * itemsPerColumn;
      const endIndex = Math.min(startIndex + itemsPerColumn, languages.length);
      result.push(languages.slice(startIndex, endIndex));
    }
    
    return result;
  };

  const languageColumns = createColumns(dropdownLanguages);

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

  // Обработчик выбора языка из выпадающего списка
  const handleDropdownSelect = (langCode) => {
    const selectedLang = additionalLangs.find(l => l.code === langCode);
    if (!selectedLang) return;

    // Сохраняем последний язык из кнопок
    const lastButtonLang = currentButtons[currentButtons.length - 1];

    // Создаем новый массив кнопок
    const newButtons = [
      selectedLang, // Новый язык становится первым
      ...currentButtons.slice(0, -1) // Берем все кроме последнего
    ];

    // Обновляем список дополнительных языков
    setAdditionalLangs(prevLangs => [
      ...prevLangs.filter(lang => lang.code !== selectedLang.code), // Убираем выбранный язык
      lastButtonLang // Добавляем последний язык из кнопок
    ]);

    setCurrentButtons(newButtons);
    setIsDropdownOpen(false);
    onLanguageSelect(langCode);
  };

  // Обработчик клика по кнопке
  const handleButtonClick = (langCode) => {
    onLanguageSelect(langCode);
  };

  // Обработчик переключения выпадающего списка
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className={`language-selector ${className}`}>
      {/* Основные языки как кнопки */}
      <div className="language-buttons">
        {currentButtons.map(lang => (
          <button
            key={lang.code}
            type="button"
            className={`lang-btn ${selectedLanguage === lang.code ? 'active' : ''}`}
            onClick={() => handleButtonClick(lang.code)}
          >
            {lang.name}
          </button>
        ))}
      </div>

      {/* Дополнительные языки в выпадающем списке */}
      <div className="dropdown language-dropdown" ref={dropdownRef}>
        <button
          type="button"
          className="dropdown-toggle language-select"
          onClick={toggleDropdown}
        >
        </button>
        {isDropdownOpen && (
          <ul className="dropdown-menu show">
            {languageColumns.map((column, columnIndex) => (
              <li key={`column-${columnIndex}`} className="dropdown-column">
                <ul className="dropdown-column-list">
                  {column.map(lang => (
                    <li key={lang.code}>
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={() => handleDropdownSelect(lang.code)}
                      >
                        {lang.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Дочерние элементы (кнопки истории) */}
      {children}
    </div>
  );
};

export default LanguageSelector; 