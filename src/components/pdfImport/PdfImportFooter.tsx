import { useAuth } from "../../context/AuthContext";
import { useImportPdfModal } from "../../hooks/modal/UseImportPdfModal";
import { usePdfs } from "../../hooks/usePdf/UsePdfs";
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

      let successCount = 0;
      let failedCount = 0;
      const failedFiles: string[] = [];

      // Process files sequentially to avoid overwhelming the AI API
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        onProgress({
          current: i + 1,
          total: files.length,
          currentFileName: file.name,
        });

        try {
          await uploadPdf.mutateAsync({
            file,
            userId: user.id,
          });
          successCount++;
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error);
          failedCount++;
          failedFiles.push(file.name);
        }
      }

      if (failedCount === 0) {
        showBanner(
          "Upload Complete",
          successCount === 1
            ? "The PDF has been successfully uploaded."
            : `All ${successCount} PDFs have been successfully uploaded.`,
          "success",
        );
      } else if (successCount === 0) {
        showBanner(
          "Upload Failed",
          `Failed to upload ${failedCount} file${failedCount > 1 ? "s" : ""}.`,
          "error",
        );
      } else {
        showBanner(
          "Partial Upload",
          `${successCount} uploaded successfully, ${failedCount} failed.`,
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
        text="Upload PDF"
      />
    </div>
  );
};
