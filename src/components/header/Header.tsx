import { ArrowBackIcon } from "../icons";

type HeaderProps = {
  title: string;
  subtitle: string;
};

export const Header = ({ title, subtitle }: HeaderProps) => {
  return (
    <header className="bg-color-bg-main border-b-color-border-light border-b-2">
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
          <button
            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shrink-0 cursor-pointer hover:text-color-primary hover:bg-color-primary/20 rounded-full"
            onClick={() => window.history.back()}
          >
            <ArrowBackIcon className="w-5 h-5 sm:w-7 sm:h-7" />
          </button>

          <div className="flex flex-col min-w-0">
            <h5 className="leading-tight">{title}</h5>

            <p className="text-[14px] sm:text-[16px] text-color-text-secondary truncate">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
