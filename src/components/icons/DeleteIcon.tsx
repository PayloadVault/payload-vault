import type { IconProps } from "./Icon.types";

export const DeleteIcon = ({ size = 24, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M9 3h6a1 1 0 0 1 1 1v1h4a1 1 0 1 1 0 2h-1v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7H4a1 1 0 1 1 0-2h4V4a1 1 0 0 1 1-1zm1 2h4V5h-4zm-3 2v13h10V7zm3 3a1 1 0 0 1 2 0v7a1 1 0 1 1-2 0zm4 0a1 1 0 0 1 2 0v7a1 1 0 1 1-2 0z"
      fill="currentColor"
    />
  </svg>
);
