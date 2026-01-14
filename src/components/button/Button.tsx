import { LoadingIcon } from "../icons/LoadingIcon";
import { type ButtonProps } from "./Button.types";
import {
  sizeClasses,
  variantClasses,
  onHover,
  spinnerColors,
  iconColorByVariant,
} from "./Button.const";

export const Button = ({
  text,
  isLoading = false,
  isDisabled = false,
  size = "small",
  variant = "primary",
  icon,
  onClick,
}: ButtonProps) => {
  const isButtonDisabled = isDisabled || isLoading;
  const Icon = icon;

  return (
    <button
      className={`shadow-shadow-medium cursor-pointer flex w-auto items-center justify-center gap-2 rounded-sm font-bold transition-opacity duration-150 ease-out ${
        variantClasses[variant]
      } ${sizeClasses[size]} ${
        isButtonDisabled ? "cursor-not-allowed opacity-50" : onHover[variant]
      } focus:outline-3 focus:outline-(--focus)`}
      disabled={isButtonDisabled}
      onClick={onClick}
    >
      {icon ? (
        isLoading ? (
          <LoadingIcon
            color={spinnerColors[variant]}
            className="h-6 w-6 shrink-0 animate-spin"
          />
        ) : (
          Icon && (
            <Icon
              className={`h-6 w-6 shrink-0 ${iconColorByVariant[variant]}`}
            />
          )
        )
      ) : null}
      {text}
    </button>
  );
};
