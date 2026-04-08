import type { jsPDF } from "jspdf";

export const PAGE_MARGIN = 15;
export const A4_WIDTH = 210;
export const A4_HEIGHT = 297;
export const CONTENT_WIDTH = A4_WIDTH - PAGE_MARGIN * 2;
export const SAFE_BOTTOM = A4_HEIGHT - PAGE_MARGIN - 10;

export const COLORS = {
  title: "#1a1a1a",
  sectionHeader: "#333333",
  text: "#444444",
  subtle: "#888888",
  tableHeader: "#f0f0f0",
  tableHeaderText: "#333333",
  altRow: "#fafafa",
  primary: "#00c4b3",
  error: "#f43f5e",
  border: "#e0e0e0",
} as const;

export function formatCurrency(value: number): string {
  return (
    value.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " \u20AC"
  );
}

export function addSectionTitle(
  doc: jsPDF,
  title: string,
  y: number,
): number {
  if (y > SAFE_BOTTOM - 20) {
    doc.addPage();
    y = PAGE_MARGIN;
  }
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.sectionHeader);
  doc.text(title, PAGE_MARGIN, y);
  return y + 8;
}

export function addPageFooters(doc: jsPDF, year: number): void {
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(COLORS.subtle);
    doc.text(
      `Seite ${i} von ${totalPages} | PayloadVault Steuerbericht ${year}`,
      A4_WIDTH / 2,
      A4_HEIGHT - 8,
      { align: "center" },
    );
  }
}

export function checkPageBreak(doc: jsPDF, y: number, needed: number): number {
  if (y + needed > SAFE_BOTTOM) {
    doc.addPage();
    return PAGE_MARGIN;
  }
  return y;
}
