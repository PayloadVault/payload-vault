import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";
import type { FetchPdfProps, PdfRecord, NewPdf } from "./types";

type PdfCategory =
  | "Strom & Gas"
  | "Barmenia Abrechnung"
  | "IKK Abrechnung"
  | "Adcuri Abschlussprovision"
  | "Adcuri Bestandsprovision";

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

  const filePaths = data
    .map((pdf) => pdf.pdf_url)
    .filter((p): p is string => typeof p === "string" && p.length > 0);

  if (filePaths.length === 0)
    return data.map((pdf) => ({ ...pdf, signed_url: "" }));

  const { data: signedUrls, error: signError } = await supabase.storage
    .from("pdf_reports")
    .createSignedUrls(filePaths, 3600);

  if (signError) throw signError;
  return data.map((pdf, index) => ({
    ...pdf,
    signed_url: signedUrls?.[index]?.signedUrl ?? "",
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

export class ExtractionError extends Error {
  constructor(
    message: string,
    public readonly rejectionReason?: string,
  ) {
    super(message);
    this.name = "ExtractionError";
  }
}

type ExtractionResponse = {
  success: boolean;
  profit?: number;
  date_created?: string;
  category?: string;
  rejection_reason?: string;
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

  const { data: aiData, error: aiError } = await supabase.functions.invoke<ExtractionResponse>(
    "extract-data-from-pdf",
    {
      body: {
        filePath: filePath,
        fileType: file.type,
      },
    },
  );

  if (aiError) {
    // Clean up uploaded file on AI error
    await supabase.storage.from("pdf_reports").remove([filePath]);
    throw new ExtractionError("AI extraction failed", aiError.message);
  }

  if (!aiData?.success) {
    // Clean up uploaded file if extraction was rejected
    await supabase.storage.from("pdf_reports").remove([filePath]);
    throw new ExtractionError(
      "Document not recognized",
      aiData?.rejection_reason || "Could not identify this document as a valid invoice.",
    );
  }

  const metadata = {
    profit: aiData.profit || 0,
    date_created: aiData.date_created || new Date().toISOString().split("T")[0],
    category: validateCategory(aiData.category || ""),
  };

  const newPdfRecord: NewPdf = {
    user_id: userId,
    file_name: file.name,
    pdf_url: filePath,
    category: metadata.category as PdfCategory,
    profit: metadata.profit,
    date_created: metadata.date_created,
  };

  return insertPdf(newPdfRecord);
}

function validateCategory(cat: string): PdfCategory {
  const valid = [
    "Strom & Gas",
    "Barmenia Abrechnung",
    "IKK Abrechnung",
    "Adcuri Abschlussprovision",
    "Adcuri Bestandsprovision",
  ];
  return valid.includes(cat) ? (cat as PdfCategory) : "Strom & Gas";
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
      queryClient.invalidateQueries({ queryKey: ["availableYears"] });
    },
  });

  const uploadPdf = useMutation<PdfRecord, PostgrestError, UploadVariables>({
    mutationFn: uploadAndInsertPdf,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdfs"] });
      queryClient.invalidateQueries({ queryKey: ["availableYears"] });
    },
  });

  const removePdf = useMutation<PdfRecord, PostgrestError, string>({
    mutationFn: deletePdfAndFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdfs"] });
      queryClient.invalidateQueries({ queryKey: ["availableYears"] });
    },
  });

  return { ...query, addPdf, uploadPdf, removePdf };
}
