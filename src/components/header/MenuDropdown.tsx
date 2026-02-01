import { useChangePasswordModal } from "../../hooks/modal/UsePasswordChangeModal";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { LockIcon, LogoutIcon, MoonIcon, SunIcon } from "../icons";
import { useBanner } from "../../context/banner/BannerContext";
import { useLogoutModal } from "../../hooks/modal/UseLogoutModal";

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
  const navigate = useNavigate();
  const { showBanner } = useBanner();

  const handleChangePassword = async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      if (
        error.message.toLowerCase().includes("same") ||
        error.message.toLowerCase().includes("different")
      ) {
        throw new Error(
          "Das neue Passwort darf nicht mit Ihrem aktuellen Passwort identisch sein.",
        );
      }
      throw new Error("An error occurred while changing the password.");
    }

    showBanner(
      "Password Changed",
      "Your password has been successfully changed.",
      "success",
    );
    closeModal();
  };

  const { openChangePasswordModal, closeModal } = useChangePasswordModal({
    onSave: handleChangePassword,
  });

  if (!isOpen) return null;

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setIsOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }

    closeLogoutModal();
  };

  const { openLogoutModal, closeModal: closeLogoutModal } = useLogoutModal({
    onSave: handleLogout,
  });

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
        hover:text-color-text-main text-color-text-subtle transition-colors duration-200 ease-in-out"
        onClick={() => {
          openChangePasswordModal();
          setIsOpen(false);
        }}
      >
        <LockIcon className="w-4 h-4" />
        Passwort ändern
      </button>

      <button
        role="menuitem"
        className="w-full px-4 py-3 text-left hover:bg-color-primary/20 cursor-pointer flex items-center gap-2
        hover:text-color-text-main text-color-text-subtle transition-colors duration-200 ease-in-out"
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
        {theme === "dark" ? "Hellmodus" : "Dunkelmodus"}
      </button>

      <button
        role="menuitem"
        className="w-full px-4 py-3 text-left hover:bg-color-primary/20 cursor-pointer flex items-center gap-2 text-color-error-text/75
        hover:text-color-error-text transition-colors duration-200 ease-in-out"
        onClick={() => {
          setIsOpen(false);
          openLogoutModal();
        }}
      >
        <LogoutIcon className="w-4 h-4" />
        Abmelden
      </button>
    </div>
  );
};
