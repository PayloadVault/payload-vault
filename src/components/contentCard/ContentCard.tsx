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
  } = props;

  const Icon = cardIcon[props.variant];

  const handleNavigate = () => {
    if (link) {
      navigate(link);
    }
  };

  const handleDownloadClick = () => {
    // Download the document -> downloadLink
  };

  const handleOpenClick = () => {
    // Open the document -> openLink
  };

  return (
    <div
      className={`w-full bg-color-bg-card border border-color-border-light
        rounded-radius-md p-4 shadow-shadow-medium
        transition-colors duration-200 ease-in-out
        ${
          variant !== "document"
            ? "cursor-pointer hover:border-color-primary"
            : ""
        }`}
      onClick={handleNavigate}
    >
      <div className="flex justify-between">
        <TitleSide
          variant={variant}
          title={title}
          subtitle={subtitle}
          date={date}
          Icon={Icon}
        />
        <div className="flex items-center gap-5">
          {profit && (
            <h4 className="font-bold text-color-primary">
              {normalizeProfit(profit)} €
            </h4>
          )}
          {variant === "document" ? (
            <div className="flex gap-5">
              <button
                className="cursor-pointer p-1 items-center justify-center flex hover:text-color-primary rounded-radius-sm hover:bg-color-primary/10
                transition-colors duration-200 ease-in-out"
                onClick={handleDownloadClick}
              >
                <DownloadIcon className="w-6 h-6 text-color-icon shrink-0" />
              </button>
              <button
                className="cursor-pointer p-1 items-center justify-center flex hover:text-color-primary rounded-radius-sm hover:bg-color-primary/10
                transition-colors duration-200 ease-in-out"
                onClick={handleOpenClick}
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
