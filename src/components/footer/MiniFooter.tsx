import { Link } from "react-router-dom";
import * as CookieConsent from "vanilla-cookieconsent";

export const MiniFooter = ({ showHome = true }: { showHome?: boolean }) => {
  return (
    <footer className="w-full py-3 px-4 text-center border-t border-color-border-light/50 bg-color-bg-main/80 backdrop-blur-sm">
      <div className="flex items-center justify-center gap-4 text-xs text-color-text-subtle flex-wrap">
        <Link
          to="/impressum"
          className="hover:text-color-primary transition-colors duration-200 hover:underline py-2 text-xs text-color-text-subtle"
        >
          Impressum
        </Link>
        <span className="text-color-border-light">·</span>
        <Link
          to="/datenschutz"
          className="hover:text-color-primary transition-colors duration-200 hover:underline py-2 text-xs text-color-text-subtle"
        >
          Datenschutzerklärung
        </Link>
        <span className="text-color-border-light">·</span>
        <button
          type="button"
          onClick={() => CookieConsent.showPreferences()}
          className="hover:text-color-primary transition-colors duration-200 hover:underline py-2 text-xs text-color-text-subtle"
        >
          Cookie-Einstellungen
        </button>
        {showHome && (
          <>
            <span className="text-color-border-light">·</span>
            <Link
              to="/"
              className="hover:text-color-primary transition-colors duration-200 hover:underline py-2 text-xs text-color-text-subtle"
            >
              Home
            </Link>
          </>
        )}
      </div>
    </footer>
  );
};
