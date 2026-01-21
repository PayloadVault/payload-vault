import { ImportPdfForm } from "../../components/modal/ImportPdfForm";
import { useModal } from "../../context/modal/ModalContext";

type UseImportPdfModalProps = {
  onSave: (files: File[]) => Promise<void>;
};

export const useImportPdfModal = ({ onSave }: UseImportPdfModalProps) => {
  const { openModal, closeModal } = useModal();

  const openImportPdfModal = () => {
    openModal({
      title: "Import PDF",
      children: <ImportPdfForm onCancel={closeModal} onSave={onSave} />,
    });
  };

  return {
    openImportPdfModal,
    closeModal,
  };
};
