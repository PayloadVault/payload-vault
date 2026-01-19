import { useState } from "react";
import { Button } from "../button/Button";
import { PasswordInput } from "../passwordInput/PasswordInput";
import { LockIcon } from "../icons";

interface PasswordChangeFormProps {
  onCancel: () => void;
  onSave: (newPassword: string) => Promise<void>;
}
export const PasswordChangeForm = ({
  onCancel,
  onSave,
}: PasswordChangeFormProps) => {
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(password);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PasswordInput
        label="New Password"
        value={password}
        onChange={setPassword}
      />
      <PasswordInput
        label="Confirm New Password"
        value={repeatPassword}
        onChange={setRepeatPassword}
        isRepeated
      />
      <div className="mt-6 flex gap-6">
        <Button variant="secondary" text="Cancel" onClick={onCancel} />
        <Button
          text="Confirm change"
          icon={LockIcon}
          onClick={handleSave}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
