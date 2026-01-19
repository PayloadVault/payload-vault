import { useChangePasswordModal } from "../../hooks/modal/UsePasswordChangeModal";
import { LockIcon, LogoutIcon, MoonIcon, SunIcon } from "../icons";
import { Banner } from "../banner/Banner";
import { useBannerNotification } from "../../hooks/banner/UseBannerNotification";

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
  const { banner, closeBanner, showBanner } = useBannerNotification();

  const handleChangePassword = async (newPassword: string) => {
    try {
      // await updatePassword(newPassword);
      showBanner(
        "Password updated.",
        "You have successfully replaced your old password with the new one.",
        "success"
      );
    } catch (error) {
      showBanner(
        "Password update failed.",
        "An error occurred while updating your password. Please try again.",
        "error"
      );
    } finally {
      closeModal();
    }
  };

  const { openChangePasswordModal, closeModal } = useChangePasswordModal({
    onSave: handleChangePassword,
  });

  if (!isOpen) return null;

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
        onClick={openChangePasswordModal}
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
          // logout action
        }}
      >
        <LogoutIcon className="w-4 h-4" />
        Logout
      </button>
      {banner && (
        <div className="animate-slide-in animate-slide-out fixed right-4 bottom-4">
          <Banner
            bannerType={banner.bannerType}
            title={banner.title}
            description={banner.description}
            onCloseBanner={closeBanner}
          />
        </div>
      )}
    </div>
  );
};
