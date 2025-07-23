import React, { useState, useEffect } from 'react';
import { MAIN_LANGUAGES, ADDITIONAL_LANGUAGES } from '../../constants/languages';

const LanguageSelector = ({ selectedLanguage, onLanguageSelect, className = '' }) => {
  // Состояние для хранения текущих кнопок языков
  const [currentButtons, setCurrentButtons] = useState(MAIN_LANGUAGES);
  // Состояние для хранения дополнительных языков
  const [additionalLangs, setAdditionalLangs] = useState(ADDITIONAL_LANGUAGES);
  
  // Все языки для выпадающего списка
  const dropdownLanguages = additionalLangs
    .filter(lang => !currentButtons.some(btn => btn.code === lang.code))
    .sort((a, b) => a.name.localeCompare(b.name));

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
    onLanguageSelect(langCode);
  };

  // Обработчик клика по кнопке
  const handleButtonClick = (langCode) => {
    onLanguageSelect(langCode);
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
      <select
        className="form-select language-select"
        value={dropdownLanguages.some(lang => lang.code === selectedLanguage) ? selectedLanguage : ""}
        onChange={(e) => handleDropdownSelect(e.target.value)}
      >
        <option value="" disabled></option>
        {dropdownLanguages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector; 