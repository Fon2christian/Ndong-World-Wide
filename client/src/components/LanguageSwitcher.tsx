import { useState, useEffect, useRef } from "react";
import { useLanguage } from "../context/LanguageContext";
import type { Language } from "../i18n/translations";

const languageFlags: Record<Language, string> = {
  en: "🇬🇧",
  fr: "🇫🇷",
  ja: "🇯🇵",
};

const languageNames: Record<Language, string> = {
  en: "English",
  fr: "Français",
  ja: "日本語",
};

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: Language[] = ["en", "fr", "ja"];

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="language-switcher">
      <button
        className="language-switcher__toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select language"
      >
        <span className="language-switcher__flag">{languageFlags[language]}</span>
        <span className="language-switcher__name">{languageNames[language]}</span>
        <svg
          className={`language-switcher__arrow ${isOpen ? "language-switcher__arrow--open" : ""}`}
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div className="language-switcher__dropdown">
          {languages.map((lang) => (
            <button
              key={lang}
              className={`language-switcher__option ${lang === language ? "language-switcher__option--active" : ""}`}
              onClick={() => handleSelect(lang)}
            >
              <span className="language-switcher__flag">{languageFlags[lang]}</span>
              <span className="language-switcher__name">{languageNames[lang]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
