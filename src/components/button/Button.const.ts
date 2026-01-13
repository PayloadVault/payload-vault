import { type ButtonVariant, type ButtonSize } from "./Button.types";

const sizeClasses: Record<ButtonSize, string> = {
  small: "h-10 px-3 py-2",
  medium: "h-12 p-3",
  large: "h-14 px-6 py-4",
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-color-primary text-white",
  secondary: "bg-color-text-subtle/20 text-white",
  approve: "border-2 border-(--success-emphasis) text-(--grey-1)",
  decline: "border-2 border-(--danger-emphasis) text-(--grey-1)",
};

const onHover: Record<ButtonVariant, string> = {
  primary: "hover:bg-color-primary/80",
  secondary: "hover:bg-color-text-subtle/40",
  decline: "hover:bg-(--danger)",
  approve: "hover:bg-(--success)",
};

const iconColorByVariant: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-white",
  approve: "text-(--success-emphasis)",
  decline: "text-(--danger-emphasis)",
};

const spinnerColors: Record<ButtonVariant, string> = {
  primary: "white",
  secondary: "white",
  approve: "var(--success-emphasis)",
  decline: "var(--danger-emphasis)",
};

export {
  sizeClasses,
  variantClasses,
  onHover,
  iconColorByVariant,
  spinnerColors,
};
