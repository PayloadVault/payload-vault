import { useState, useEffect, useRef } from "react";
import { Button } from "../button/Button";
import { Dropdown } from "../dropdown/Dropdown";
import { InputField } from "../inputField/InputField";
import type { Option } from "../dropdown/Dropdown.types";
import type {
  PendingExpenseUpload,
  ExpenseCategory,
} from "../../hooks/useExpenses/types";
import { expenseCategories } from "../../hooks/useExpenses/types";

const EXPENSE_CATEGORY_OPTIONS: Option[] = expenseCategories.map((cat) => ({
  id: cat,
  label: cat,
}));

interface ExpenseConfirmationFormProps {
  pendingUploads: PendingExpenseUpload[];
  onConfirm: (upload: PendingExpenseUpload) => Promise<void>;
  onDecline: (upload: PendingExpenseUpload) => Promise<void>;
  onConfirmAll: (uploads: PendingExpenseUpload[]) => Promise<void>;
  onDeclineAll: (uploads: PendingExpenseUpload[]) => Promise<void>;
  onClose: () => void;
}

type EditableExpenseData = {
  category: ExpenseCategory;
  amount: string;
  expense_date: string;
  vendor_name: string;
};

export const ExpenseConfirmationForm = ({
  pendingUploads: initialUploads,
  onConfirm,
  onDecline,
  onConfirmAll,
  onDeclineAll,
  onClose,
}: ExpenseConfirmationFormProps) => {
  const [pendingUploads, setPendingUploads] =
    useState<PendingExpenseUpload[]>(initialUploads);
  const [editedData, setEditedData] = useState<
    Record<string, EditableExpenseData>
  >(() => {
    const initial: Record<string, EditableExpenseData> = {};
    initialUploads.forEach((upload) => {
      initial[upload.id] = {
        category: upload.extractedData.category,
        amount: String(upload.extractedData.amount),
        expense_date: upload.extractedData.expense_date,
        vendor_name: upload.extractedData.vendor_name ?? "",
      };
    });
    return initial;
  });
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [isProcessingAll, setIsProcessingAll] = useState(false);

  const pendingUploadsRef = useRef<PendingExpenseUpload[]>(pendingUploads);
  pendingUploadsRef.current = pendingUploads;

  const isSingleUpload = pendingUploads.length === 1;
  const hasUploads = pendingUploads.length > 0;

  const updateField = (
    id: string,
    field: keyof EditableExpenseData,
    value: string,
  ) => {
    setEditedData((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const getUploadWithEditedData = (
    upload: PendingExpenseUpload,
  ): PendingExpenseUpload => {
    const edited = editedData[upload.id];
    return {
      ...upload,
      extractedData: {
        ...upload.extractedData,
        category: edited.category,
        amount: parseFloat(edited.amount) || 0,
        expense_date: edited.expense_date,
        vendor_name: edited.vendor_name || null,
      },
    };
  };

  const handleConfirm = async (upload: PendingExpenseUpload) => {
    setProcessingIds((prev) => new Set(prev).add(upload.id));
    try {
      await onConfirm(getUploadWithEditedData(upload));
      setPendingUploads((prev) => prev.filter((u) => u.id !== upload.id));
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(upload.id);
        return next;
      });
    }
  };

  const handleDecline = async (upload: PendingExpenseUpload) => {
    setProcessingIds((prev) => new Set(prev).add(upload.id));
    try {
      await onDecline(upload);
      setPendingUploads((prev) => prev.filter((u) => u.id !== upload.id));
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(upload.id);
        return next;
      });
    }
  };

  const handleConfirmAll = async () => {
    setIsProcessingAll(true);
    try {
      const uploadsWithEdits = pendingUploads.map(getUploadWithEditedData);
      await onConfirmAll(uploadsWithEdits);
      setPendingUploads([]);
    } finally {
      setIsProcessingAll(false);
    }
  };

  const handleDeclineAll = async () => {
    setIsProcessingAll(true);
    try {
      await onDeclineAll(pendingUploads);
      setPendingUploads([]);
    } finally {
      setIsProcessingAll(false);
    }
  };

  useEffect(() => {
    if (!hasUploads) {
      onClose();
    }
  }, [hasUploads, onClose]);

  // Cleanup: decline any remaining uploads when modal is closed
  useEffect(() => {
    return () => {
      const remaining = pendingUploadsRef.current;
      if (remaining.length > 0) {
        onDeclineAll(remaining).catch(console.error);
      }
    };
  }, [onDeclineAll]);

  if (!hasUploads) {
    return null;
  }

  const getCategoryOption = (category: ExpenseCategory): Option | null => {
    return EXPENSE_CATEGORY_OPTIONS.find((opt) => opt.id === category) || null;
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Multiple uploads: bulk actions */}
      {!isSingleUpload && (
        <div className="flex flex-wrap items-center gap-3 border-b border-color-border-light pb-4">
          <Button
            variant="primary"
            text={`Alle ${pendingUploads.length} bestätigen`}
            onClick={handleConfirmAll}
            isDisabled={isProcessingAll}
          />
          <Button
            variant="secondary"
            text="Alle ablehnen"
            onClick={handleDeclineAll}
            isDisabled={isProcessingAll}
          />
        </div>
      )}

      {/* Upload items */}
      <div
        className={`flex flex-col gap-6 ${!isSingleUpload ? "max-h-[60vh] overflow-y-auto pr-2" : ""}`}
      >
        {pendingUploads.map((upload) => {
          const isProcessing = processingIds.has(upload.id) || isProcessingAll;
          const edited = editedData[upload.id];

          return (
            <div
              key={upload.id}
              className="flex flex-col gap-4 rounded-lg bg-color-bg-dark p-4"
            >
              {/* File name as title (only for multiple uploads) */}
              {!isSingleUpload && (
                <h3 className="font-semibold text-color-text-main truncate">
                  {upload.fileName}
                </h3>
              )}

              {/* Category dropdown */}
              <Dropdown
                label="Kategorie"
                options={EXPENSE_CATEGORY_OPTIONS}
                value={getCategoryOption(edited.category)}
                onSelect={(opt) =>
                  updateField(
                    upload.id,
                    "category",
                    opt.id as ExpenseCategory,
                  )
                }
                placeholder="Kategorie wählen"
              />

              {/* Amount input */}
              <InputField
                label="Betrag (€)"
                type="number"
                placeholder="0.00"
                value={edited.amount}
                onChange={(val) => updateField(upload.id, "amount", val)}
              />

              {/* Vendor input */}
              <InputField
                label="Anbieter"
                type="text"
                placeholder="z.B. Amazon, Deutsche Bahn"
                value={edited.vendor_name}
                onChange={(val) => updateField(upload.id, "vendor_name", val)}
              />

              {/* Date input */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor={`date-${upload.id}`}
                  className="flex h-6 items-center font-semibold text-color-text-secondary"
                >
                  <span className="ml-1 text-[14px]">Datum</span>
                </label>
                <input
                  id={`date-${upload.id}`}
                  type="date"
                  value={edited.expense_date}
                  onChange={(e) =>
                    updateField(upload.id, "expense_date", e.target.value)
                  }
                  className="w-full rounded-radius-md border border-color-border-light bg-main-color-bg-main px-4 py-3 text-color-text-main focus:outline-none focus:ring-2 focus:ring-color-bg-accent scheme-dark"
                />
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  variant="primary"
                  text="Bestätigen"
                  onClick={() => handleConfirm(upload)}
                  isDisabled={isProcessing}
                />
                <Button
                  variant="secondary"
                  text="Ablehnen"
                  onClick={() => handleDecline(upload)}
                  isDisabled={isProcessing}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
