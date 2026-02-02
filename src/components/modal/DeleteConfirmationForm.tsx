import { useState } from "react";
import { Button } from "../button/Button";
import { useBanner } from "../../context/banner/BannerContext";

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

  const { showBanner } = useBanner();

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();

      showBanner(
        "File Deleted",
        `The file "${fileName}" has been successfully deleted.`,
        "success",
      );
    } catch (error) {
      showBanner(
        "Error",
        `An error occurred while deleting the file "${fileName}".`,
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pt-2">
      <p className="text-color-text-secondary w-70">
        Möchten Sie wirklich löschen "
        <span className="font-semibold text-color-text-primary break-all">
          {fileName}
        </span>
        "?
      </p>
      <div className="mt-6 flex gap-6">
        <Button variant="secondary" text="Abbrechen" onClick={onCancel} />
        <Button
          text="Löschen"
          variant="decline"
          onClick={handleConfirm}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
