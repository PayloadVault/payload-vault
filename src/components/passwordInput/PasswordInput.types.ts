type PasswordInputProps = {
  value: string;
  onChange: (password: string) => void;
  label?: string;
  error?: string;
  isRequired?: boolean;
};

export type { PasswordInputProps };
