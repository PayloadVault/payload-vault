import { useState } from "react";
import { Button } from "../button/Button";
import { UploadIcon } from "../icons";
import { FileUploadCard } from "../uploadFileCard/UploadFileCard";

interface ImportPdfFormProps {
  onCancel: () => void;
  onSave: (files: File[]) => Promise<void>;
}
export const ImportPdfForm = ({ onCancel, onSave }: ImportPdfFormProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // await onSave();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="w-full">
        <FileUploadCard
          title="Import PDF"
          description="Choose from files or drag and drop"
        />
      </div>
      <div className="mt-6 flex gap-6">
        <Button variant="secondary" text="Cancel" onClick={onCancel} />
        <Button
          text="Upload PDF"
          icon={UploadIcon}
          onClick={handleSave}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
