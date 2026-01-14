import { type ButtonVariant, type ButtonSize } from "./Button.types";

const sizeClasses: Record<ButtonSize, string> = {
  small: "h-10 px-3 py-2",
  medium: "h-12 p-3",
  large: "h-14 px-6 py-4",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-color-primary text-white",
  secondary: "bg-color-text-subtle/20 text-white",
  approve: "border-2 border-color-success bg-color-success/80 text-white",
  decline: "border-2 border-color-error bg-color-error/80 text-white",
};

const onHover: Record<ButtonVariant, string> = {
  primary: "hover:bg-color-primary/80",
  secondary: "hover:bg-color-text-subtle/40",
  decline: "hover:bg-color-error/60",
  approve: "hover:bg-color-success/60",
};

const iconColorByVariant: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-white",
  approve: "text-white",
  decline: "text-white",
};

const spinnerColors: Record<ButtonVariant, string> = {
  primary: "white",
  secondary: "white",
  approve: "white",
  decline: "white",
};

export {
  sizeClasses,
  variantClasses,
  onHover,
  iconColorByVariant,
  spinnerColors,
};
