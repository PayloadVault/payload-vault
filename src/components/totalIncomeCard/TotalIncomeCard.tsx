import { IncomeIcon } from "../icons";
import type { TotalIncomeCardProps } from "./TotalIncomeCard.types";

export const TotalIncomeCard = ({
  title,
  totalIncome,
  subtitle,
}: TotalIncomeCardProps) => {
  return (
    <div className="bg-color-bg-accent/15 rounded-radius-lg flex p-5 justify-center">
      <div className="w-[95%] flex flex-col items-baseline gap-3">
        <h3 className="text-color-text-subtle">{title}</h3>
        <h1 className="text-color-primary">{totalIncome.toLocaleString()} €</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="flex justify-center">
        <IncomeIcon size={70} />
      </div>
    </div>
  );
};
