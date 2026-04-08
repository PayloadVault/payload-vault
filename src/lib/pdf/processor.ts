import * as pdfjsLib from "pdfjs-dist";
import PdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?worker";
import type { InlineData, PdfTextItem } from "./types";

// Point pdfjs at its worker. Adjust the path to match your public/ output.
// If you don't need a separate worker thread, set this to "" and pdfjs will
// fall back to running synchronously (fine for most use-cases).
pdfjsLib.GlobalWorkerOptions.workerPort = new PdfjsWorker();

const MAX_PAGES = 50;
const MAX_CHARS = 250_000;

// ── Helpers ──────────────────────────────────────────────────────────────────

function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function coerceItems(items: unknown[]): PdfTextItem[] {
  const out: PdfTextItem[] = [];
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const { str, transform } = item as Record<string, unknown>;
    if (typeof str !== "string" || !str) continue;
    out.push({
      str,
      transform: Array.isArray(transform) ? (transform as number[]) : undefined,
    });
  }
  return out;
}

function itemsToReadableText(items: PdfTextItem[]): string {
  if (!items.length) return "";

  const Y_TOLERANCE = 2.5;
  const lines: string[] = [];
  let currentLine: string[] = [];
  let currentY: number | null = null;

  for (const { str, transform } of items) {
    const text = str.replace(/\s+/g, " ").trim();
    if (!text) continue;

    const y = typeof transform?.[5] === "number" ? transform[5] : null;

    if (currentY === null) {
      currentY = y;
      currentLine.push(text);
      continue;
    }

    if (y !== null && Math.abs(y - currentY) > Y_TOLERANCE) {
      if (currentLine.length) lines.push(currentLine.join(" "));
      currentLine = [text];
      currentY = y;
    } else {
      currentLine.push(text);
    }
  }

  if (currentLine.length) lines.push(currentLine.join(" "));

  return lines.join(" ").replace(/\s+/g, " ").trim();
}

// ── Core extraction ───────────────────────────────────────────────────────────

async function extractTextFromPdfBytes(bytes: Uint8Array): Promise<string> {
  const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;

  const pagesToRead = Math.min(pdf.numPages, MAX_PAGES);
  let fullText = "";

  for (let pageNum = 1; pageNum <= pagesToRead; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const { items = [] } = (await page.getTextContent()) as {
      items?: unknown[];
    };
    const pageText = itemsToReadableText(coerceItems(items));

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

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Extracts raw text from a base64-encoded PDF.
 */
export const processSalesData = async (input: InlineData): Promise<string> => {
  if (input.mimeType !== "application/pdf") {
    throw new Error(`Unsupported MIME type: ${input.mimeType}`);
  }

  let bytes: Uint8Array;
  try {
    bytes = base64ToUint8Array(input.data);
  } catch (err) {
    throw new Error(
      `Invalid base64 PDF payload: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  try {
    return await extractTextFromPdfBytes(bytes);
  } catch (err) {
    throw new Error(
      `PDF text extraction failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
};

