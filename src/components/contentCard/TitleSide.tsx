import type { TitleSideProps } from "./ContentCard.types";

export const TitleSide = ({
  variant,
  title,
  subtitle,
  date,
  Icon,
}: TitleSideProps) => {
  return (
    <div
      className={`flex items-center
        transition-colors duration-200 ease-in-out ${
          variant !== "document" ? "hover:text-color-primary" : ""
        }`}
    >
      <Icon className="w-8 h-8 text-color-icon mr-4 shrink-0" />
      <div className="flex flex-col gap-2 mb-1">
        <h3 className="text-[16px] font-semibold truncate">{title}</h3>

        {subtitle ? (
          <p className="text-[14px] text-color-text-secondary">{subtitle}</p>
        ) : (
          date && (
            <p className="text-[14px] text-color-text-secondary">{date}</p>
          )
        )}
      </div>
    </div>
  );
};
