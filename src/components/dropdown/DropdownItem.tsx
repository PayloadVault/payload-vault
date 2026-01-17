import type { Option } from "./Dropdown.types";

interface DropdownItemProps {
  option: Option;
  onClick: (option: Option) => void;
}

export const DropdownItem = ({ option, onClick }: DropdownItemProps) => {
  const Icon = option.icon;
  const handleClick = () => onClick(option);

  return (
    <button
      className="flex h-12 w-full cursor-pointer items-center gap-4 hover:bg-color-primary"
      onClick={handleClick}
    >
      {Icon && <Icon />}
      <p className="flex items-center align-middle leading-6 w-full h-full hover:text-color-text-main px-6">
        {option.label}
      </p>
    </button>
  );
};
