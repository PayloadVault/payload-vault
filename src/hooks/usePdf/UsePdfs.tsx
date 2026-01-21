import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";
import type { FetchPdfProps, PdfRecord, NewPdf } from "./types";

async function deleteFileFromStorage(path: string) {
  const { error } = await supabase.storage.from("pdf_reports").remove([path]);
  if (error) console.error("Error removing file from bucket:", error);
}

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

  const filePaths = data.map((pdf) => pdf.pdf_url);
  const { data: signedUrls, error: signError } = await supabase.storage
    .from("pdf_reports")
    .createSignedUrls(filePaths, 3600);

  if (signError) throw signError;
  return data.map((pdf, index) => ({
    ...pdf,
    signed_url: signedUrls[index]?.signedUrl ?? "",
  }));
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

// Updated to delete from Storage AND Database
async function deletePdfAndFile(id: string): Promise<PdfRecord> {
  const { data: record, error: fetchError } = await supabase
    .from("pdf_records")
    .select("pdf_url")
    .eq("id", id)
    .single();

  if (fetchError) throw fetchError;

  if (record?.pdf_url) {
    await deleteFileFromStorage(record.pdf_url);
  }

  const { data, error } = await supabase
    .from("pdf_records")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

type UploadVariables = {
  file: File;
  userId: string;
};

async function uploadAndInsertPdf({
  file,
  userId,
}: UploadVariables): Promise<PdfRecord> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g, "_")}.${fileExt}`;
  const filePath = `${userId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("pdf_reports")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // Here we should do metadata extraction
  const newPdfRecord: NewPdf = {
    user_id: userId,
    file_name: file.name,
    pdf_url: filePath,
    category: "Strom & Gas",
    profit: Math.random() * 1000,
    date_created: new Date().toISOString().split("T")[0],
  };

  return insertPdf(newPdfRecord);
}

export function usePdfs(props: FetchPdfProps) {
  const queryClient = useQueryClient();

  const query = useQuery<PdfRecord[], PostgrestError>({
    queryKey: ["pdfs", props],
    queryFn: () => fetchPdfs(props),
    enabled: !!props.userId,
    staleTime: 1000 * 60 * 50,
  });

  const addPdf = useMutation<PdfRecord, PostgrestError, NewPdf>({
    mutationFn: insertPdf,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdfs"] });
    },
  });

  const uploadPdf = useMutation<PdfRecord, PostgrestError, UploadVariables>({
    mutationFn: uploadAndInsertPdf,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdfs"] });
    },
  });

  const removePdf = useMutation<PdfRecord, PostgrestError, string>({
    mutationFn: deletePdfAndFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdfs"] });
    },
  });

  return { ...query, addPdf, uploadPdf, removePdf };
}
