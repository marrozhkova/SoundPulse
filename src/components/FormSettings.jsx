import React, { useState } from "react";
import "../styles/Form.css";
import { useTranslation } from "react-i18next";
import { div } from "framer-motion/client";
import logoFormSettings from "../images/logos/SoundPulse_green.png";

const FormSettings = () => {
  const { t } = useTranslation();

  const [activeTab, setActiveTab] = useState("username");

  // States for username tab
  const [oldUsername, setOldUsername] = useState("current_user"); // Example old username
  const [newUsername, setNewUsername] = useState("");
  const [passwordForUsername, setPasswordForUsername] = useState("");

  // States for password tab
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  return (
    <div className="form">
      <div className="logo-container-form">
        <img src={logoFormSettings} alt="Logo" className="logo-form" />
      </div>
      <div className="account-settings ">
        {/* Tabs */}
        <div className="tabs">
          <button
            className={
              activeTab === "username" ? "button active" : "button-secondary"
            }
            onClick={() => setActiveTab("username")}
          >
            {t("Username")}
          </button>
          <button
            className={
              activeTab === "password" ? "button active" : "button-secondary"
            }
            onClick={() => setActiveTab("password")}
          >
            {t("Password")}
          </button>
        </div>

        {/* Username Tab */}
        {activeTab === "username" && (
          <div className="tab-content">
            <h4 className="title-tab-content">{t("Change Username")}</h4>
            <input
              type="text"
              value={oldUsername}
              disabled
              placeholder={t("Old username")}
              className="input-form "
            />
            <input
              type="text"
              placeholder={t("New username*")}
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="input-form "
            />
            <input
              type="password"
              placeholder={t("Enter password*")}
              value={passwordForUsername}
              onChange={(e) => setPasswordForUsername(e.target.value)}
              className="input-form "
            />
            <button className="button">{t("Change Username")}</button>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <div className="tab-content">
            <h4 className="title-tab-content">{t("Change Password")}</h4>
            <input
              type="password"
              placeholder={t("enter old password *")}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="input-form"
            />
            <input
              type="password"
              placeholder={t("enter new password *")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-form"
            />
            <input
              type="password"
              placeholder={t("Confirm new password *")}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="input-form "
            />
            <button className="button">{t("Change Password")}</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormSettings;
