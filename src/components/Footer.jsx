import "../styles/Footer.css";
import { FaGithub } from "react-icons/fa";
import logo from "../images/logos/SoundPulse_black.png";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="footer">
      <div className="footer-left">
        <img src={logo} alt="SoundPulse Logo" className="footer-logo" />
      </div>
      <div className="footer-center">
        <p className="text-sm">
          {t("KaRoBo-Studio and Powered by Radio Browser API")} ©
          {new Date().getFullYear()}
        </p>
      </div>
      <div className="footer-right">
        <a
          href="https://github.com/Natallia-Karatava"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="icon-footer-wrapper">
            <FaGithub />
            <p>Ka</p>
          </div>
        </a>
        <a
          href="https://github.com/marrozhkova"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="icon-footer-wrapper">
            <FaGithub />
            <p>Ro</p>
          </div>
        </a>
        <a
          href="https://github.com/Grafikmartin"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="icon-footer-wrapper">
            <FaGithub />
            <p>Bo</p>
          </div>
        </a>
      </div>
    </footer>
  );
};

export default Footer;
