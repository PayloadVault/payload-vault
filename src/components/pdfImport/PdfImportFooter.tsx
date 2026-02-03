import { useAuth } from "../../context/AuthContext";
import { useImportPdfModal } from "../../hooks/modal/UseImportPdfModal";
import { usePdfs, ExtractionError } from "../../hooks/usePdf/UsePdfs";
import { Button } from "../button/Button";
import { UploadIcon } from "../icons";
import { useBanner } from "../../context/banner/BannerContext";
import type { UploadProgress } from "../modal/ImportPdfForm";

export const PdfImportFooter = () => {
  const { user } = useAuth();
  const { uploadPdf } = usePdfs({ userId: user?.id || "" });

  const { showBanner } = useBanner();

  if (!user) return;

  const { openImportPdfModal, closeModal } = useImportPdfModal({
    onSave: async (
      files: File[],
      onProgress: (progress: UploadProgress) => void,
    ) => {
      if (!files || files.length === 0) {
        console.warn("No files selected");
        return;
      }

      let completedCount = 0;
      let successCount = 0;
      let failedCount = 0;
      const failedFiles: { name: string; reason?: string }[] = [];

      onProgress({
        completed: 0,
        total: files.length,
        inProgress: true,
      });

      const uploadPromises = files.map(async (file) => {
        try {
          await uploadPdf.mutateAsync({
            file,
            userId: user.id,
          });
          successCount++;
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          failedCount++;

          if (error instanceof ExtractionError) {
            failedFiles.push({
              name: file.name,
              reason: error.rejectionReason,
            });
          } else {
            failedFiles.push({ name: file.name });
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

      await Promise.all(uploadPromises);

      failedFiles.forEach(({ name, reason }) => {
        if (reason) {
          showBanner(
            "Extraktion fehlgeschlagen",
            `${name}: ${reason}`,
            "error",
          );
        }
      });

      if (failedCount === 0) {
        showBanner(
          "Upload abgeschlossen",
          successCount === 1
            ? "Die PDF-Datei wurde erfolgreich hochgeladen."
            : `Alle ${successCount} Dateien wurden erfolgreich hochgeladen.`,
          "success",
        );
      } else if (successCount === 0) {
        showBanner(
          "Upload fehlgeschlagen",
          `${failedCount} Datei${failedCount > 1 ? "en" : ""} konnten nicht hochgeladen werden.`,
          "error",
        );
      } else {
        showBanner(
          "Teilweiser Upload",
          `${successCount} erfolgreich hochgeladen, ${failedCount} fehlgeschlagen.`,
          "error",
        );
      }

      closeModal();
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
