import React, { useState } from "react";
import "../styles/Form.css";
import logoFormPassForgot from "../images/logos/SoundPulse_green.png";
import { useTranslation } from "react-i18next";
import { FaTimes } from "react-icons/fa";
import emailjs from "@emailjs/browser";

const FormPasswortForgot = ({ onClose, onSwitchToLogin }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState({ message: "", type: "" });

  const handleSend = async () => {
    if (!email || !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(email)) {
      setStatus({
        message: t("Please enter a valid email address."),
        type: "error",
      });
      return;
    }

    const usersFromStorage = localStorage.getItem("users");

    if (!usersFromStorage) {
      setStatus({ message: t("No registered users found."), type: "error" });
      return;
    }

    const users = JSON.parse(usersFromStorage);
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user) {
      setStatus({
        message: t("No user found with this email."),
        type: "error",
      });
      return;
    }

    try {
      await sendEmail(user);
      setStatus({
        message: t("We have sent your username and password to your email."),
        type: "success",
      });
    } catch (error) {
      console.error("Failed to send email:", error);
      setStatus({
        message: t("Failed to send email. Please try again."),
        type: "error",
      });
    }
  };

  const sendEmail = async (userData) => {
    const templateParams = {
      to_email: userData.email,
      user_name: userData.username,
      password: userData.password,
    };

    try {
      const response = await emailjs.send(
        "service_3z7zhao",
        "template_q033mmt",
        templateParams,
        "LIWb9KtXvMfuCxiqy"
      );
      console.log("Email sent successfully:", response);
    } catch (error) {
      console.error("Failed to send email:", error);
      setStatus({
        message: t("Failed to send email. Please try again."),
        type: "error",
      });
    }
  };

  return (
    <div className="modal-overlay active">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
        <div className="logo-container-form">
          <img src={logoFormPassForgot} alt="Logo" className="logo-form" />
          <p className="info-text text-sm">
            {t(
              "Enter your email address and we will send you your username and password."
            )}
          </p>
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

          {status.message && (
            <p
              className={
                status.type === "success"
                  ? "info-text-forgot-pass"
                  : "error-text-registration"
              }
            >
              {status.message}
            </p>
          )}

          <button className="button" onClick={handleSend}>
            {t("Send username & password to email")}
          </button>

          <div className="signup-link">
            <button className="back-button" onClick={onSwitchToLogin}>
              {t("Back to Log In")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormPasswortForgot;
