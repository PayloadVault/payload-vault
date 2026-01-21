import type { Category } from "../../hooks/usePdf/types";

type SinglePdf = {
  title: string;
  date: string;
  downloadLink: string;
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
