import { cardIcon } from "./ContentCard.const";
import type { CombinedContentCardProps } from "./ContentCard.types";
import { useNavigate } from "react-router-dom";
import { TitleSide } from "./TitleSide";
import { normalizeProfit } from "./ContentCard.utils";

export const ContentCard = (props: CombinedContentCardProps) => {
  const navigate = useNavigate();

  const { variant, title, subtitle, link, date, profit } = props;

  const Icon = cardIcon[props.variant];

  const handleNavigate = () => {
    if (link) {
      navigate(link);
    }
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
        <div className="flex items-center">
          {profit && (
            <h4 className="font-bold text-color-primary">
              {normalizeProfit(profit)} €
            </h4>
          )}
        </div>
      </div>
    </div>
  );
};
