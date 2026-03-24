import { useAuth } from "../../context/AuthContext";
import { useExpenseConfirmUploadModal } from "../../hooks/modal/UseExpenseConfirmUploadModal";
import {
  useUploadAndExtract,
  useConfirmAndUploadToDatabase,
  useDeclineExpenseUpload,
  DuplicateExpenseError,
  ExtractionExpenseError,
} from "../../hooks/useExpenses/useExpenses";
import type {
  PendingExpenseUpload,
  ConfirmProductPayload,
} from "../../hooks/useExpenses/types";
import { Button } from "../button/Button";
import { UploadIcon } from "../icons";
import { useBanner } from "../../context/banner/BannerContext";
import type { UploadProgress } from "../modal/ExpenseImportPdfForm";
import { useRef } from "react";
import { useExpenseImportPdfModal } from "../../hooks/modal/UseExpenseImportPdfModal";

export const ExpensePdfImportFooter = () => {
  const { user } = useAuth();
  const uploadAndExtract = useUploadAndExtract(user?.id || "");
  const confirmExpense = useConfirmAndUploadToDatabase();
  const declineExpense = useDeclineExpenseUpload();
  const { showBanner } = useBanner();

  const statsRef = useRef({ confirmed: 0, declined: 0 });

  const showFinalBanner = () => {
    const { confirmed, declined } = statsRef.current;

    if (confirmed > 0 && declined === 0) {
      showBanner(
        "Upload abgeschlossen",
        confirmed === 1
          ? "1 Produkt wurde erfolgreich gespeichert."
          : `${confirmed} Produkte wurden erfolgreich gespeichert.`,
        "success",
      );
    } else if (confirmed === 0 && declined > 0) {
      showBanner(
        "Alle abgelehnt",
        declined === 1
          ? "1 Produkt wurde abgelehnt."
          : `${declined} Produkte wurden abgelehnt.`,
        "error",
      );
    } else if (confirmed > 0 && declined > 0) {
      showBanner(
        "Upload teilweise abgeschlossen",
        `${confirmed} bestätigt, ${declined} abgelehnt.`,
        "success",
      );
    }

    statsRef.current = { confirmed: 0, declined: 0 };
  };

  const handleConfirmProduct = async (payload: ConfirmProductPayload) => {
    try {
      await confirmExpense.mutateAsync({
        user_id: user?.id || "",
        category: payload.product.category,
        amount: payload.product.amount,
        expense_date: payload.expense_date,
        vendor_name: payload.vendor_name,
        image_url: payload.image_url,
        file_name: payload.file_name,
      });
      statsRef.current.confirmed++;
    } catch (error) {
      console.error("Error confirming product:", error);
      showBanner(
        "Fehler",
        `Bestätigung fehlgeschlagen: ${payload.product.product_name}`,
        "error",
      );
    }
  };

  const handleDeclineProduct = () => {
    statsRef.current.declined++;
  };

  const handleDeclineReceipt = async (filePath: string) => {
    try {
      await declineExpense.mutateAsync(filePath);
    } catch (error) {
      console.error("Error cleaning up receipt:", error);
    }
  };

  const { openExpenseConfirmUploadModal } = useExpenseConfirmUploadModal({
    onConfirmProduct: handleConfirmProduct,
    onDeclineProduct: handleDeclineProduct,
    onDeclineReceipt: handleDeclineReceipt,
    onComplete: showFinalBanner,
  });

  const { openExpenseImportPdfModal, closeModal: closeImportModal } =
    useExpenseImportPdfModal({
      onSave: async (
        files: File[],
        onProgress: (progress: UploadProgress) => void,
      ) => {
        if (!files || files.length === 0) {
          console.warn("No files selected");
          return;
        }

        const pendingUploads: PendingExpenseUpload[] = [];
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

        const extractionPromises = files.map(async (file) => {
          try {
            const pendingUpload = await uploadAndExtract.mutateAsync(file);
            pendingUploads.push(pendingUpload);
          } catch (error) {
            console.error(`Error extracting file ${file.name}:`, error);

            if (error instanceof DuplicateExpenseError) {
              failedFiles.push({
                name: file.name,
                reason: "Dieses Dokument wurde bereits hochgeladen.",
                errorType: "duplicate",
              });
            } else if (error instanceof ExtractionExpenseError) {
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

        failedFiles.forEach(({ name, reason, errorType }) => {
          if (reason) {
            const title =
              errorType === "duplicate"
                ? "Duplikat erkannt"
                : "Extraktion fehlgeschlagen";
            showBanner(title, `${name}: ${reason}`, "error");
          }
        });

        closeImportModal();

        if (pendingUploads.length > 0) {
          setTimeout(() => {
            openExpenseConfirmUploadModal(pendingUploads);
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

  if (!user) return null;

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
        onClick={openExpenseImportPdfModal}
        icon={UploadIcon}
        text="Dokument hochladen"
      />
    </div>
  );
};
