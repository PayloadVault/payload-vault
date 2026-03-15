import { decode as base64Decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import * as pdfjsLib from "npm:pdfjs-dist@4.10.38/legacy/build/pdf.mjs";

export interface InlineData {
  data: string; // base64 PDF
  mimeType: "application/pdf";
}

type PdfTextItem = {
  str: string;
  transform?: number[];
};

type ExtractedData = {
  date_created: string;
  profit: number;
  category?: string;
} | null;

const MAX_PAGES = 50;
const MAX_CHARS = 250_000;

function bytesFromBase64(base64: string): Uint8Array {
  try {
    return base64Decode(base64);
  } catch (error) {
    throw new Error(
      `Invalid base64 PDF payload: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function coerceItems(items: unknown[]): PdfTextItem[] {
  const out: PdfTextItem[] = [];

  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const asAny = item as Record<string, unknown>;
    const str = typeof asAny.str === "string" ? asAny.str : "";
    if (!str) continue;
    const transform = Array.isArray(asAny.transform)
      ? (asAny.transform as number[])
      : undefined;
    out.push({ str, transform });
  }

  return out;
}

function itemsToReadableText(items: PdfTextItem[]): string {
  if (items.length === 0) return "";

  // Rebuild lines using the Y coordinate (transform[5]) when available.
  const lines: string[] = [];
  let currentLine: string[] = [];
  let currentY: number | null = null;
  const yTolerance = 2.5;

  for (const item of items) {
    const text = item.str.replace(/\s+/g, " ").trim();
    if (!text) continue;

    const y =
      typeof item.transform?.[5] === "number" ? item.transform[5] : null;

    if (currentY === null) {
      currentY = y;
      currentLine.push(text);
      continue;
    }

    if (
      y !== null &&
      currentY !== null &&
      Math.abs(y - currentY) > yTolerance
    ) {
      if (currentLine.length > 0) lines.push(currentLine.join(" "));
      currentLine = [text];
      currentY = y;
      continue;
    }

    currentLine.push(text);
  }

  if (currentLine.length > 0) lines.push(currentLine.join(" "));

  return lines.join(" ").replace(/\s+/g, " ").trim();
}

async function extractTextFromPdfBytes(bytes: Uint8Array): Promise<string> {
  // PDF.js expects ArrayBuffer-like; Uint8Array works as `data`.
  const loadingTask = pdfjsLib.getDocument({
    data: bytes,
    disableWorker: true,
  });

  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages ?? 0;
  const pagesToRead = Math.min(pageCount, MAX_PAGES);

  let fullText = "";

  for (let pageNumber = 1; pageNumber <= pagesToRead; pageNumber++) {
    const page = await pdf.getPage(pageNumber);

    // `getTextContent` returns items with `.str` and `.transform`.
    const textContent = await page.getTextContent();
    const items = coerceItems(
      (textContent as { items?: unknown[] }).items ?? [],
    );
    const pageText = itemsToReadableText(items);

    if (pageText) {
      fullText += (fullText ? " " : "") + pageText;
      if (fullText.length > MAX_CHARS) {
        fullText = fullText.slice(0, MAX_CHARS);
        break;
      }
    }
  }

  return fullText.replace(/\s+/g, " ").trim();
}

// The main function that extracts readable text from a PDF
export const processSalesData = async (input: InlineData): Promise<string> => {
  if (input.mimeType !== "application/pdf") {
    throw new Error("Unsupported MIME type: " + input.mimeType);
  }

  const bytes = bytesFromBase64(input.data);

  try {
    const text = await extractTextFromPdfBytes(bytes);
    return text;
  } catch (error) {
    throw new Error(
      `PDF text extraction failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
};

export const extractedBarmeniaAbrechnung = (text: string) => {
  if (text.length === 0) {
    return null;
  }

  const dateMatch = text.match(/Maschinell am (\d{2}\.\d{2}\.\d{4})/);
  const date = dateMatch ? dateMatch[1] : null;

  const saldoMatch = text.match(/Überweisung -([+-]?\d+,\d{2})/);
  const saldo = saldoMatch ? saldoMatch[1] : null;

  const category = text.toLowerCase().includes("abrechnung")
    ? "Barmenia Abrechnung"
    : undefined;

  if (!date || !saldo || !category) {
    return null;
  }

  const data = {
    profit: Number(normalizeSaldo(saldo)),
    date_created: normalizeDate(date ?? ""),
    category: category,
  };

  return data;
};

export const extractedAdcuriAbschlussprovision = (text: string) => {
  if (text.length === 0) {
    return null;
  }

  const dateMatch = text.match(/Bochum (\d{1,2}\.\d{1,2}\.\d{4})/);
  const date = dateMatch ? dateMatch[1] : null;

  const saldoMatch = text.match(/Auszahl\.: ([+-]?\d+,\d{2})/);
  const saldo = saldoMatch ? saldoMatch[1] : null;

  const category = text.toLowerCase().includes("abschlussprovision")
    ? "Adcuri Abschlussprovision"
    : undefined;

  if (!date || !saldo || !category) {
    return null;
  }

  const data = {
    profit: Number(normalizeSaldo(saldo)),
    date_created: normalizeDate(date),
    category: category,
  };

  return data;
};

export const extractedAdcuriBestandsprovision = (text: string) => {
  if (!text || text.length === 0) {
    return null;
  }

  // Extract date after "Bochum"
  const dateMatch = text.match(/Bochum (\d{1,2}\.\d{1,2}\.\d{4})/);
  const date = dateMatch ? dateMatch[1] : null;

  // Extract Auszahl. saldo
  const saldoMatch = text.match(/Auszahl\.: ([+-]?\d+,\d{2})/);
  const saldo = saldoMatch ? saldoMatch[1] : null;

  const category =
    text.toLowerCase().includes("adcuri") &&
    !text.toLowerCase().includes("abschlussprovision")
      ? "Adcuri Bestandsprovision"
      : undefined;

  if (!date || !saldo || !category) {
    return null;
  }

  const data = {
    profit: Number(normalizeSaldo(saldo)),
    date_created: normalizeDate(date),
    category,
  };

  return data;
};

export const extractedStromUndGas = (text: string) => {
  if (!text || text.length === 0) {
    return null;
  }

  const dateMatch = text.match(/\b(\d{1,2}\.\d{1,2}\.\d{4})\b/);
  const date = dateMatch ? dateMatch[1] : null;

  const saldoMatch = text.match(/Summe Brutto ([+-]?\d+,\d{2})/);
  const saldo = saldoMatch ? saldoMatch[1] : null;

  const category = text.toLowerCase().includes("alpha energie")
    ? "Strom & Gas"
    : undefined;

  if (!date || !saldo || !category) {
    return null;
  }

  const data = {
    profit: Number(normalizeSaldo(saldo)),
    date_created: normalizeDate(date),
    category,
  };

  return data;
};

export const extractedIKK = (text: string) => {
  if (!text || text.length === 0) {
    return null;
  }

  const dateMatch = text.match(/\b(\d{1,2}\.\d{1,2}\.\d{4})\b/);
  const date = dateMatch ? dateMatch[1] : null;

  const saldoMatch = text.match(/Gesamtbetrag ([+-]?\d+,\d{2})/);
  const saldo = saldoMatch ? saldoMatch[1] : null;

  const category = text.includes("IKK") ? "IKK Abrechnung" : undefined;

  if (!date || !saldo || !category) return null;

  const data = {
    profit: Number(normalizeSaldo(saldo)),
    date_created: normalizeDate(date),
    category,
  };

  return data;
};

const normalizeDate = (dateStr: string) => {
  const [day, month, year] = dateStr.split(".");
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const normalizeSaldo = (saldo?: string) => {
  return saldo?.replace(",", ".") ?? "0";
};

export const unifiedPdfExtractor = (text: string): ExtractedData => {
  if (!text || text.length === 0) return null;

  // List of extractor functions in order of priority
  const extractors: ((text: string) => ExtractedData)[] = [
    extractedIKK,
    extractedStromUndGas,
    extractedAdcuriBestandsprovision,
    extractedAdcuriAbschlussprovision,
    extractedBarmeniaAbrechnung,
  ];

  for (const extractor of extractors) {
    try {
      const data = extractor(text);
      if (data && data.date_created && data.profit != null) {
        return data;
      }
    } catch (err) {
      continue;
    }
  }

  return null;
};
