import { Constants, type Database } from "../../types/supabase";

type ExpenseRecord = Database["public"]["Tables"]["expenses"]["Row"] & {
  signed_url?: string;
};

type NewExpense = Database["public"]["Tables"]["expenses"]["Insert"];
type ExpenseCategory = Database["public"]["Enums"]["expense_category"];

type ExtractedExpenseData = {
  amount: number;
  expense_date: string;
  category: ExpenseCategory;
  vendor_name: string | null;
  image_url: string | null;
  file_name: string | null;
};

type UploadExpenseResult = {
  expense: ExpenseRecord;
  extracted: ExtractedExpenseData;
};

const expenseCategories = Constants.public.Enums
  .expense_category as readonly ExpenseCategory[];

const DEFAULT_EXPENSE_CATEGORY: ExpenseCategory = "Sonstiges";

const expenseCategorySet = new Set<ExpenseCategory>(expenseCategories);

function isExpenseCategory(value: unknown): value is ExpenseCategory {
  return (
    typeof value === "string" &&
    expenseCategorySet.has(value as ExpenseCategory)
  );
}

export type SortType = "new" | "old" | "high" | "low";

type FetchExpensesProps = {
  userId: string;
  category?: ExpenseCategory | "all";
  year?: number;
  sortBy?: SortType;
  startMonth?: number;
  endMonth?: number;
};

type PendingExpenseUpload = {
  id: string;
  fileName: string;
  filePath: string;
  extractedData: ExtractedExpenseData;
};

export type {
  ExpenseCategory,
  ExpenseRecord,
  ExtractedExpenseData,
  FetchExpensesProps,
  NewExpense,
  PendingExpenseUpload,
  UploadExpenseResult,
};
export { DEFAULT_EXPENSE_CATEGORY, expenseCategories, isExpenseCategory };
