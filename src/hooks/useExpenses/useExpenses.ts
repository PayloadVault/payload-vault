import type { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import { DEFAULT_EXPENSE_CATEGORY, isExpenseCategory } from "./types";
import type {
    ExpenseCategory,
    ExpenseRecord,
    FetchExpensesProps,
    NewExpense,
} from "./types";

type UploadExpenseVariables = {
    file: File;
    userId: string;
    category?: ExpenseCategory;
    vendorName?: string;
};

type ExtractionResponse = {
    success: boolean;
    amount?: number;
    currency?: string;
    expense_date?: string;
    category?: ExpenseCategory;
    vendor_name?: string;
    error?: string;
};

const MOCK_EXPENSE_DATE = "2026-03-12"; // 12.3.2026.
const MOCK_EXPENSE_AMOUNT = 123.45;
const MOCK_EXPENSE_CURRENCY = "EUR";

async function deleteImageFromStorage(path: string): Promise<void> {
    const { error } = await supabase.storage.from("expense_invoices").remove([
        path,
    ]);
    if (error) {
        console.error("Error removing expense image from bucket:", error);
    }
}

async function fetchExpenses({
    userId,
    category,
    year,
    startMonth,
    endMonth,
}: FetchExpensesProps): Promise<ExpenseRecord[]> {
    let query = supabase.from("expenses").select("*").eq("user_id", userId);

    if (category && category !== "all") {
        query = query.eq("category", category);
    }

    if (year) {
        const start = `${year}-${String(startMonth ?? 1).padStart(2, "0")}-01`;
        const end = endMonth
            ? endMonth === 12
                ? `${year + 1}-01-01`
                : `${year}-${String(endMonth + 1).padStart(2, "0")}-01`
            : `${year + 1}-01-01`;

        query = query.gte("expense_date", start).lt("expense_date", end);
    }

    const { data, error } = await query;
    if (error) throw error;

    const filePaths = data
        .map((expense) => expense.image_url)
        .filter((path): path is string =>
            typeof path === "string" && path.length > 0
        );

    if (filePaths.length === 0) {
        return data.map((expense) => ({ ...expense, signed_url: "" }));
    }

    const { data: signedUrls, error: signError } = await supabase.storage
        .from("expense_invoices")
        .createSignedUrls(filePaths, 3600);

    if (signError) throw signError;

    return data.map((expense, index) => ({
        ...expense,
        signed_url: signedUrls?.[index]?.signedUrl ?? "",
    }));
}
async function insertExpense(expense: NewExpense): Promise<ExpenseRecord> {
    const { data, error } = await supabase
        .from("expenses")
        .insert(expense)
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function deleteExpenseAndFile(id: string): Promise<ExpenseRecord> {
    const { data: record, error: fetchError } = await supabase
        .from("expenses")
        .select("image_url")
        .eq("id", id)
        .single();

    if (fetchError) throw fetchError;

    if (record?.image_url) {
        await deleteImageFromStorage(record.image_url);
    }

    const { data, error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

async function checkDuplicateFileName(
    userId: string,
    fileName: string,
): Promise<boolean> {
    const { data, error } = await supabase
        .from("expenses")
        .select("id")
        .eq("user_id", userId)
        .eq("file_name", fileName)
        .limit(1);

    if (error) throw error;
    return (data?.length ?? 0) > 0;
}

function sanitizeFileName(fileName: string): string {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function validateCategory(category: string | undefined): ExpenseCategory {
    if (isExpenseCategory(category)) {
        return category;
    }

    return DEFAULT_EXPENSE_CATEGORY;
}

async function invokeExpenseExtraction(filePath: string, fileType: string) {
    const functionNames = [
        "extract-data-from-expense-image",
    ];

    let lastError: Error | null = null;

    for (const functionName of functionNames) {
        const { data, error } = await supabase.functions.invoke<
            ExtractionResponse
        >(
            functionName,
            {
                body: {
                    filePath,
                    fileType,
                },
            },
        );

        if (!error) {
            return data;
        }

        // Keep compatibility with both function names while migrating.
        if (/404|not found/i.test(error.message)) {
            lastError = error;
            continue;
        }

        throw error;
    }

    if (lastError) {
        throw lastError;
    }

    throw new Error("Expense extraction function could not be invoked");
}

async function uploadAndInsertExpense({
    file,
    userId,
    category,
    vendorName,
}: UploadExpenseVariables): Promise<ExpenseRecord> {
    const isDuplicate = await checkDuplicateFileName(userId, file.name);
    if (isDuplicate) {
        throw new Error(
            `Eine Datei mit dem Namen \"${file.name}\" existiert bereits.`,
        );
    }

    const filePath = `${userId}/${Date.now()}_${sanitizeFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
        .from("expense_invoices")
        .upload(filePath, file);

    if (uploadError) throw uploadError;

    let extractedData: ExtractionResponse | null = null;

    try {
        extractedData = await invokeExpenseExtraction(filePath, file.type);
    } catch (error) {
        await deleteImageFromStorage(filePath);
        throw error;
    }

    if (!extractedData?.success) {
        await deleteImageFromStorage(filePath);
        throw new Error(extractedData?.error ?? "Expense extraction failed");
    }

    const newExpense: NewExpense = {
        user_id: userId,
        file_name: file.name,
        image_url: filePath,
        category: category ?? validateCategory(extractedData.category),
        amount: extractedData.amount ?? MOCK_EXPENSE_AMOUNT,
        expense_date: extractedData.expense_date ?? MOCK_EXPENSE_DATE,
        vendor_name: vendorName ?? extractedData.vendor_name ?? null,
    };

    void extractedData.currency;
    return insertExpense(newExpense);
}

export function useExpenses(props: FetchExpensesProps) {
    const queryClient = useQueryClient();

    const query = useQuery<ExpenseRecord[], PostgrestError>({
        queryKey: ["expenses", props],
        queryFn: () => fetchExpenses(props),
        enabled: !!props.userId,
        staleTime: 1000 * 60 * 5,
    });

    const addExpense = useMutation<ExpenseRecord, PostgrestError, NewExpense>({
        mutationFn: insertExpense,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
        },
    });

    const uploadExpense = useMutation<
        ExpenseRecord,
        PostgrestError | Error,
        UploadExpenseVariables
    >({
        mutationFn: uploadAndInsertExpense,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
        },
    });

    const removeExpense = useMutation<ExpenseRecord, PostgrestError, string>({
        mutationFn: deleteExpenseAndFile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
        },
    });

    return {
        ...query,
        addExpense,
        uploadExpense,
        removeExpense,
    };
}

export { MOCK_EXPENSE_AMOUNT, MOCK_EXPENSE_CURRENCY, MOCK_EXPENSE_DATE };
