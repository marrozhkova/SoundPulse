import React, { useState, useRef, useEffect, useContext } from "react";
import { FaMoon, FaUserCircle, FaGlobe } from "react-icons/fa";
import { IoBulb } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import FormLogin from "./FormLogin";
import { useUser } from "../contexts/UserContext";
import "../styles/Navigation.css";
import en from "../images/icons/en.webp";
import de from "../images/icons/de.webp";
import fr from "../images/icons/fr.webp";
import es from "../images/icons/es.webp";
import zh from "../images/icons/zh.webp";
import ar from "../images/icons/ar.webp";

import { ThemeContext } from "../contexts/ThemeContext";

const Navigation = () => {
  const { t, i18n } = useTranslation();
  const [showLanguages, setShowLanguages] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [icon, setIcon] = useState(<FaGlobe />);
  const languageRef = useRef(null);
  const accountRef = useRef(null);

  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  const { isAuthenticated, logoutUser } = useUser();

  const languages = [
    { code: "de", flag: "🇩🇪", name: t("German"), url: de },
    { code: "en", flag: "🇺🇸", name: t("English"), url: en },
    { code: "fr", flag: "🇫🇷", name: t("French"), url: fr },
    { code: "es", flag: "🇪🇸", name: t("Spanish"), url: es },
    { code: "zh", flag: "🇨🇳", name: t("Chinese"), url: zh },
    { code: "ar", flag: "🇸🇦", name: t("Arabic"), url: ar },
  ];

  const toggleLanguages = () => {
    setShowLanguages(!showLanguages);
    setShowAccountMenu(false);
  };

  const toggleAccountMenu = () => {
    setShowAccountMenu(!showAccountMenu);
    setShowLanguages(false);
  };

  const handleLanguageSelect = (langCode) => {
    i18n.changeLanguage(langCode);
    setShowLanguages(false);
    let source = null;
    langCode === "en"
      ? (source = en)
      : langCode === "fr"
      ? (source = fr)
      : langCode === "de"
      ? (source = de)
      : langCode === "ar"
      ? (source = ar)
      : langCode === "zh"
      ? (source = zh)
      : (source = es);
    setIcon(<img src={source} alt="lang icon" />);
  };

  const handleLoginClick = () => {
    setShowLoginForm(true);
    setShowAccountMenu(false);
  };

  const handleLogoutClick = () => {
    logoutUser();
    setShowAccountMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        languageRef.current &&
        !languageRef.current.contains(event.target) &&
        accountRef.current &&
        !accountRef.current.contains(event.target)
      ) {
        setShowLanguages(false);
        setShowAccountMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav className="navbar">
        <div className="nav-left">
          <div className="icon" id="theme-icon" onClick={toggleDarkMode}>
            {(isDarkMode && <IoBulb />) || <FaMoon />}
          </div>

          <div
            className={`icon language-icon ${showLanguages ? "active" : ""}`}
            ref={languageRef}
            onClick={toggleLanguages}
          >
            {icon}
            {showLanguages && (
              <ul className="language-dropdown">
                {languages.map(({ code, flag, name }) => (
                  <li
                    key={code}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLanguageSelect(code);
                    }}
                  >
                    {flag} {name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div
            className={`icon account-icon ${showAccountMenu ? "active" : ""}`}
            ref={accountRef}
            onClick={toggleAccountMenu}
          >
            <FaUserCircle />
            {showAccountMenu && (
              <ul className="account-dropdown">
                {isAuthenticated ? (
                  <li onClick={handleLogoutClick}>{t("Log Out")}</li>
                ) : (
                  <li onClick={handleLoginClick}>{t("Log In")}</li>
                )}
              </ul>
            )}
          </div>
        </div>
      </nav>

      {showLoginForm && !isAuthenticated && (
        <FormLogin onClose={() => setShowLoginForm(false)} />
      )}
    </>
  );
};

export default Navigation;
