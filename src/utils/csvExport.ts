import type { StoredProduct } from "../hooks/useExpenses/types";
import type { PdfRecord } from "../hooks/usePdf/types";
import type { SingleExpensePdf } from "../pages/allPdfs/types";

export const GERMAN_MONTHS = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

export const EXPENSE_KONTO: Record<string, number> = {
  Mobilität: 4530,
  Geschäftsessen: 4650,
  Reisen: 4660,
  "Büro & Arbeitsmittel": 4900,
  Kommunikation: 4920,
  Weiterbildung: 4950,
  Versicherungen: 4360,
  "Bank & Gebühren": 4970,
  Marketing: 4600,
  Sonstiges: 4900,
};

export const INCOME_KONTO: Record<string, number> = {
  "Adcuri Abschlussprovision": 8300,
  "Adcuri Bestandsprovision": 8300,
  "Barmenia Abrechnung": 8300,
  "Strom & Gas": 8400,
  "IKK Abrechnung": 8400,
};

export function formatAmount(value: number): string {
  return value.toFixed(2).replace(".", ",");
}

const CSV_DELIMITER = ";";

// A value that is entirely a number (including a negative amount such as
// "-1234,50") is data, not a formula, and must stay numeric for the
// accounting import.
const NUMERIC_VALUE = /^[+-]?\d+(?:[.,]\d+)?$/;

/**
 * Renders one CSV field safely.
 *
 * Two separate problems are handled here:
 *  1. Structure — vendor/product/file names are free text and may contain the
 *     delimiter, quotes or newlines, which would otherwise shift every
 *     following column (RFC 4180 quoting).
 *  2. Formula injection — a value starting with = + - @ or a control character
 *     is executed as a formula when the export is opened in Excel/LibreOffice
 *     or imported into accounting software. Prefixing with a single quote
 *     keeps the value visible but inert.
 */
export function escapeCsvField(
  value: string | number | null | undefined,
): string {
  if (value === null || value === undefined) return "";

  let text = String(value).replace(/[\r\n\t]+/g, " ");

  // Leading whitespace is stripped by spreadsheet importers, so "\t=cmd" is
  // just as dangerous as "=cmd".
  if (!NUMERIC_VALUE.test(text) && /^\s*[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  if (text.includes(CSV_DELIMITER) || text.includes('"')) {
    return `"${text.replace(/"/g, '""')}"`;
  }

  return text;
}

function csvRow(fields: Array<string | number | null | undefined>): string {
  return fields.map(escapeCsvField).join(CSV_DELIMITER);
}

function getGermanMonth(dateStr: string): string {
  const month = new Date(dateStr).getMonth();
  return GERMAN_MONTHS[month];
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export function generateExpenseCsv(
  expenses: SingleExpensePdf[],
  activeCategory?: string,
): string {
  const header = "Datum;Betrag;Kategorie;Konto;Beschreibung";
  const rows: string[] = [header];

  for (const expense of expenses) {
    const products: StoredProduct[] = Array.isArray(expense.products)
      ? expense.products
      : [];

    if (products.length > 0) {
      const relevantProducts = activeCategory
        ? products.filter((p) => p.category === activeCategory)
        : products;

      for (const product of relevantProducts) {
        const konto = EXPENSE_KONTO[product.category] ?? 4900;
        rows.push(
          csvRow([
            formatDate(expense.expense_date),
            formatAmount(product.amount),
            product.category,
            konto,
            expense.vendor_name,
          ]),
        );
      }
    } else {
      const konto = EXPENSE_KONTO[expense.category] ?? 4900;
      rows.push(
        csvRow([
          formatDate(expense.expense_date),
          formatAmount(expense.amount),
          expense.category,
          konto,
          expense.vendor_name,
        ]),
      );
    }
  }

  return rows.join("\n");
}

export function generateIncomeCsv(pdfs: PdfRecord[]): string {
  const header =
    "Datum;Betrag;Währung;Konto;Gegenkonto;Belegfeld1;Buchungstext";
  const rows: string[] = [header];

  for (const pdf of pdfs) {
    const monthName = getGermanMonth(pdf.date_created);
    const buchungstext = `${pdf.category} ${monthName}`;
    const datum = formatDate(pdf.date_created);
    const belegfeld1 = pdf.file_name;

    if (pdf.general_grant && pdf.general_grant !== 0) {
      const mainAmount = pdf.profit - pdf.general_grant;
      const mainKonto = INCOME_KONTO[pdf.category] ?? 8300;

      rows.push(
        csvRow([
          datum,
          formatAmount(mainAmount),
          "EUR",
          mainKonto,
          1200,
          belegfeld1,
          buchungstext,
        ]),
      );

      rows.push(
        csvRow([
          datum,
          formatAmount(pdf.general_grant),
          "EUR",
          8400,
          1200,
          belegfeld1,
          buchungstext,
        ]),
      );
    } else {
      const konto = INCOME_KONTO[pdf.category] ?? 8300;
      rows.push(
        csvRow([
          datum,
          formatAmount(pdf.profit),
          "EUR",
          konto,
          1200,
          belegfeld1,
          buchungstext,
        ]),
      );
    }
  }

  return rows.join("\n");
}

export function downloadCsv(csvContent: string, fileName: string): void {
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function buildCsvFileName(parts: (string | null)[]): string {
  // Keep path separators and other filesystem-significant characters out of
  // the suggested download name (umlauts and other letters are preserved).
  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      // eslint-disable-next-line no-control-regex
      .replace(/[/\\:*?"<>|\u0000-\u001f]/g, "_")
      .slice(0, 80);

  return parts
    .filter((v): v is string => Boolean(v))
    .map(slugify)
    .join("_")
    .concat("_export.csv");
}
