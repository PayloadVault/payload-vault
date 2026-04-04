import { useState, useEffect, useRef, useMemo } from "react";
import { Dropdown } from "../dropdown/Dropdown";
import { CloseIcon, UserIcon } from "../icons";
import { MenuDropdown } from "./MenuDropdown";
import { NavigationDropdown } from "./NavigationDropdown";
import { useAuth } from "../../context/AuthContext";
import { useYear } from "../../hooks/year/UseYear";
import { useNavigate } from "react-router-dom";

type HeaderHomeProps = {
  isTwoHeaders?: boolean;
  isSticky?: boolean;
};

export const HeaderHome = ({
  isTwoHeaders = false,
  isSticky = true,
}: HeaderHomeProps) => {
  const { user } = useAuth();
  const { year, setYear, availableYears } = useYear();

  const navigate = useNavigate();

  const options = useMemo(
    () =>
      availableYears.map((y) => ({
        label: y.toString(),
        id: y.toString(),
      })),
    [availableYears],
  );

  const selectedYear = useMemo(
    () => ({
      id: year.toString(),
      label: year.toString(),
    }),
    [year],
  );

  const handleYearChange = (option: { id: string; label: string }) => {
    setYear(Number(option.id));
  };

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNavigationOpen, setIsNavigationOpen] = useState(false);
  type Theme = "light" | "dark";

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return (document.documentElement.dataset.theme as Theme) ?? "dark";
  });

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);

    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
  };

  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigationRef = useRef<HTMLDivElement | null>(null);

  const handleMenuOpen = () => {
    setIsNavigationOpen(false);
    setIsUserMenuOpen((value) => !value);
  };

  const handleNavigationOpen = () => {
    setIsUserMenuOpen(false);
    setIsNavigationOpen((value) => !value);
  };

  // close on outside click + Escape
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;

      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }

      if (navigationRef.current && !navigationRef.current.contains(target)) {
        setIsNavigationOpen(false);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsUserMenuOpen(false);
        setIsNavigationOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <header
      className={`${isSticky ? "sticky top-0 z-40" : ""} bg-color-bg-main ${
        !isTwoHeaders ? "border-b-color-border-light border-b-2" : ""
      }`}
    >
      <div
        className="
          flex flex-col gap-3
          px-4 py-3
          sm:px-6
          md:px-10 md:py-3
          md:flex-row md:items-center md:justify-between
        "
      >
        <div
          className="flex items-center gap-4 min-w-0 hover:cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="flex items-center justify-center shrink-0">
            {theme === "dark" ? (
              <img
                src="/profinaLogo.svg"
                alt="Profina logo"
                className="w-30 md:w-40"
              />
            ) : (
              <img
                src="/profinaLogoLight.svg"
                alt="Profina logo"
                className="w-30 md:w-40"
              />
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <h5 className="leading-tight text-color-primary/90">
              <span className="text-color-primary font-semibold">Profina</span>{" "}
              Payload Vault
            </h5>

            <p className="text-[14px] sm:text-[16px] text-color-text-secondary truncate">
              {user?.email}
            </p>
          </div>
        </div>

        <div
          className="
            flex items-center gap-3
            w-full
            md:w-auto
            md:justify-end
          "
        >
          <div className="w-full sm:w-56 md:w-40">
            <Dropdown
              options={options}
              value={selectedYear}
              onSelect={handleYearChange}
            />
          </div>

          <div className="relative shrink-0" ref={navigationRef}>
            <button
              className="cursor-pointer p-2 rounded-radius-md hover:bg-color-primary/20 hover:text-color-primary transition-all duration-200 ease-in-out active:scale-95"
              aria-label={
                isNavigationOpen ? "Navigation schließen" : "Navigation öffnen"
              }
              aria-haspopup="menu"
              aria-expanded={isNavigationOpen}
              type="button"
              onClick={handleNavigationOpen}
            >
              {isNavigationOpen ? (
                <CloseIcon className="w-6 h-6 text-color-text-secondary" />
              ) : (
                <span className="flex h-6 w-6 flex-col items-center justify-center gap-1">
                  <span className="block h-0.5 w-5 rounded-full bg-current" />
                  <span className="block h-0.5 w-5 rounded-full bg-current" />
                  <span className="block h-0.5 w-5 rounded-full bg-current" />
                </span>
              )}
            </button>

            <NavigationDropdown
              isOpen={isNavigationOpen}
              setIsOpen={setIsNavigationOpen}
            />
          </div>

          <div className="relative shrink-0" ref={menuRef}>
            <button
              className="
            cursor-pointer p-2 rounded-radius-md
            hover:bg-color-primary/20 hover:text-color-primary
            transition-all duration-200 ease-in-out active:scale-95
          "
              aria-label="Benutzermenü"
              aria-haspopup="menu"
              aria-expanded={isUserMenuOpen}
              type="button"
              onClick={handleMenuOpen}
            >
              <UserIcon className="w-7 h-7 sm:w-8 sm:h-8 text-color-text-secondary" />
            </button>

            <MenuDropdown
              isOpen={isUserMenuOpen}
              setIsOpen={setIsUserMenuOpen}
              theme={theme}
              toggleTheme={toggleTheme}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
