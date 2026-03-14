import { Constants, type Database } from "../../types/supabase";

type ExpenseRecord = Database["public"]["Tables"]["expenses"]["Row"] & {
    signed_url?: string;
};

type NewExpense = Database["public"]["Tables"]["expenses"]["Insert"];
type ExpenseCategory = Database["public"]["Enums"]["expense_category"];

const expenseCategories =
    Constants.public.Enums.expense_category as readonly ExpenseCategory[];

const DEFAULT_EXPENSE_CATEGORY: ExpenseCategory = "Sonstiges";

const expenseCategorySet = new Set<ExpenseCategory>(expenseCategories);

function isExpenseCategory(value: unknown): value is ExpenseCategory {
    return (
        typeof value === "string" &&
        expenseCategorySet.has(value as ExpenseCategory)
    );
}

type FetchExpensesProps = {
    userId: string;
    category?: ExpenseCategory | "all";
    year?: number;
    startMonth?: number;
    endMonth?: number;
};

export type { ExpenseCategory, ExpenseRecord, FetchExpensesProps, NewExpense };
export {
    DEFAULT_EXPENSE_CATEGORY,
    expenseCategories,
    isExpenseCategory,
};
