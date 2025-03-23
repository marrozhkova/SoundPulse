import React, { useState } from "react";
import "../styles/Form.css";
import logoFormRegistration from "../images/logos/SoundPulse_green.png";
import { useTranslation } from "react-i18next";
import { FaTimes } from "react-icons/fa";
import emailjs from "@emailjs/browser";
import { useUser } from "../contexts/UserContext";

const FormRegistration = ({ onClose, onSwitchToLogin }) => {
  const { t } = useTranslation();
  const { registerUser } = useUser();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState({ message: "", type: "" });

  const handleSignUp = async () => {
    if (!username || !email || !password || !confirmPassword) {
      setError(t("Please fill in all fields."));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("Password doesn't match."));
      return;
    }

    setError("");

    const newUser = { username, email, password };

    try {
      await sendEmail(newUser);
      registerUser(newUser);
      setStatus({ message: t("Registration successful!"), type: "success" });

      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setEmail("");

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Registration failed:", error);
      setStatus({
        message: t("Registration failed. Please try again."),
        type: "error",
      });
    }
  };

  const sendEmail = async (userData) => {
    setStatus({ message: "Sending...", type: "info" });

    const templateParams = {
      to_email: userData.email,
      user_name: userData.username,
      password: userData.password,
      message: `Registration details for ${userData.username}`,
    };

    await emailjs.send(
      "service_3z7zhao",
      "template_6xdl5m5",
      templateParams,
      "LIWb9KtXvMfuCxiqy"
    );
  };

  return (
    <div className="modal-overlay active">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
        <div className="logo-container-form">
          <img src={logoFormRegistration} alt="Logo" className="logo-form" />
        </div>
        <div className="form-container-login">
          <h3>{t("Registration")}</h3>
          <input
            type="text"
            placeholder={t("username*")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-form"
            required
          />
          <input
            type="email"
            placeholder={t("e-mail*")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-form"
            required
          />
          <input
            type="password"
            placeholder={t("password*")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-form"
            required
          />
          <input
            type="password"
            placeholder={t("confirm password*")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-form"
            required
          />
          {error && <p className="error-text-registration">{error}</p>}
          {status.message && (
            <div className={`status-message ${status.type}`}>
              {status.message}
            </div>
          )}
          <button className="button" onClick={handleSignUp}>
            {t("Sign Up")}
          </button>
          <div className="signup-link">
            <span className="text-m">{t("Already have an account? ")}</span>
            <button className="signup-button" onClick={onSwitchToLogin}>
              {t("Login")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormRegistration;
