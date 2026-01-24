import {
  useMemo,
  useRef,
  useState,
  type DragEventHandler,
  type ChangeEventHandler,
} from "react";
import { ExcelPaper } from "../icons";
import type { UploadCardProps } from "./UploadfileCard.types";
import { Button } from "../button/Button";

export const FileUploadCard = ({
  description,
  accept = ".pdf",
  files,
  setFiles,
  disabled,
  maxFiles = 10,
}: UploadCardProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [isDragOver, setIsDragOver] = useState(false);

  const openPicker = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const isValidFile = (f: File) => /\.pdf$/i.test(f.name);

  const addFiles = (incoming: File[]) => {
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    incoming.forEach((file) => {
      if (isValidFile(file)) {
        validFiles.push(file);
      } else {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length) {
      // showBanner(
      //   "File type mismatch",
      //   "Some files were ignored. Only PDF files are allowed.",
      //   "error"
      // );
    }

    if (validFiles.length) {
      setFiles((prev) => {
        const combined = [...prev, ...validFiles];
        return combined.slice(0, maxFiles);
      });
    }
  };

  const onInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    if (selectedFiles.length) addFiles(selectedFiles);
    e.currentTarget.value = "";
  };

  const onDrop: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const droppedFiles = Array.from(e.dataTransfer.files ?? []);
    if (droppedFiles.length) addFiles(droppedFiles);
  };

  const onDragOver: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragOver(true);
  };

  const onDragLeave: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const containerClasses = useMemo(() => {
    const base =
      "flex w-full aspect-square flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-2 text-center transition-colors";
    if (isDragOver) {
      return `${base} bg-black text-color-text-secondary`;
    }
    return `${base} border-color-border-light bg-transparent text-inherit`;
  }, [isDragOver]);

  return (
    <div
      className={containerClasses}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") openPicker();
      }}
    >
      {isDragOver ? (
        <ExcelPaper className="text-color-text-subtle pointer-events-none" />
      ) : (
        <ExcelPaper className="text-color-primary pointer-events-none" />
      )}

      <p
        className={`text-[16px] leading-6 font-medium pointer-events-none ${
          isDragOver ? "text-color-text-secondary/90" : "text-color-text-subtle"
        }`}
      >
        {description}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={onInputChange}
      />

      {files.length > 0 && (
        <div className="mt-2 w-full max-w-80 lg:max-w-130">
          <div className="flex max-h-48 flex-col gap-2 overflow-y-auto pr-1">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between rounded-md bg-color-bg-dark p-4"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <ExcelPaper size={32} className="text-color-primary" />
                  <span
                    className="
                    truncate font-medium text-color-text-secondary
                    max-w-[12ch]
                    sm:max-w-[20ch]
                    lg:max-w-[20c]
                    "
                    title={file.name}
                  >
                    {file.name}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setFiles((prev) => prev.filter((_, i) => i !== index))
                  }
                  className="ml-3 h-10 w-10 rounded text-color-text-secondary transition-colors hover:bg-color-primary/10"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isDragOver && (
        <Button
          variant="secondary"
          text="Choose Files"
          onClick={openPicker}
          isDisabled={disabled}
        />
      )}
    </div>
  );
};
