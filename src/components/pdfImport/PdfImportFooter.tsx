import { useAuth } from "../../context/AuthContext";
import { useImportPdfModal } from "../../hooks/modal/UseImportPdfModal";
import { useConfirmUploadModal } from "../../hooks/modal/UseConfirmUploadModal";
import {
  usePdfs,
  ExtractionError,
  DuplicateFileError,
} from "../../hooks/usePdf/UsePdfs";
import { Button } from "../button/Button";
import { UploadIcon } from "../icons";
import { useBanner } from "../../context/banner/BannerContext";
import type { UploadProgress } from "../modal/ImportPdfForm";
import type { PendingUpload } from "../../hooks/usePdf/usePendingUpload";
import { useRef } from "react";

export const PdfImportFooter = () => {
  const { user } = useAuth();
  const { extractPdf, confirmPdf, declinePdf } = usePdfs({
    userId: user?.id || "",
  });
  const { showBanner } = useBanner();

  // Track stats for final banner
  const statsRef = useRef({ confirmed: 0, declined: 0 });

  if (!user) return;

  const showFinalBanner = () => {
    const { confirmed, declined } = statsRef.current;

    if (confirmed > 0 && declined === 0) {
      showBanner(
        "Upload abgeschlossen",
        confirmed === 1
          ? "Die PDF-Datei wurde erfolgreich hochgeladen."
          : `Alle ${confirmed} Dateien wurden erfolgreich hochgeladen.`,
        "success",
      );
    } else if (confirmed === 0 && declined > 0) {
      showBanner(
        "Uploads abgelehnt",
        declined === 1
          ? "Die PDF-Datei wurde abgelehnt."
          : `${declined} Dateien wurden abgelehnt.`,
        "error",
      );
    } else if (confirmed > 0 && declined > 0) {
      showBanner(
        "Upload teilweise abgeschlossen",
        `${confirmed} bestätigt, ${declined} abgelehnt.`,
        "success",
      );
    }

    // Reset stats
    statsRef.current = { confirmed: 0, declined: 0 };
  };

  const handleConfirmUpload = async (upload: PendingUpload) => {
    try {
      await confirmPdf.mutateAsync({
        userId: user.id,
        pendingUpload: upload,
      });
      statsRef.current.confirmed++;
    } catch (error) {
      console.error("Error confirming upload:", error);
      showBanner(
        "Fehler",
        `Bestätigung fehlgeschlagen: ${upload.fileName}`,
        "error",
      );
    }
  };

  const handleDeclineUpload = async (upload: PendingUpload) => {
    try {
      await declinePdf.mutateAsync(upload.filePath);
      statsRef.current.declined++;
    } catch (error) {
      console.error("Error declining upload:", error);
    }
  };

  const { openConfirmUploadModal } = useConfirmUploadModal({
    onConfirm: handleConfirmUpload,
    onDecline: handleDeclineUpload,
    onComplete: showFinalBanner,
  });

  const { openImportPdfModal, closeModal: closeImportModal } =
    useImportPdfModal({
      onSave: async (
        files: File[],
        onProgress: (progress: UploadProgress) => void,
      ) => {
        if (!files || files.length === 0) {
          console.warn("No files selected");
          return;
        }

        const pendingUploads: PendingUpload[] = [];
        let completedCount = 0;
        const failedFiles: {
          name: string;
          reason?: string;
          errorType: "duplicate" | "extraction" | "unknown";
        }[] = [];

        onProgress({
          completed: 0,
          total: files.length,
          inProgress: true,
        });

        // Process files in parallel
        const extractionPromises = files.map(async (file) => {
          try {
            const pendingUpload = await extractPdf.mutateAsync({
              file,
              userId: user.id,
            });
            pendingUploads.push(pendingUpload);
          } catch (error) {
            console.error(`Error extracting file ${file.name}:`, error);

            if (error instanceof DuplicateFileError) {
              failedFiles.push({
                name: file.name,
                reason: "Dieses Dokument wurde bereits hochgeladen.",
                errorType: "duplicate",
              });
            } else if (error instanceof ExtractionError) {
              failedFiles.push({
                name: file.name,
                reason: error.rejectionReason,
                errorType: "extraction",
              });
            } else {
              failedFiles.push({ name: file.name, errorType: "unknown" });
            }
          } finally {
            completedCount++;
            onProgress({
              completed: completedCount,
              total: files.length,
              inProgress: completedCount < files.length,
            });
          }
        });

        await Promise.all(extractionPromises);

        // Show errors for failed extractions
        failedFiles.forEach(({ name, reason, errorType }) => {
          if (reason) {
            const title =
              errorType === "duplicate"
                ? "Duplikat erkannt"
                : "Extraktion fehlgeschlagen";
            showBanner(title, `${name}: ${reason}`, "error");
          }
        });

        // Close import modal
        closeImportModal();

        // If we have pending uploads, open confirmation modal
        if (pendingUploads.length > 0) {
          // Small delay to allow import modal to close
          setTimeout(() => {
            openConfirmUploadModal(pendingUploads);
          }, 100);
        } else if (failedFiles.length > 0) {
          showBanner(
            "Extraktion fehlgeschlagen",
            `${failedFiles.length} Datei${failedFiles.length > 1 ? "en" : ""} konnten nicht verarbeitet werden.`,
            "error",
          );
        }
      },
    });

  return (
    <div
      className="
      fixed
      bottom-0
      left-0
      w-full
      p-4
      border-t
      border-color-border-light
      flex
      justify-center
      items-center
      bg-color-bg-main
      z-50
    "
    >
      <Button
        onClick={openImportPdfModal}
        icon={UploadIcon}
        text="Dokument hochladen"
      />
    </div>
  );
};
