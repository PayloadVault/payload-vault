import { createClient } from "jsr:@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { EXPENSE_RECEIPT_EXTRACTION_PROMPT } from "./prompt.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const genAI = new GoogleGenerativeAI(Deno.env.get("GOOGLE_API_KEY") ?? "");
const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

// ---------- Types ----------

type ExtractedProduct = {
  product_name: string;
  amount: number;
  category: string;
};

type ExtractedAIData = {
  expense_date?: unknown;
  vendor_name?: unknown;
  products?: unknown;
  rejection_reason?: unknown;
  total_amount?: unknown;
  total?: unknown;
  amount?: unknown;
  gross_total?: unknown;
  final_amount?: unknown;
};

type ExtractionResponse = {
  success: boolean;
  expense_date: string;
  vendor_name: string;
  image_url: string;
  products: ExtractedProduct[];
  rejection_reason?: string;
};

// ---------- Helpers ----------

function sanitizeAIResponse(raw: string): ExtractedAIData | null {
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned) as ExtractedAIData;
  } catch {
    return null;
  }
}

const VALID_CATEGORIES = new Set([
  "Mobilität",
  "Geschäftsessen",
  "Büro & Arbeitsmittel",
  "Kommunikation",
  "Weiterbildung",
  "Reisen",
  "Versicherungen",
  "Bank & Gebühren",
  "Marketing",
  "Sonstiges",
]);

function normalizeCategory(category: unknown): string {
  if (typeof category === "string" && VALID_CATEGORIES.has(category)) {
    return category;
  }
  return "Sonstiges";
}

function parseAmount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value
      .replace(/\s/g, "")
      .replace(/€/g, "")
      .replace(/EUR/gi, "")
      .replace(/[^\d,.-]/g, "")
      .replace(/\.(?=\d{3}(\D|$))/g, "")
      .replace(",", ".");

    const parsed = Number.parseFloat(normalized);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}

function normalizeVendorName(vendorName: unknown): string {
  return typeof vendorName === "string" && vendorName.trim().length > 0
    ? vendorName.trim()
    : "Unbekannt";
}

function normalizeExpenseDate(expenseDate: unknown): string {
  if (typeof expenseDate === "string" && expenseDate.trim().length > 0) {
    return expenseDate;
  }
  return new Date().toISOString().split("T")[0];
}

function buildProducts(aiParsed: ExtractedAIData | null): ExtractedProduct[] {
  if (!aiParsed) return [];

  if (Array.isArray(aiParsed.products)) {
    const normalizedProducts = aiParsed.products
      .map((product) => {
        if (!product || typeof product !== "object") return null;

        const candidate = product as {
          product_name?: unknown;
          name?: unknown;
          description?: unknown;
          amount?: unknown;
          total?: unknown;
          price?: unknown;
          category?: unknown;
        };

        const amount =
          parseAmount(candidate.amount) ??
          parseAmount(candidate.total) ??
          parseAmount(candidate.price);

        if (!amount) return null;

        const productName =
          (typeof candidate.product_name === "string" &&
            candidate.product_name.trim()) ||
          (typeof candidate.name === "string" && candidate.name.trim()) ||
          (typeof candidate.description === "string" &&
            candidate.description.trim()) ||
          "Unbekannt";

        return {
          product_name: productName,
          amount,
          category: normalizeCategory(candidate.category),
        };
      })
      .filter((p): p is ExtractedProduct => p !== null);

    if (normalizedProducts.length > 0) {
      return normalizedProducts;
    }
  }

  const fallbackAmount =
    parseAmount(aiParsed.total_amount) ??
    parseAmount(aiParsed.total) ??
    parseAmount(aiParsed.amount) ??
    parseAmount(aiParsed.gross_total) ??
    parseAmount(aiParsed.final_amount);

  if (!fallbackAmount) return [];

  return [
    {
      product_name: normalizeVendorName(aiParsed.vendor_name),
      amount: fallbackAmount,
      category: "Sonstiges",
    },
  ];
}

function getMimeType(filePath: string, blobType: string): string {
  if (blobType && blobType !== "application/octet-stream") return blobType;

  const ext = filePath.split(".").pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
    heic: "image/heic",
  };
  return mimeMap[ext ?? ""] ?? "application/octet-stream";
}

function toBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}

// ---------- CORS ----------

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ---------- Handler ----------

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { filePath } = await req.json();

    if (!filePath) {
      return new Response(
        JSON.stringify({ success: false, error: "No filePath provided" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Download the file (image or PDF) from storage
    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from("expense_invoices")
      .download(filePath);

    if (downloadError) throw downloadError;

    const arrayBuffer = await fileBlob.arrayBuffer();
    const base64Data = toBase64(arrayBuffer);
    const mimeType = getMimeType(filePath, fileBlob.type);

    // Call Gemini — wrapped in its own try/catch so mock data is still returned during testing
    let aiParsed: ExtractedAIData | null = null;
    try {
      const result = await geminiModel.generateContent([
        { text: EXPENSE_RECEIPT_EXTRACTION_PROMPT },
        {
          inlineData: {
            data: base64Data,
            mimeType,
          },
        },
      ]);

      const responseText = result.response.text();
      aiParsed = sanitizeAIResponse(responseText);

      console.log("AI raw response:", responseText);
      console.log("AI parsed response:", JSON.stringify(aiParsed, null, 2));
    } catch (aiError) {
      const msg = aiError instanceof Error ? aiError.message : String(aiError);
      console.error("Gemini API error (returning mock data):", msg);
    }

    const normalizedProducts = buildProducts(aiParsed);
    const hasProducts = normalizedProducts.length > 0;

    const extractedData: ExtractionResponse = hasProducts
      ? {
          success: true,
          expense_date: normalizeExpenseDate(aiParsed?.expense_date),
          vendor_name: normalizeVendorName(aiParsed?.vendor_name),
          image_url: filePath,
          products: normalizedProducts,
        }
      : {
          success: false,
          expense_date: normalizeExpenseDate(aiParsed?.expense_date),
          vendor_name: normalizeVendorName(aiParsed?.vendor_name),
          image_url: filePath,
          products: [],
          rejection_reason:
            (typeof aiParsed?.rejection_reason === "string" &&
              aiParsed.rejection_reason) ||
            "Dieses Dokument konnte nicht als gültiger Beleg identifiziert werden. Bitte stellen Sie sicher, dass Sie einen Kassenbon oder eine Rechnung hochladen.",
        };

    console.log("Extracted Data:", JSON.stringify(extractedData, null, 2));

    return new Response(JSON.stringify(extractedData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Edge function error:", message);
    return new Response(JSON.stringify({ success: false, error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
