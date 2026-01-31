import { Button } from "../button/Button";

interface LogoutModalFormProps {
  onCancel: () => void;
  onSave: () => void;
}

export const LogoutModalForm = ({ onCancel, onSave }: LogoutModalFormProps) => {
  return (
    <div className="flex flex-col gap-6 pt-2">
      <p className="text-color-text-secondary w-70">
        Are you sure you want to quit?
      </p>
      <div className="mt-6 flex gap-6">
        <Button variant="secondary" text="Cancel" onClick={onCancel} />
        <Button text="Quit" variant="decline" onClick={onSave} />
      </div>
    </div>
  );
};
