import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEventHandler,
  type ChangeEventHandler,
} from "react";
import { CameraIcon, ExcelPaper } from "../icons";
import type { UploadCardProps } from "./UploadfileCard.types";
import { Button } from "../button/Button";
import { useBanner } from "../../context/banner/BannerContext";

const MAX_FILE_SIZE_KB = 5000;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_KB * 1024;

const ACCEPTED_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
];
const ACCEPTED_PDF_EXTENSIONS = [".pdf"];

function buildAcceptedExtensions(accept: string): string[] {
  const parts = accept.split(",").map((s) => s.trim().toLowerCase());
  const extensions: string[] = [];
  for (const part of parts) {
    if (part.startsWith(".")) {
      extensions.push(part);
    } else if (part === "image/*") {
      extensions.push(...ACCEPTED_IMAGE_EXTENSIONS);
    } else if (part === "application/pdf") {
      extensions.push(...ACCEPTED_PDF_EXTENSIONS);
    }
  }
  return extensions.length > 0 ? extensions : ACCEPTED_PDF_EXTENSIONS;
}

export const FileUploadCard = ({
  description,
  accept = ".pdf",
  files,
  setFiles,
  disabled,
  maxFiles = 10,
}: UploadCardProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const { showBanner } = useBanner();

  const [isDragOver, setIsDragOver] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isOpeningCamera, setIsOpeningCamera] = useState(false);

  const acceptedExtensions = useMemo(
    () => buildAcceptedExtensions(accept),
    [accept],
  );
  const canUseCamera = useMemo(
    () => accept.toLowerCase().includes("image/"),
    [accept],
  );

  const openPicker = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const stopCameraStream = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  };

  const closeCameraCapture = () => {
    stopCameraStream();
    setIsCameraOpen(false);
  };

  const openCameraCapture = async () => {
    if (disabled || !canUseCamera) return;

    if (!navigator?.mediaDevices?.getUserMedia) {
      showBanner(
        "Kamera nicht verfügbar",
        "Ihr Browser unterstützt keinen direkten Kamerazugriff.",
        "error",
      );
      return;
    }

    try {
      setIsOpeningCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      mediaStreamRef.current = stream;
      setIsCameraOpen(true);

      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 0);
    } catch {
      showBanner(
        "Kamera konnte nicht gestartet werden",
        "Bitte erlauben Sie den Kamerazugriff in Ihrem Browser.",
        "error",
      );
      stopCameraStream();
    } finally {
      setIsOpeningCamera(false);
    }
  };

  const isAcceptedFile = (f: File) => {
    const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
    return acceptedExtensions.includes(ext);
  };
  const isValidSize = (f: File) => f.size <= MAX_FILE_SIZE_BYTES;

  const addFiles = (incoming: File[]) => {
    const validFiles: File[] = [];
    const invalidFormatFiles: string[] = [];
    const oversizedFiles: string[] = [];

    incoming.forEach((file) => {
      if (!isAcceptedFile(file)) {
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
      const allowed = acceptedExtensions.join(", ");
      showBanner(
        "Ungültiges Dateiformat",
        `Erlaubte Formate: ${allowed}. Entfernt: ${invalidFormatFiles.join(", ")}`,
        "error",
      );
    }

    if (oversizedFiles.length) {
      showBanner(
        "Datei zu groß",
        `Dateien müssen kleiner als ${MAX_FILE_SIZE_KB} KB sein. Entfernt: ${oversizedFiles.join(", ")}`,
        "error",
      );
    }

    if (validFiles.length) {
      setFiles((prev) => {
        const remainingSlots = Math.max(0, maxFiles - prev.length);

        if (remainingSlots === 0) {
          showBanner(
            "Limit erreicht",
            `Maximal ${maxFiles} Dateien sind erlaubt.`,
            "error",
          );
          return prev;
        }

        if (validFiles.length > remainingSlots) {
          showBanner(
            "Limit erreicht",
            `Es werden nur ${remainingSlots} weitere Datei${remainingSlots === 1 ? "" : "en"} hinzugefügt (max. ${maxFiles}).`,
            "error",
          );
        }

        return [...prev, ...validFiles.slice(0, remainingSlots)];
      });
    }
  };

  const onInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    if (selectedFiles.length) addFiles(selectedFiles);
    e.currentTarget.value = "";
  };

  const captureFromCamera = async () => {
    if (!videoRef.current) return;

    const remainingSlots = Math.max(0, maxFiles - files.length);
    if (remainingSlots === 0) {
      showBanner(
        "Limit erreicht",
        `Maximal ${maxFiles} Dateien sind erlaubt.`,
        "error",
      );
      return;
    }

    const video = videoRef.current;
    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      showBanner(
        "Aufnahme fehlgeschlagen",
        "Kamerabild ist noch nicht bereit. Bitte erneut versuchen.",
        "error",
      );
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(video, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92),
    );

    if (!blob) {
      showBanner(
        "Aufnahme fehlgeschlagen",
        "Bild konnte nicht erzeugt werden.",
        "error",
      );
      return;
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const cameraFile = new File([blob], `kamera-beleg-${timestamp}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });

    addFiles([cameraFile]);
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

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

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

      <p className="text-sm text-color-text-subtle pointer-events-none">
        Ausgewählt: {files.length}/{maxFiles}
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
                  disabled={disabled}
                  className={`ml-3 h-10 w-10 rounded text-color-text-secondary transition-colors ${
                    disabled
                      ? "cursor-not-allowed opacity-50"
                      : "hover:bg-color-primary/10"
                  }`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isDragOver && (
        <div className="flex flex-col items-center gap-2">
          <Button
            variant="secondary"
            text="Dateien auswählen"
            onClick={openPicker}
            isDisabled={disabled}
          />

          {canUseCamera && (
            <button
              type="button"
              onClick={openCameraCapture}
              disabled={disabled}
              className={`inline-flex items-center gap-2 text-sm transition-colors ${
                disabled
                  ? "cursor-not-allowed text-color-text-subtle/50"
                  : "text-color-text-subtle hover:text-color-text-secondary"
              }`}
            >
              <CameraIcon size={16} />
              {isOpeningCamera
                ? "Kamera wird geöffnet..."
                : "Beleg mit Kamera erfassen"}
            </button>
          )}
        </div>
      )}

      {isCameraOpen && (
        <div
          className="fixed inset-0 z-120 flex items-center justify-center bg-black/80 p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Kameraaufnahme"
        >
          <div className="w-full max-w-xl rounded-xl border border-color-border-light bg-color-bg-main p-4 animate-scale-in">
            <p className="mb-3 text-base font-semibold text-color-text-secondary">
              Kameraaufnahme
            </p>

            <div className="overflow-hidden rounded-lg bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="h-80 w-full object-cover"
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                text="Foto aufnehmen"
                onClick={captureFromCamera}
                isDisabled={disabled || files.length >= maxFiles}
              />
              <Button
                variant="secondary"
                text="Fertig"
                onClick={closeCameraCapture}
                isDisabled={disabled}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
