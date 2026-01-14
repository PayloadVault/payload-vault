import { useState, type ChangeEvent } from "react";
import { EyeIcon } from "../icons";
import { type PasswordInputProps } from "./PasswordInput.types";
import { CloseEyeIcon } from "../icons/CloseEyeIcon";

export const PasswordInput = ({
  value,
  onChange,
  label = "Password",
  error,
  isRequired,
}: PasswordInputProps) => {
  const [visible, setVisible] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleToggleVisibility = () => {
    setVisible(!visible);
  };

  return (
    <div>
      <div className="flex flex-col gap-2">
        <div className="flex">
          {isRequired && (
            <span className="mr-1 text-[24px] leading-none text-white">*</span>
          )}
          <label
            htmlFor="password"
            className="text-sm font-semibold text-white"
          >
            {label}
          </label>
        </div>
        <div
          className={`flex h-12 w-full rounded-lg border px-6 py-3
    ${
      error
        ? "bg-color-error/10 border-color-error"
        : "border-color-border-light bg-black"
    }
    focus-within:border-color-bg-accent`}
        >
          <input
            type={visible ? "text" : "password"}
            id="password"
            placeholder="Enter your password"
            value={value}
            onChange={handleInputChange}
            className={`w-full bg-transparent font-medium focus:outline-none placeholder:text-color-text-subtle placeholder:opacity-50 ${
              !visible && value
                ? "text-[16px] tracking-widest text-white"
                : "text-[16px] text-white"
            }`}
          />
          <button
            type="button"
            onClick={handleToggleVisibility}
            className="cursor-pointer"
          >
            {value && visible ? (
              <EyeIcon className="text-white" />
            ) : (
              <CloseEyeIcon className="text-white" />
            )}
          </button>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-[16px] font-medium text-color-error-text">
          {error}
        </p>
      )}
    </div>
  );
};
