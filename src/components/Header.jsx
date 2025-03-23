import React from "react";
import "../styles/Header.css";
import { useTranslation } from "react-i18next";
import logo from "../images/logos/SoundPulse_green.png";

const Header = () => {
  const { t } = useTranslation();
  return (
    <header className="header">
      <img
        className="logo"
        src={logo}
        alt="SoundPulse Logo"
        cid="SoundPulse_green.png"
      />
      <h2 className="title">
        {t("Welcome to your radio app.")} <br />{" "}
        {t("Your sound, your mood, your radio!")}
      </h2>
    </header>
  );
};

export default Header;
