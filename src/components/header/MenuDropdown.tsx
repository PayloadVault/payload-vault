import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { LockIcon, LogoutIcon, MoonIcon, SunIcon } from "../icons";

type MenuDropdownProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
};

export const MenuDropdown = ({
  isOpen,
  setIsOpen,
  theme,
  toggleTheme,
}: MenuDropdownProps) => {
  if (!isOpen) return null;

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setIsOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div
      role="menu"
      className="
              absolute right-0 top-full mt-2
              min-w-55
              rounded-radius-md
              border border-color-border-light
              bg-color-bg-dark
              shadow-lg
              z-50
              overflow-hidden
            "
    >
      <button
        role="menuitem"
        className="w-full px-4 py-3 text-left hover:bg-color-primary/20 cursor-pointer flex items-center gap-2
        transition-colors duration-200 ease-in-out"
        onClick={() => {
          setIsOpen(false);
          // do change password action
        }}
      >
        <LockIcon className="w-4 h-4" />
        Change Password
      </button>

      <button
        role="menuitem"
        className="w-full px-4 py-3 text-left hover:bg-color-primary/20 cursor-pointer flex items-center gap-2
        transition-colors duration-200 ease-in-out"
        onClick={() => {
          toggleTheme();
          setIsOpen(false);
        }}
      >
        {theme === "dark" ? (
          <SunIcon className="w-4 h-4" />
        ) : (
          <MoonIcon className="w-4 h-4" />
        )}
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </button>

      <button
        role="menuitem"
        className="w-full px-4 py-3 text-left hover:bg-color-primary/20 cursor-pointer flex items-center gap-2 text-color-error-text
        transition-colors duration-200 ease-in-out"
        onClick={() => {
          setIsOpen(false);
          handleLogout();
        }}
      >
        <LogoutIcon className="w-4 h-4" />
        Logout
      </button>
    </div>
  );
};
