import { type BannerType } from "./Banner.types";

const buttonText: Record<BannerType, string> = {
  success: "Undo",
  error: "Retry",
};

const bannerStyle: Record<BannerType, string> = {
  success: "border-color-success-border/40 bg-color-success/40",
  error: "border-color-error-border/40 bg-color-error/40",
};
export { buttonText, bannerStyle };
