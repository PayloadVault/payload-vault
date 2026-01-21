import type { PdfRecord } from "../../hooks/usePdf/types";
import type { AllPdfTypes, SinglePdf } from "./types";

const formatAllPdfs = (allPdfs: PdfRecord[]) => {
  let totalIncome = 0;
  let totalPdf = 0;
  const pdfs: SinglePdf[] = [];

  allPdfs.forEach((pdf) => {
    totalIncome += pdf.profit;
    totalPdf++;
    const singlePdf: SinglePdf = {
      category: pdf.category,
      date: pdf.date_created,
      signedUrl: pdf.signed_url || "",
      openLink: pdf.signed_url || "",
      income: pdf.profit,
      title: pdf.file_name,
    };
    pdfs.push(singlePdf);
  });

  const allData: AllPdfTypes = {
    totalPdf,
    totalIncome,
    pdfs,
  };

  return allData;
};

export { formatAllPdfs };
