import { useState } from "react";
import { Button } from "../button/Button";

interface DeleteConfirmationFormProps {
  fileName: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export const DeleteConfirmationForm = ({
  fileName,
  onConfirm,
  onCancel,
}: DeleteConfirmationFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-color-text-secondary">
        Are you sure you want to delete "
        <span className="font-semibold text-color-text-primary">
          {fileName}
        </span>
        "?
      </p>
      <div className="mt-6 flex gap-6">
        <Button variant="secondary" text="Cancel" onClick={onCancel} />
        <Button
          text="Delete"
          variant="decline"
          onClick={handleConfirm}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
