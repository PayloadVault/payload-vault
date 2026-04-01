import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import "./cookieconsent-overrides.css";
import { ScrollToTop } from "./components/scrollToTop/ScrollToTop";
import { setupCookieConsent } from "./cookieconsent-config";

setupCookieConsent();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
