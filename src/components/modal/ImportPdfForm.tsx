import { useState } from "react";
import { Button } from "../button/Button";
import { UploadIcon } from "../icons";
import { FileUploadCard } from "../uploadFileCard/UploadFileCard";
import { useModal } from "../../context/modal/ModalContext";

export interface UploadProgress {
  completed: number;
  total: number;
  inProgress: boolean;
}

interface ImportPdfFormProps {
  onCancel: () => void;
  onSave: (
    files: File[],
    onProgress: (progress: UploadProgress) => void,
  ) => Promise<void>;
}

const MAX_FILES = 10;

export const ImportPdfForm = ({ onCancel, onSave }: ImportPdfFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const { setDisableClose } = useModal();

  const handleSave = async () => {
    if (!isLoading && files.length > 0) {
      setIsLoading(true);
      setDisableClose(true);
      try {
        await onSave(files, setProgress);
      } finally {
        setIsLoading(false);
        setDisableClose(false);
        setProgress(null);
      }
    }
  };

  const buttonText = progress
    ? `Processing ${progress.completed}/${progress.total}...`
    : files.length > 1
      ? `Upload ${files.length} PDFs`
      : "Upload PDF";

  return (
    <div className="flex flex-col gap-6 mt-3">
      <div className="w-full">
        <FileUploadCard
          title="Import PDF"
          description={`Choose up to ${MAX_FILES} files or drag and drop`}
          files={files}
          setFiles={setFiles}
          disabled={isLoading}
          maxFiles={MAX_FILES}
        />
      </div>

      {progress && (
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm text-color-text-subtle">
            <span>
              {progress.inProgress ? "Processing files..." : "Completed"}
            </span>
            <span>
              {progress.completed}/{progress.total}
            </span>
          </div>
          <div className="w-full bg-color-bg-dark rounded-full h-2">
            <div
              className="bg-color-primary h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(progress.completed / progress.total) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-6">
        <Button
          variant="secondary"
          text="Cancel"
          onClick={onCancel}
          isDisabled={isLoading}
        />
        <Button
          text={buttonText}
          icon={UploadIcon}
          onClick={handleSave}
          isLoading={isLoading}
          isDisabled={files.length === 0}
        />
      </div>
    </div>
  );
};
