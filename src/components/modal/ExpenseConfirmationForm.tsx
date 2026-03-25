import { useState, useRef, useEffect } from "react";
import { Button } from "../button/Button";
import { Dropdown } from "../dropdown/Dropdown";
import { InputField } from "../inputField/InputField";
import type { Option } from "../dropdown/Dropdown.types";
import type {
  PendingExpenseUpload,
  ConfirmProductPayload,
  ExpenseCategory,
} from "../../hooks/useExpenses/types";
import {
  expenseCategories,
  DEFAULT_EXPENSE_CATEGORY,
} from "../../hooks/useExpenses/types";

const EXPENSE_CATEGORY_OPTIONS: Option[] = expenseCategories.map((cat) => ({
  id: cat,
  label: cat,
}));

interface ExpenseConfirmationFormProps {
  pendingUploads: PendingExpenseUpload[];
  onConfirmProduct: (payload: ConfirmProductPayload) => Promise<void>;
  onDeclineProduct: () => void;
  onDeclineReceipt: (filePath: string) => Promise<void>;
  onClose: () => void;
}

type EditableProduct = {
  id: string;
  product_name: string;
  amount: string;
  category: ExpenseCategory;
};

type ReceiptState = {
  id: string;
  fileName: string;
  filePath: string;
  expense_date: string;
  vendor_name: string;
  image_url: string;
  file_name: string;
  products: EditableProduct[];
  confirmedAny: boolean;
};

export const ExpenseConfirmationForm = ({
  pendingUploads,
  onConfirmProduct,
  onDeclineProduct,
  onDeclineReceipt,
  onClose,
}: ExpenseConfirmationFormProps) => {
  const [receipts, setReceipts] = useState<ReceiptState[]>(() =>
    pendingUploads.map((u) => ({
      id: u.id,
      fileName: u.fileName,
      filePath: u.filePath,
      expense_date: u.expense_date,
      vendor_name: u.vendor_name,
      image_url: u.image_url,
      file_name: u.file_name,
      confirmedAny: false,
      products: u.products.map((p) => ({
        id: p.id,
        product_name: p.product_name,
        amount: String(p.amount),
        category: p.category,
      })),
    })),
  );

  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const receiptsRef = useRef(receipts);
  receiptsRef.current = receipts;

  const hasReceipts = receipts.length > 0;

  // Auto-close when all receipts are done
  useEffect(() => {
    if (!hasReceipts) {
      onClose();
    }
  }, [hasReceipts, onClose]);

  // Cleanup on unmount (e.g. user clicks X) — delete images for fully-declined receipts
  useEffect(() => {
    return () => {
      receiptsRef.current.forEach((receipt) => {
        if (receipt.products.length > 0 && !receipt.confirmedAny) {
          onDeclineReceipt(receipt.filePath).catch(console.error);
        }
      });
    };
  }, [onDeclineReceipt]);

  if (!hasReceipts) return null;

  // --- Receipt-level field updates ---
  const updateReceiptField = (
    id: string,
    field: "expense_date" | "vendor_name",
    value: string,
  ) => {
    setReceipts((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  };

  // --- Product-level field updates ---
  const updateProductField = (
    receiptId: string,
    productId: string,
    field: keyof EditableProduct,
    value: string,
  ) => {
    setReceipts((prev) =>
      prev.map((r) =>
        r.id === receiptId
          ? {
              ...r,
              products: r.products.map((p) =>
                p.id === productId ? { ...p, [field]: value } : p,
              ),
            }
          : r,
      ),
    );
  };

  // --- Add new product to a receipt ---
  const addProduct = (receiptId: string) => {
    setReceipts((prev) =>
      prev.map((r) =>
        r.id === receiptId
          ? {
              ...r,
              products: [
                ...r.products,
                {
                  id: crypto.randomUUID(),
                  product_name: "",
                  amount: "0",
                  category: DEFAULT_EXPENSE_CATEGORY,
                },
              ],
            }
          : r,
      ),
    );
  };

  // --- Build payload for a single product confirmation ---
  const buildPayload = (
    receipt: ReceiptState,
    product: EditableProduct,
    productIndex: number,
  ): ConfirmProductPayload => {
    const totalProducts = receipt.products.length;
    const fileName =
      totalProducts > 1
        ? `${receipt.file_name}__p${productIndex + 1}`
        : receipt.file_name;

    return {
      product: {
        id: product.id,
        product_name: product.product_name,
        amount: parseFloat(product.amount) || 0,
        category: product.category,
      },
      expense_date: receipt.expense_date,
      vendor_name: receipt.vendor_name,
      image_url: receipt.image_url,
      file_name: fileName,
    };
  };

  // --- Confirm single product ---
  const handleConfirm = async (
    receipt: ReceiptState,
    product: EditableProduct,
  ) => {
    setProcessingIds((prev) => new Set(prev).add(product.id));
    try {
      const productIndex = receipt.products.findIndex(
        (p) => p.id === product.id,
      );
      await onConfirmProduct(buildPayload(receipt, product, productIndex));
      setReceipts((prev) => {
        const updated = prev.map((r) => {
          if (r.id !== receipt.id) return r;
          const remaining = r.products.filter((p) => p.id !== product.id);
          return { ...r, products: remaining, confirmedAny: true };
        });
        return updated.filter((r) => r.products.length > 0);
      });
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  };

  // --- Decline single product ---
  const handleDecline = (receiptId: string, productId: string) => {
    onDeclineProduct();
    const receipt = receipts.find((r) => r.id === receiptId);
    if (!receipt) return;

    const remaining = receipt.products.filter((p) => p.id !== productId);

    if (remaining.length === 0 && !receipt.confirmedAny) {
      onDeclineReceipt(receipt.filePath).catch(console.error);
    }

    if (remaining.length === 0) {
      setReceipts((prev) => prev.filter((r) => r.id !== receiptId));
    } else {
      setReceipts((prev) =>
        prev.map((r) =>
          r.id === receiptId ? { ...r, products: remaining } : r,
        ),
      );
    }
  };

  // --- Confirm all products of a receipt ---
  const handleConfirmAll = async (receipt: ReceiptState) => {
    setIsProcessingAll(true);
    try {
      for (let i = 0; i < receipt.products.length; i++) {
        await onConfirmProduct(buildPayload(receipt, receipt.products[i], i));
      }
      setReceipts((prev) => prev.filter((r) => r.id !== receipt.id));
    } finally {
      setIsProcessingAll(false);
    }
  };

  // --- Decline all products of a receipt ---
  const handleDeclineAll = (receipt: ReceiptState) => {
    receipt.products.forEach(() => onDeclineProduct());
    if (!receipt.confirmedAny) {
      onDeclineReceipt(receipt.filePath).catch(console.error);
    }
    setReceipts((prev) => prev.filter((r) => r.id !== receipt.id));
  };

  const getCategoryOption = (category: ExpenseCategory): Option | null =>
    EXPENSE_CATEGORY_OPTIONS.find((opt) => opt.id === category) || null;

  return (
    <div className="flex flex-col gap-6 max-h-[70vh] overflow-y-auto pr-1">
      {receipts.map((receipt) => (
        <div
          key={receipt.id}
          className="flex flex-col gap-4 rounded-lg bg-color-bg-dark p-4"
        >
          {/* Receipt header */}
          <h3 className="font-semibold text-color-text-main truncate">
            {receipt.fileName}
          </h3>

          {/* Receipt-level fields: vendor & date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              label="Anbieter"
              type="text"
              placeholder="z.B. REWE, Shell"
              value={receipt.vendor_name}
              onChange={(val) =>
                updateReceiptField(receipt.id, "vendor_name", val)
              }
            />
            <div className="flex flex-col gap-1">
              <label className="flex h-6 items-center font-semibold text-color-text-secondary">
                <span className="ml-1 text-[14px]">Datum</span>
              </label>
              <input
                type="date"
                value={receipt.expense_date}
                onChange={(e) =>
                  updateReceiptField(receipt.id, "expense_date", e.target.value)
                }
                className="w-full rounded-radius-md border border-color-border-light bg-color-bg-main px-4 py-3 text-color-text-main transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-color-bg-accent"
              />
            </div>
          </div>

          <div className="border-t border-color-border-light" />

          {/* Products header */}
          <span className="text-sm font-semibold text-color-text-secondary">
            Produkte ({receipt.products.length})
          </span>

          {/* Product rows */}
          {receipt.products.map((product) => {
            const isProcessing =
              processingIds.has(product.id) || isProcessingAll;

            return (
              <div
                key={product.id}
                className="flex flex-col gap-3 rounded-md bg-color-bg-main p-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <InputField
                    label="Produkt"
                    type="text"
                    placeholder="Produktname"
                    value={product.product_name}
                    onChange={(val) =>
                      updateProductField(
                        receipt.id,
                        product.id,
                        "product_name",
                        val,
                      )
                    }
                  />
                  <InputField
                    label="Betrag (€)"
                    type="number"
                    placeholder="0.00"
                    value={product.amount}
                    onChange={(val) =>
                      updateProductField(receipt.id, product.id, "amount", val)
                    }
                  />
                  <Dropdown
                    label="Kategorie"
                    options={EXPENSE_CATEGORY_OPTIONS}
                    value={getCategoryOption(product.category)}
                    onSelect={(opt) =>
                      updateProductField(
                        receipt.id,
                        product.id,
                        "category",
                        opt.id as string,
                      )
                    }
                    placeholder="Kategorie"
                  />
                </div>

                {/* Per-product action buttons */}
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => handleConfirm(receipt, product)}
                    disabled={isProcessing}
                    className="rounded-md px-3 py-1.5 text-sm font-medium bg-color-success-border text-white hover:bg-color-success-border/80 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 active:scale-95"
                  >
                    ✓ Bestätigen
                  </button>
                  <button
                    onClick={() => handleDecline(receipt.id, product.id)}
                    disabled={isProcessing}
                    className="rounded-md px-3 py-1.5 text-sm font-medium bg-color-error-border text-white hover:bg-color-error-border/80 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 active:scale-95"
                  >
                    ✕ Ablehnen
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add product button */}
          <button
            onClick={() => addProduct(receipt.id)}
            disabled={isProcessingAll}
            className="flex items-center gap-2 rounded-md border border-dashed border-color-border-light px-3 py-2 text-sm text-color-text-secondary hover:bg-color-bg-main/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:border-color-primary/50"
          >
            <span className="text-lg leading-none">+</span>
            <span>Produkt hinzufügen</span>
          </button>

          {/* Bulk actions (only if more than 1 product) */}
          {receipt.products.length > 1 && (
            <div className="flex flex-wrap gap-3 pt-2 border-t border-color-border-light">
              <Button
                variant="primary"
                text={`Alle ${receipt.products.length} bestätigen`}
                onClick={() => handleConfirmAll(receipt)}
                isDisabled={isProcessingAll}
              />
              <Button
                variant="secondary"
                text="Alle ablehnen"
                onClick={() => handleDeclineAll(receipt)}
                isDisabled={isProcessingAll}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
