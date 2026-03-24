import { ExpenseConfirmationForm } from "../../components/modal/ExpenseConfirmationForm";
import { useModal } from "../../context/modal/ModalContext";
import type {
  PendingExpenseUpload,
  ConfirmProductPayload,
} from "../useExpenses/types";

type UseExpenseConfirmUploadModalProps = {
  onConfirmProduct: (payload: ConfirmProductPayload) => Promise<void>;
  onDeclineProduct: () => void;
  onDeclineReceipt: (filePath: string) => Promise<void>;
  onComplete: () => void;
};

export const useExpenseConfirmUploadModal = ({
  onConfirmProduct,
  onDeclineProduct,
  onDeclineReceipt,
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

    const totalProducts = pendingUploads.reduce(
      (sum, u) => sum + u.products.length,
      0,
    );
    const title =
      pendingUploads.length === 1
        ? pendingUploads[0].fileName
        : `${pendingUploads.length} Belege · ${totalProducts} Produkte`;

    openModal({
      title,
      size: "large",
      onClose: onComplete,
      children: (
        <ExpenseConfirmationForm
          pendingUploads={pendingUploads}
          onConfirmProduct={async (payload) => {
            setDisableClose(true);
            try {
              await onConfirmProduct(payload);
            } finally {
              setDisableClose(false);
            }
          }}
          onDeclineProduct={onDeclineProduct}
          onDeclineReceipt={onDeclineReceipt}
          onClose={closeModal}
        />
      ),
    });
  };

  return {
    openExpenseConfirmUploadModal,
    closeModal,
  };
};
