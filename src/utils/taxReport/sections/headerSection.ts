import type { jsPDF } from "jspdf";
import type { PdfRecord } from "../../../hooks/usePdf/types";
import type { ExpenseRecord } from "../../../hooks/useExpenses/types";
import {
  PAGE_MARGIN,
  CONTENT_WIDTH,
  COLORS,
  formatCurrency,
  addSectionTitle,
} from "../helpers";
import { formatDate } from "../../csvExport";

export function addHeaderSection(
  doc: jsPDF,
  year: number,
  pdfs: PdfRecord[],
  expenses: ExpenseRecord[],
): number {
  let y = PAGE_MARGIN;

  // Title
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.title);
  doc.text(`STEUERBERICHT ${year}`, PAGE_MARGIN, y + 10);
  y += 18;

  // Generation date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.subtle);
  const today = formatDate(new Date().toISOString().slice(0, 10));
  doc.text(`Erstellt am: ${today}`, PAGE_MARGIN, y);
  y += 6;

  // Horizontal line
  doc.setDrawColor(COLORS.border);
  doc.setLineWidth(0.5);
  doc.line(PAGE_MARGIN, y, PAGE_MARGIN + CONTENT_WIDTH, y);
  y += 10;

  // Summary section
  y = addSectionTitle(doc, "Zusammenfassung", y);

  const totalEarnings = pdfs.reduce((sum, p) => sum + p.profit, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const net = totalEarnings - totalExpenses;

  const summaryData = [
    ["Gesamteinnahmen", formatCurrency(totalEarnings)],
    ["Gesamtausgaben", formatCurrency(totalExpenses)],
    ["Nettoergebnis", formatCurrency(net)],
    ["Anzahl Einnahmen", String(pdfs.length)],
    ["Anzahl Ausgaben", String(expenses.length)],
  ];

  (doc as any).autoTable({
    startY: y,
    head: [["Position", "Wert"]],
    body: summaryData,
    theme: "grid",
    margin: { left: PAGE_MARGIN, right: PAGE_MARGIN },
    tableWidth: CONTENT_WIDTH,
    headStyles: {
      fillColor: COLORS.tableHeader,
      textColor: COLORS.tableHeaderText,
      fontStyle: "bold",
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9, textColor: COLORS.text },
    alternateRowStyles: { fillColor: COLORS.altRow },
    columnStyles: {
      1: { halign: "right" },
    },
  });

  return (doc as any).lastAutoTable.finalY + 10;
}
