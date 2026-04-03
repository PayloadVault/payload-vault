import type { PdfRecord } from "../../hooks/usePdf/types";
import type { ExpenseRecord } from "../../hooks/useExpenses/types";
import { addPageFooters } from "./helpers";
import { addHeaderSection } from "./sections/headerSection";
import { addCategorySummarySection } from "./sections/categorySummarySection";
import { addMonthlyBreakdownSection } from "./sections/monthlyBreakdownSection";
import { addIncomeDetailSection } from "./sections/incomeDetailSection";
import { addExpenseDetailSection } from "./sections/expenseDetailSection";
import { addKontoReferenceSection } from "./sections/kontoReferenceSection";

export async function generateTaxReport(
  pdfs: PdfRecord[],
  expenses: ExpenseRecord[],
  year: number,
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const { applyPlugin } = await import("jspdf-autotable");
  applyPlugin(jsPDF);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  // Page 1: Header + Summary + Category breakdowns
  let y = addHeaderSection(doc, year, pdfs, expenses);
  y = addCategorySummarySection(doc, pdfs, expenses, y);

  // Page 2: Monthly breakdowns
  doc.addPage();
  addMonthlyBreakdownSection(doc, pdfs, expenses);

  // Page 3+: Income detail
  doc.addPage();
  addIncomeDetailSection(doc, pdfs);

  // Page N+: Expense detail
  doc.addPage();
  addExpenseDetailSection(doc, expenses);

  // Final page: KONTO reference
  doc.addPage();
  addKontoReferenceSection(doc);

  // Add page footers to all pages
  addPageFooters(doc, year);

  doc.save(`steuerbericht_${year}.pdf`);
}
