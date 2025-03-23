import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { FetchProvider } from "./contexts/FetchContext.jsx";
import { I18nextProvider } from "react-i18next";
import TranslateContext from "./contexts/TranslateContext.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <I18nextProvider i18n={TranslateContext}>
      <ThemeProvider>
        <FetchProvider>
          <App />
        </FetchProvider>
      </ThemeProvider>
    </I18nextProvider>
  </StrictMode>
);
