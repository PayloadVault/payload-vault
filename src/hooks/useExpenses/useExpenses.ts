import type { PostgrestError } from "@supabase/supabase-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import type {
    ExpenseRecord,
    ExtractedExpenseData,
    FetchExpensesProps,
    NewExpense,
} from "./types";

function sanitizeFileName(fileName: string): string {
    return fileName
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9._-]/g, "_");
}
async function deleteImageFromStorage(path: string): Promise<void> {
    const { error } = await supabase.storage.from("expense_invoices").remove([
        path,
    ]);
    if (error) console.error("Error removing storage file:", error.message);
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

export function useFetchExpenses(props: FetchExpensesProps) {
    return useQuery<ExpenseRecord[], PostgrestError>({
        queryKey: ["expenses", props],
        queryFn: async () => {
            let q = supabase.from("expenses").select("*").eq(
                "user_id",
                props.userId,
            );
            if (props.category && props.category !== "all") {
                q = q.eq("category", props.category);
            }

            const { data, error } = await q.order("expense_date", {
                ascending: false,
            });
            if (error) throw error;

            const filePaths = data.map((e) => e.image_url).filter(Boolean);
            if (filePaths.length === 0) return data;

            const { data: signedUrls } = await supabase.storage
                .from("expense_invoices")
                .createSignedUrls(filePaths, 3600);

            return data.map((expense) => ({
                ...expense,
                signed_url: signedUrls?.find((s) =>
                    expense.image_url === s.path
                )?.signedUrl ?? "",
            }));
        },
        enabled: !!props.userId,
    });
}

export function useUploadAndExtract(userId: string) {
    return useMutation<ExtractedExpenseData, Error, File>({
        mutationFn: async (file) => {
            const isDuplicate = await checkDuplicateFileName(userId, file.name);
            if (isDuplicate) {
                throw new Error(`File "${file.name}" already exists.`);
            }

            const filePath = `${userId}/${Date.now()}_${
                sanitizeFileName(file.name)
            }`;

            const { error: uploadError } = await supabase.storage
                .from("expense_invoices")
                .upload(filePath, file);
            if (uploadError) throw uploadError;

            try {
                const { data, error: extractError } = await supabase.functions
                    .invoke("extract-data-from-expense-image", {
                        body: { filePath },
                    });

                if (extractError || !data?.success) {
                    throw new Error(data?.error || "Extraction failed");
                }

                return {
                    ...data.extracted,
                    file_name: file.name,
                };
            } catch (err) {
                await deleteImageFromStorage(filePath);
                throw err;
            }
        },
    });
}

export function useConfirmAndUploadToDatabase() {
    const queryClient = useQueryClient();

    return useMutation<ExpenseRecord, PostgrestError, NewExpense>({
        mutationFn: async (newExpense) => {
            const { data, error } = await supabase
                .from("expenses")
                .insert(newExpense)
                .select()
                .single();
            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
        },
    });
}

export function useRemoveExpense() {
    const queryClient = useQueryClient();

    return useMutation<void, Error, { id: string; imageUrl: string }>({
        mutationFn: async ({ id, imageUrl }) => {
            const { error: dbError } = await supabase.from("expenses").delete()
                .eq("id", id);
            if (dbError) throw dbError;

            if (imageUrl) {
                await deleteImageFromStorage(imageUrl);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["expenses"] });
        },
    });
}
