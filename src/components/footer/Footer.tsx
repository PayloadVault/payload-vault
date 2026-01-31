import { useNavigate } from "react-router-dom";

export const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="w-full border-t border-color-border-light bg-color-bg-main py-4 px-6 sm:px-8 lg:px-12 flex justify-center items-center pb-20 flex-col gap-3">
      <p className="text-sm text-color-text-secondary">
        &copy; {new Date().getFullYear()} PayloadVault. All rights reserved.
      </p>
      <div className="flex gap-10">
        <button
          onClick={() => navigate("/datenschutz")}
          className="text-sm text-color-primary hover:underline"
        >
          Datenschutz
        </button>
        <button
          onClick={() => navigate("/impressum")}
          className="text-sm text-color-primary hover:underline"
        >
          Impressum
        </button>
      </div>
    </footer>
  );
};
