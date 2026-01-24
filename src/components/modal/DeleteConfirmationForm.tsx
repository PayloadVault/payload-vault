import { Button } from "../button/Button";

interface DeleteConfirmationFormProps {
  fileName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const DeleteConfirmationForm = ({
  fileName,
  onConfirm,
  onCancel,
  isLoading = false,
}: DeleteConfirmationFormProps) => {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-color-text-secondary">
        Are you sure you want to delete "
        <span className="font-semibold text-color-text-primary">
          {fileName}
        </span>
        "?
      </p>
      <div className="flex justify-end gap-3">
        <Button
          text="Cancel"
          variant="secondary"
          size="medium"
          onClick={onCancel}
          isDisabled={isLoading}
        />
        <Button
          text="Delete"
          variant="decline"
          size="medium"
          onClick={onConfirm}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
