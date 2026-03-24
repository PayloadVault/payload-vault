import { ExpenseConfirmationForm } from "../../components/modal/ExpenseConfirmationForm";
import { useModal } from "../../context/modal/ModalContext";
import type { PendingExpenseUpload } from "../useExpenses/types";
import type { ModalSize } from "../../context/modal/types";

type UseExpenseConfirmUploadModalProps = {
  onConfirm: (upload: PendingExpenseUpload) => Promise<void>;
  onDecline: (upload: PendingExpenseUpload) => Promise<void>;
  onComplete: () => void;
};

export const useExpenseConfirmUploadModal = ({
  onConfirm,
  onDecline,
  onComplete,
}: UseExpenseConfirmUploadModalProps) => {
  const { openModal, closeModal, setDisableClose } = useModal();

  const openExpenseConfirmUploadModal = (
    pendingUploads: PendingExpenseUpload[],
  ) => {
    if (pendingUploads.length === 0) {
      onComplete();
      return;
    }

    const isSingleUpload = pendingUploads.length === 1;
    const title = isSingleUpload
      ? pendingUploads[0].fileName
      : `${pendingUploads.length} Dokumente bestätigen`;
    const size: ModalSize = isSingleUpload ? "default" : "large";

    const handleConfirmAll = async (uploads: PendingExpenseUpload[]) => {
      setDisableClose(true);
      try {
        for (const upload of uploads) {
          await onConfirm(upload);
        }
      } finally {
        setDisableClose(false);
      }
    };

    const handleDeclineAll = async (uploads: PendingExpenseUpload[]) => {
      setDisableClose(true);
      try {
        for (const upload of uploads) {
          await onDecline(upload);
        }
      } finally {
        setDisableClose(false);
      }
    };

    const handleConfirmSingle = async (upload: PendingExpenseUpload) => {
      setDisableClose(true);
      try {
        await onConfirm(upload);
      } finally {
        setDisableClose(false);
      }
    };

    const handleDeclineSingle = async (upload: PendingExpenseUpload) => {
      setDisableClose(true);
      try {
        await onDecline(upload);
      } finally {
        setDisableClose(false);
      }
    };

    const handleClose = () => {
      closeModal();
    };

    openModal({
      title,
      size,
      onClose: onComplete,
      children: (
        <ExpenseConfirmationForm
          pendingUploads={pendingUploads}
          onConfirm={handleConfirmSingle}
          onDecline={handleDeclineSingle}
          onConfirmAll={handleConfirmAll}
          onDeclineAll={handleDeclineAll}
          onClose={handleClose}
        />
      ),
    });
  };

  return {
    openExpenseConfirmUploadModal,
    closeModal,
  };
};
