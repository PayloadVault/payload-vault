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
import { useBanner } from "../../context/banner/BannerContext";

const MAX_FILE_SIZE_KB = 500;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_KB * 1024;

export const FileUploadCard = ({
  description,
  accept = ".pdf",
  files,
  setFiles,
}: UploadCardProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { showBanner } = useBanner();

  const [isDragOver, setIsDragOver] = useState(false);

  const openPicker = () => inputRef.current?.click();

  const isPdfFile = (f: File) => /\.pdf$/i.test(f.name);
  const isValidSize = (f: File) => f.size <= MAX_FILE_SIZE_BYTES;

  const addFiles = (incoming: File[]) => {
    const validFiles: File[] = [];
    const invalidFormatFiles: string[] = [];
    const oversizedFiles: string[] = [];

    incoming.forEach((file) => {
      if (!isPdfFile(file)) {
        invalidFormatFiles.push(file.name);
        return;
      }
      if (!isValidSize(file)) {
        oversizedFiles.push(file.name);
        return;
      }
      validFiles.push(file);
    });

    if (invalidFormatFiles.length) {
      showBanner(
        "Invalid file format",
        `Only PDF files are allowed. Removed: ${invalidFormatFiles.join(", ")}`,
        "error",
      );
    }

    if (oversizedFiles.length) {
      showBanner(
        "File too large",
        `Files must be under ${MAX_FILE_SIZE_KB} KB. Removed: ${oversizedFiles.join(", ")}`,
        "error",
      );
    }

    if (validFiles.length) {
      setFiles((prev) => [...prev, ...validFiles]);
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

    const droppedFiles = Array.from(e.dataTransfer.files ?? []);
    if (droppedFiles.length) addFiles(droppedFiles);
  };

  const onDragOver: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
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
        <Button variant="secondary" text="Choose Files" onClick={openPicker} />
      )}
    </div>
  );
};
