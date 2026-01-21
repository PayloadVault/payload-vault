import type { Database } from "../../types/supabase";

type PdfRecord = Database["public"]["Tables"]["pdf_records"]["Row"];
type NewPdf = Database["public"]["Tables"]["pdf_records"]["Insert"];
type SortTypes = "new" | "old" | "high" | "low";
type HomeSort = "low" | "high" | "most" | "least";
type Category = Database["public"]["Enums"]["document_category"] | "all";

type FetchPdfProps = {
  userId: string;
  category?: Category;
  year?: number;
  month?: number;
  sortBy?: SortTypes;
};

export type { PdfRecord, NewPdf, FetchPdfProps, SortTypes, Category, HomeSort };
