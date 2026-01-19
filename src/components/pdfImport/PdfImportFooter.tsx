import { useImportPdfModal } from "../../hooks/modal/UseImportPdfModal";
import { Button } from "../button/Button";
import { UploadIcon } from "../icons";

export const PdfImportFooter = () => {
  const { openImportPdfModal, closeModal } = useImportPdfModal({
    onSave: async (filePath: string) => {
      console.log("Importing PDF from:", filePath);
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
