import React, { useState } from "react";
import "../styles/Form.css";
import logoFormPassForgot from "../images/logos/SoundPulse_green.png";
import { useTranslation } from "react-i18next";

const FormPasswortForgot = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    // Simple email validation
    if (!email || !email.includes("@")) {
      setMessage(t("Please enter a valid email address."));
      return;
    }

    setMessage(t("We have sent your username and password to your email."));
    console.log("Sending credentials to:", email);
    // Here may be a request to the server for password recovery
  };

  return (
    <div className="form">
      <div className="logo-container-form">
        <img src={logoFormPassForgot} alt="Logo" className="logo-form" />
      </div>

      <div className="form-container-login">
        <input
          type="email"
          placeholder={t("Enter your email*")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="input-form"
        />

        {message && <p className="info-text-forgot-pass">{message}</p>}

        <button className="button" onClick={handleSend}>
          {t("Send username & password to email")}
        </button>
      </div>
    </div>
  );
};

export default FormPasswortForgot;
