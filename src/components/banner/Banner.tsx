import { CloseIcon } from "../icons/CloseIcon";
import { type BannerProps } from "./Banner.types";
import { bannerStyle } from "./Banner.const";

export const Banner = ({
  bannerType,
  title,
  description,
  onCloseBanner,
}: BannerProps) => {
  return (
    <div
      className={`relative flex h-auto w-70 flex-col items-start justify-start rounded-md border px-3 py-2.5 shadow-[4px_4px_32px_0px_#0000001F] backdrop-blur-[32px] ${bannerStyle[bannerType]}`}
    >
      <p className="align-middle text-[14px] leading-[140%] font-bold text-color-text-secondary">
        {title}
      </p>
      <p className="w-11/12 align-middle text-[14px] leading-[140%] font-medium text-color-text-secondary">
        {description}
      </p>
      <button
        onClick={onCloseBanner}
        className="absolute top-1 right-1 flex cursor-pointer items-center justify-center"
      >
        <CloseIcon className="h-6 w-6 shrink-0" />
      </button>
    </div>
  );
};
