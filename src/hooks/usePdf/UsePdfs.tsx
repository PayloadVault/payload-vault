import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import type { Database } from "../../types/supabase";
import type { PostgrestError } from "@supabase/supabase-js";

/**
 * React Query hook for managing PDF records for a specific user.
 *
 * Provides:
 * - Fetching all PDFs for a user
 * - Adding a new PDF record
 * - Deleting an existing PDF record
 *
 * Data is stored in Supabase (`pdf_records` table) and cached via React Query.
 *
 * @param {string} userId - The authenticated user's ID.
 *
 * @returns {{
 *   data: PdfRecord[] | undefined,
 *   isLoading: boolean,
 *   isError: boolean,
 *   error: PostgrestError | null,
 *   addPdf: import("@tanstack/react-query").UseMutationResult<PdfRecord, PostgrestError, NewPdf>,
 *   removePdf: import("@tanstack/react-query").UseMutationResult<PdfRecord, PostgrestError, string>
 * }}
 *
 * @example
 * const { data: pdfs, addPdf, removePdf, isLoading } = usePdfs(user.id);
 *
 * addPdf.mutate({
 *   user_id: user.id,
 *   file_name: "invoice.pdf",
 *   pdf_url: "https://example.com/invoice.pdf",
 *   category: "Strom & Gas",
 *   date_created: new Date().toISOString()
 * });
 *
 * removePdf.mutate(pdfId);
 */

type PdfRecord = Database["public"]["Tables"]["pdf_records"]["Row"];
type NewPdf = Database["public"]["Tables"]["pdf_records"]["Insert"];

async function fetchPdfs(userId: string): Promise<PdfRecord[]> {
  const { data, error } = await supabase
    .from("pdf_records")
    .select("*")
    .eq("user_id", userId)
    .order("date_created", { ascending: false });

  if (error) throw error;
  return data || [];
}

async function insertPdf(pdf: NewPdf): Promise<PdfRecord> {
  const { data, error } = await supabase
    .from("pdf_records")
    .insert(pdf)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deletePdf(id: string): Promise<PdfRecord> {
  const { data, error } = await supabase
    .from("pdf_records")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function usePdfs(userId: string) {
  const queryClient = useQueryClient();

  const query = useQuery<PdfRecord[], PostgrestError>({
    queryKey: ["pdfs", userId],
    queryFn: () => fetchPdfs(userId),
    enabled: !!userId,
  });

  const addPdf = useMutation<PdfRecord, PostgrestError, NewPdf>({
    mutationFn: insertPdf,
    onSuccess: (newPdf) => {
      queryClient.setQueryData<PdfRecord[]>(["pdfs", userId], (old = []) => [
        newPdf,
        ...old,
      ]);
    },
  });

  const removePdf = useMutation<PdfRecord, PostgrestError, string>({
    mutationFn: deletePdf,
    onSuccess: (_deletedPdf, id) => {
      queryClient.setQueryData<PdfRecord[]>(["pdfs", userId], (old = []) =>
        old.filter((pdf) => pdf.id !== id)
      );
    },
  });

  return { ...query, addPdf, removePdf };
}
