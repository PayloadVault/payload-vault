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
      className="flex h-12 w-full cursor-pointer items-center gap-4 px-4 py-2 hover:bg-color-primary"
      onClick={handleClick}
    >
      {Icon && <Icon />}
      <p className="align-middle leading-6 text-white">{option.label}</p>
    </button>
  );
};
