import { useState, useEffect, useRef, useMemo } from "react";
import { Dropdown } from "../dropdown/Dropdown";
import { UserIcon, VaultIcon } from "../icons";
import { MenuDropdown } from "./MenuDropdown";
import { useAuth } from "../../context/AuthContext";
import { useYear } from "../../hooks/year/UseYear";

type HeaderHomeProps = {
  isTwoHeaders?: boolean;
};

export const HeaderHome = ({ isTwoHeaders = false }: HeaderHomeProps) => {
  const { user } = useAuth();
  const { year, setYear, availableYears } = useYear();

  const options = useMemo(
    () =>
      availableYears.map((y) => ({
        label: y.toString(),
        id: y.toString(),
      })),
    [availableYears]
  );

  const [selectedYear, setSelectedYear] = useState({
    id: year.toString(),
    label: year.toString(),
  });
  const [isOpen, setIsOpen] = useState(false);
  type Theme = "light" | "dark";

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    return (document.documentElement.dataset.theme as Theme) ?? "dark";
  });

  useEffect(() => {
    setYear(Number(selectedYear.id));
  }, [selectedYear, setYear]);

  useEffect(() => {
    setSelectedYear({
      id: year.toString(),
      label: year.toString(),
    });
  }, [year]);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);

    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
  };

  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleOpen = () => setIsOpen((v) => !v);

  // close on outside click + Escape
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setIsOpen(false);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
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
      className={`bg-color-bg-main ${
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
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-color-primary/20 rounded-full flex items-center justify-center shrink-0">
            <VaultIcon className="w-6 h-6 sm:w-8 sm:h-8 text-color-primary" />
          </div>

          <div className="flex flex-col min-w-0">
            <h5 className="leading-tight">Paycheck Vault</h5>

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
              onSelect={setSelectedYear}
            />
          </div>

          <div className="relative shrink-0" ref={menuRef}>
            <button
              className="
            cursor-pointer p-2 rounded-radius-md
            hover:bg-color-primary/20 hover:text-color-primary
          "
              aria-label="User menu"
              aria-haspopup="menu"
              aria-expanded={isOpen}
              type="button"
              onClick={handleOpen}
            >
              <UserIcon className="w-7 h-7 sm:w-8 sm:h-8 text-color-text-secondary" />
            </button>

            <MenuDropdown
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              theme={theme}
              toggleTheme={toggleTheme}
            />
          </div>
        </div>
      </div>
    </header>
  );
};
