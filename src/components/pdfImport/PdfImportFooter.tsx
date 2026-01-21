import { useAuth } from "../../context/AuthContext";
import { useImportPdfModal } from "../../hooks/modal/UseImportPdfModal";
import { usePdfs } from "../../hooks/usePdf/UsePdfs";
import { Button } from "../button/Button";
import { UploadIcon } from "../icons";

export const PdfImportFooter = () => {
  const { user } = useAuth();
  const { uploadPdf } = usePdfs({ userId: user?.id || "" });

  if(!user) return;

  const { openImportPdfModal, closeModal } = useImportPdfModal({
    onSave: async (files: File[]) => {
      if (!files || files.length === 0) {
        console.warn("No files selected");
        return;
      }

      try {
        await uploadPdf.mutateAsync({
          file: files[0],
          userId: user.id,
        });
        closeModal();
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Failed to upload PDF. Please try again.");
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
        text="Upload PDF"
      />
    </div>
  );
};
