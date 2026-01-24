import type { Category } from "../../hooks/usePdf/types";

type SinglePdf = {
  id: string;
  title: string;
  date: string;
  signedUrl: string;
  openLink: string;
  category: Category;
  income: number;
};

type AllPdfTypes = {
  totalIncome: number;
  totalPdf: number;
  pdfs: SinglePdf[];
};

export type { SinglePdf, AllPdfTypes };
