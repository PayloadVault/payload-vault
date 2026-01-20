import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";
import type { FetchPdfProps, PdfRecord, NewPdf } from "./types";

async function fetchPdfs({
  userId,
  category,
  year,
  month,
  sortBy = "new",
}: FetchPdfProps): Promise<PdfRecord[]> {
  let query = supabase.from("pdf_records").select("*").eq("user_id", userId);

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  if (year) {
    const start = `${year}-${String(month ?? 1).padStart(2, "0")}-01`;

    const end = month
      ? month === 12
        ? `${year + 1}-01-01`
        : `${year}-${String(month + 1).padStart(2, "0")}-01`
      : `${year + 1}-01-01`;

    query = query.gte("date_created", start).lt("date_created", end);
  }

  switch (sortBy) {
    case "old":
      query = query.order("date_created", { ascending: true });
      break;
    case "high":
      query = query.order("profit", { ascending: false });
      break;
    case "low":
      query = query.order("profit", { ascending: true });
      break;
    default:
      query = query.order("date_created", { ascending: false });
  }

  const { data, error } = await query;

  if (error) throw error;
  return data ?? [];
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

export function usePdfs(props: FetchPdfProps) {
  const queryClient = useQueryClient();

  const query = useQuery<PdfRecord[], PostgrestError>({
    queryKey: ["pdfs", props],
    queryFn: () => fetchPdfs(props),
    enabled: !!props.userId,
  });

  const addPdf = useMutation<PdfRecord, PostgrestError, NewPdf>({
    mutationFn: insertPdf,
    onSuccess: (newPdf) => {
      queryClient.setQueryData<PdfRecord[]>(["pdfs", props], (old = []) => [
        newPdf,
        ...old,
      ]);
    },
  });

  const removePdf = useMutation<PdfRecord, PostgrestError, string>({
    mutationFn: deletePdf,
    onSuccess: (_deletedPdf, id) => {
      queryClient.setQueryData<PdfRecord[]>(["pdfs", props], (old = []) =>
        old.filter((pdf) => pdf.id !== id)
      );
    },
  });

  return { ...query, addPdf, removePdf };
}
