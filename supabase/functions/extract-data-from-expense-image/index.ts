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
  expense_date: string;
  vendor_name: string;
  products: ExtractedProduct[];
  rejection_reason?: string;
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

// ---------- CORS ----------

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ---------- Handler ----------

Deno.serve(async (req) => {
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
    const bytes = new Uint8Array(arrayBuffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64Data = btoa(binary);
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

    const hasProducts =
      aiParsed !== null && aiParsed.products && aiParsed.products.length > 0;

    const extractedData: ExtractionResponse = hasProducts
      ? {
          success: true,
          expense_date:
            aiParsed!.expense_date || new Date().toISOString().split("T")[0],
          vendor_name: aiParsed!.vendor_name || "Unbekannt",
          image_url: filePath,
          products: aiParsed!.products,
        }
      : {
          success: false,
          expense_date:
            aiParsed?.expense_date || new Date().toISOString().split("T")[0],
          vendor_name: aiParsed?.vendor_name || "Unbekannt",
          image_url: filePath,
          products: [],
          rejection_reason:
            aiParsed?.rejection_reason ||
            "Dieses Dokument konnte nicht als gültiger Beleg identifiziert werden. Bitte stellen Sie sicher, dass Sie einen Kassenbon oder eine Rechnung hochladen.",
        };

    console.log("Extracted Data:", JSON.stringify(extractedData, null, 2));

    // ---- Mock data returned while testing ----
    const mockData: ExtractionResponse = {
      success: true,
      expense_date: new Date().toISOString().split("T")[0],
      vendor_name: "REWE",
      image_url: filePath,
      products: [
        {
          product_name: "Super E10 Benzin",
          amount: 65.37,
          category: "Mobilität",
        },
        {
          product_name: "Kaugummi Spearmint",
          amount: 1.49,
          category: "Sonstiges",
        },
      ],
    };

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
