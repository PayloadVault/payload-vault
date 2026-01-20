import type { Database } from "../../types/supabase";

type PdfRecord = Database["public"]["Tables"]["pdf_records"]["Row"];
type NewPdf = Database["public"]["Tables"]["pdf_records"]["Insert"];

type FetchPdfProps = {
  userId: string;
  category?: Database["public"]["Enums"]["document_category"] | "all";
  year?: number;
  month?: number;
  sortBy?: "new" | "old" | "high" | "low";
};

type PdfListItem = Pick<
  PdfRecord,
  "id" | "file_name" | "category" | "profit" | "date_created"
>;

export type { PdfRecord, NewPdf, FetchPdfProps, PdfListItem };
