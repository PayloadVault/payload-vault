import { IncomeIcon } from "../icons";
import type { TotalIncomeCardProps } from "./TotalIncomeCard.types";
import { normalizeProfit } from "../contentCard/ContentCard.utils";

export const TotalIncomeCard = ({
  title,
  totalIncome,
  subtitle,
}: TotalIncomeCardProps) => {
  return (
    <div className="bg-color-bg-accent/15 rounded-radius-lg flex p-5 justify-center">
      <div className="w-[95%] flex flex-col items-baseline gap-1">
        <h4 className="text-color-text-subtle">{title}</h4>
        <h3 className="text-color-primary">{normalizeProfit(totalIncome)} €</h3>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="flex justify-center">
        <IncomeIcon className="w-14 lg:w-18 text-color-primary" />
      </div>
    </div>
  );
};
