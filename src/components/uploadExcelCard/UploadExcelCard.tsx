import {
  useMemo,
  useRef,
  useState,
  type DragEventHandler,
  type ChangeEventHandler,
} from "react";
import { ExcelIcon, ExcelPaper } from "../icons";
import type { ExcelUploadCardProps } from "./UploadExcelCard.types";
import { Button } from "../button/Button";
import { useBannerNotification } from "../../hooks/banner/UseBannerNotification";
import { Banner } from "../banner/Banner";

export const ExcelUploadCard = ({
  title,
  description,
  accept = ".xlsx,.xls,.csv",
}: ExcelUploadCardProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { banner, closeBanner, showBanner } = useBannerNotification();

  const openPicker = () => inputRef.current?.click();

  const isExcel = (f: File) => {
    const nameOk = /\.(xlsx|xls)|csv$/i.test(f.name);
    return nameOk;
  };

  const setPickedFile = (f: File | null) => {
    if (!f) return;
    if (!isExcel(f)) {
      showBanner(
        "File type mismatch",
        "Please upload a valid Excel file (.xlsx, .xls).",
        "error"
      );
      return;
    }
    setFile(f);
  };

  const onInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const f = e.target.files?.[0] ?? null;
    if (f) setPickedFile(f);
    e.currentTarget.value = "";
  };

  const onDrop: DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const f = e.dataTransfer.files?.[0] ?? null;
    if (f) setPickedFile(f);
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

  const removeFile = () => setFile(null);

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);

      showBanner(
        "Upload Successful",
        "The Excel file has been uploaded successfully.",
        "success"
      );
      setFile(null);
    } catch (error: unknown) {
      let message =
        "Something went wrong while uploading the Excel file. Please try again.";

      showBanner("Error occurred", message, "error");
    } finally {
      setIsUploading(false);
    }
  };

  const containerClasses = useMemo(() => {
    const base =
      "flex w-[50%] max-w-[420px] aspect-square flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-10 text-center transition-colors";
    if (isDragOver) {
      return `${base} bg-black text-white`;
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
        <ExcelPaper className="text-color-text-subtle" />
      ) : (
        <ExcelPaper className="text-color-primary" />
      )}

      <h5
        className={`text-2xl leading-[120%] font-bold ${
          isDragOver ? "text-white" : ""
        }`}
      >
        {title}
      </h5>

      <p
        className={`text-[16px] leading-6 font-medium ${
          isDragOver ? "text-white/90" : "text-color-text-subtle"
        }`}
      >
        {description}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onInputChange}
      />

      {file && (
        <div className="mt-2 flex w-full max-w-105 items-center justify-between rounded-l-sm bg-color-bg-alt p-4 text-left">
          <div className="flex items-center gap-2 overflow-hidden">
            <ExcelPaper size={32} className="text-color-primary" />

            <span className="truncate text-[16px] leading-6 font-medium text-white">
              {file.name}
            </span>
          </div>

          <button
            type="button"
            onClick={removeFile}
            className="ml-3 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded text-white hover:bg-white/5"
          >
            ✕
          </button>
        </div>
      )}

      {!file ? (
        !isDragOver && (
          <Button variant="secondary" text="Choose File" onClick={openPicker} />
        )
      ) : (
        <div className="mt-2 flex items-center gap-3">
          <Button
            variant="secondary"
            text="Replace file"
            onClick={openPicker}
          />
          <Button
            variant="primary"
            text="Upload Excel file"
            onClick={handleUpload}
            isLoading={isUploading}
            icon={ExcelIcon}
          />
        </div>
      )}
      {banner && (
        <div className="animate-slide-in animate-slide-out fixed right-4 bottom-4">
          <Banner
            bannerType={banner.bannerType}
            title={banner.title}
            description={banner.description}
            onCloseBanner={closeBanner}
          />
        </div>
      )}
    </div>
  );
};
