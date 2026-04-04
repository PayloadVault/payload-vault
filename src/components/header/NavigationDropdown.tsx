import { Link, useLocation } from "react-router-dom";

type NavigationDropdownProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const navigationLinks = [
  { label: "Home", to: "/" },
  { label: "Statistiken", to: "/statistiken" },
  { label: "Analysen", to: "/analysen" },
  { label: "Einnahmen", to: "/einnahmen" },
  {
    label: "Steuerrelevante Ausgaben",
    to: "/steuerrelevante-ausgaben",
  },
];

const isActivePath = (pathname: string, to: string) => {
  if (to === "/") return pathname === to;
  return pathname === to || pathname.startsWith(`${to}/`);
};

export const NavigationDropdown = ({
  isOpen,
  setIsOpen,
}: NavigationDropdownProps) => {
  const { pathname } = useLocation();

  if (!isOpen) return null;

  return (
    <div
      role="menu"
      className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-radius-md border border-color-border-light bg-color-bg-dark shadow-shadow-medium z-50 overflow-hidden"
    >
      <div className="border-b border-color-border-light px-4 py-3">
        <p className="text-sm text-color-text-secondary">Navigation</p>
      </div>

      <nav className="flex flex-col py-2">
        {navigationLinks.map((link) => {
          const isActive = isActivePath(pathname, link.to);

          return (
            <Link
              key={link.to}
              to={link.to}
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className={`px-4 py-3 text-sm no-underline transition-all duration-200 ease-in-out ${
                isActive
                  ? "bg-color-primary/15 text-color-primary"
                  : "text-color-text-subtle hover:bg-color-primary/20 hover:text-color-text-main"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
