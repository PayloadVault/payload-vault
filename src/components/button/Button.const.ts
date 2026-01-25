import { type ButtonVariant, type ButtonSize } from "./Button.types";

const sizeClasses: Record<ButtonSize, string> = {
  small: "h-10 px-3 py-2",
  medium: "h-12 p-3",
  large: "h-14 px-6 py-4",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-color-primary text-black",
  secondary: "bg-color-border-light text-white",
  approve: "bg-color-success text-white",
  decline: "bg-color-error text-white",
};

const onHover: Record<ButtonVariant, string> = {
  primary: "hover:bg-color-primary/80",
  secondary: "hover:bg-color-border-light/80",
  decline: "hover:bg-color-error/80",
  approve: "hover:bg-color-success/80",
};

const iconColorByVariant: Record<ButtonVariant, string> = {
  primary: "text-black",
  secondary: "text-white",
  approve: "text-white",
  decline: "text-white",
};

const spinnerColors: Record<ButtonVariant, string> = {
  primary: "black",
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
