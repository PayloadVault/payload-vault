import { createClient } from "jsr:@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { INVOICE_EXTRACTION_PROMPT } from "./prompt.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const genAI = new GoogleGenerativeAI(Deno.env.get("GOOGLE_API_KEY") ?? "");
const geminiModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

type ExtractedAIData = {
  amount: unknown;
  expense_date: unknown;
  category: unknown;
  vendor_name: unknown;
  image_url: unknown;
  product: unknown;
  rejection_reason?: unknown;
};

type ExtractionResponse = {
  success: boolean;
  amount?: number;
  expense_date?: string;
  category?: string;
  vendor_name?: string;
  image_url?: string;
  product?: string;
  rejection_reason?: string;
};

function sanitizeAIResponse(raw: string): ExtractedAIData | null {
  try {
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch {
    return null;
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from("expense_invoices")
      .download(filePath);

    if (downloadError) throw downloadError;

    const arrayBuffer = await fileBlob.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    const result = await geminiModel.generateContent([
      { text: INVOICE_EXTRACTION_PROMPT },
      {
        inlineData: {
          data: base64Data,
          mimeType: fileBlob.type,
        },
      },
    ]);

    const responseText = result.response.text();
    const aiParsed = sanitizeAIResponse(responseText);

    const category = aiParsed?.category as string | undefined;
    const isValidCategory = category && category !== "No Category";

    const mockData = {
      success: true,
      extracted: {
        amount: 123.45,
        expense_date: new Date().toISOString().split("T")[0],
        category: "Mobilität",
        vendor_name: "INA",
        image_url: filePath,
      },
    };

    const extractedData: ExtractionResponse = isValidCategory
      ? {
          success: true,
          amount: (aiParsed?.amount as number) || 0,
          expense_date:
            (aiParsed?.expense_date as string) ||
            new Date().toISOString().split("T")[0],
          category: category,
          vendor_name: (aiParsed?.vendor_name as string) || "Unbekannt",
          image_url: (aiParsed?.image_url as string) || "",
          product: (aiParsed?.product as string) || "Unbekannt",
        }
      : {
          success: false,
          rejection_reason:
            (aiParsed?.rejection_reason as string) ||
            "Dieses Dokument konnte nicht als gültige Rechnung identifiziert werden. Bitte stellen Sie sicher, dass Sie einen unterstützten Rechnungstyp hochladen.",
        };

    // We can keep logging on backend side for debugging purposes
    console.log("Extracted Data:", extractedData);

    console.log("mockData", mockData);

    return new Response(JSON.stringify(mockData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      },
    );
  }
});
