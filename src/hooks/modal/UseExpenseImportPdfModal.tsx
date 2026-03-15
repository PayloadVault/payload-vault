import {
  ImportPdfForm,
  type UploadProgress,
} from "../../components/modal/ImportPdfForm";
import { useModal } from "../../context/modal/ModalContext";

type UseExpenseImportPdfModalProps = {
  onSave: (
    files: File[],
    onProgress: (progress: UploadProgress) => void,
  ) => Promise<void>;
};

export const useExpenseImportPdfModal = ({
  onSave,
}: UseExpenseImportPdfModalProps) => {
  const { openModal, closeModal } = useModal();

  const openExpenseImportPdfModal = () => {
    openModal({
      title: "Expense Dokument importieren",
      children: <ImportPdfForm onCancel={closeModal} onSave={onSave} />,
    });
  };

  return {
    openExpenseImportPdfModal,
    closeModal,
  };
};
