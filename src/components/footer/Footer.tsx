export const Footer = () => {
  return (
    <footer className="w-full border-t border-color-border-light bg-color-bg-main py-4 px-6 sm:px-8 lg:px-12 flex justify-center items-center pb-20 flex-col gap-3">
      <p className="text-sm text-color-text-secondary">
        &copy; {new Date().getFullYear()} PayloadVault. All rights reserved.
      </p>
      <div className="flex gap-5">
        <a
          href="/datenschutz"
          className="text-sm text-color-primary hover:underline ml-6"
        >
          Privacy Policy
        </a>
        <a
          href="/impressum"
          className="text-sm text-color-primary hover:underline"
        >
          Impressum
        </a>
      </div>
    </footer>
  );
};
