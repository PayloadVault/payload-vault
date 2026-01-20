import { cardIcon } from "./ContentCard.const";
import type { CombinedContentCardProps } from "./ContentCard.types";
import { useNavigate } from "react-router-dom";
import { TitleSide } from "./TitleSide";
import { normalizeProfit } from "./ContentCard.utils";
import { ArrowIcon, DownloadIcon, OpenIcon } from "../icons";

export const ContentCard = (props: CombinedContentCardProps) => {
  const navigate = useNavigate();

  const {
    variant,
    title,
    subtitle,
    link,
    date,
    profit,
    downloadLink,
    openLink,
    searchQuery,
  } = props;

  console.log("link: ", link);

  const Icon = cardIcon[props.variant];

  const handleNavigate = () => {
    if (link && variant !== "document") {
      navigate(link);
    }
  };

  const handleDownloadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!downloadLink) return;
    window.open(downloadLink, "_blank", "noopener,noreferrer");
  };

  const handleOpenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!openLink) return;
    window.open(openLink, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={`w-full bg-color-bg-card border border-color-border-light
        rounded-radius-md p-4 shadow-shadow-medium
        transition-colors duration-200 ease-in-out
        ${
          variant !== "document"
            ? "cursor-pointer hover:border-color-primary hover:text-color-primary"
            : ""
        }`}
      onClick={handleNavigate}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TitleSide
          title={title}
          subtitle={subtitle}
          date={date}
          Icon={Icon}
          searchQuery={searchQuery || ""}
        />

        <div className="flex w-full items-center justify-end gap-3 sm:w-auto sm:justify-end sm:gap-5">
          {profit && (
            <h4 className="font-bold text-color-primary whitespace-nowrap">
              {normalizeProfit(profit)} €
            </h4>
          )}

          {variant === "document" ? (
            <div className="flex items-center gap-2 sm:gap-5">
              <button
                type="button"
                className="cursor-pointer p-2 sm:p-1 items-center justify-center flex
                  hover:text-color-primary rounded-radius-sm hover:bg-color-primary/10
                  transition-colors duration-200 ease-in-out"
                onClick={handleDownloadClick}
                aria-label="Download"
              >
                <DownloadIcon className="w-6 h-6 text-color-icon shrink-0" />
              </button>

              <button
                type="button"
                className="cursor-pointer p-2 sm:p-1 items-center justify-center flex
                  hover:text-color-primary rounded-radius-sm hover:bg-color-primary/10
                  transition-colors duration-200 ease-in-out"
                onClick={handleOpenClick}
                aria-label="Open"
              >
                <OpenIcon className="w-6 h-6 text-color-icon shrink-0" />
              </button>
            </div>
          ) : (
            <ArrowIcon className="w-4 h-4 text-color-icon shrink-0 rotate-180" />
          )}
        </div>
      </div>
    </div>
  );
};
