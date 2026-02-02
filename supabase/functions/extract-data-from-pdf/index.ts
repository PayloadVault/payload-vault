import { createClient } from "jsr:@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";
import { INVOICE_EXTRACTION_PROMPT } from "./prompt.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const genAI = new GoogleGenerativeAI(Deno.env.get("GOOGLE_API_KEY") ?? "");
const geminiModel = genAI.getGenerativeModel({
  model: "gemini-flash-2.5",
});

type ExtractedAIData = {
  profit?: unknown;
  date_created?: unknown;
  category?: unknown;
  rejection_reason?: unknown;
};

type ExtractionResponse = {
  success: boolean;
  profit?: number;
  date_created?: string;
  category?: string;
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
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { filePath, fileType } = await req.json();

    if (!filePath) throw new Error("No filePath provided");

    // Download the file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("pdf_reports")
      .download(filePath);

    if (downloadError) throw downloadError;

    // Convert file to Base64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64Data = base64Encode(new Uint8Array(arrayBuffer));

    // Call Gemini
    const result = await geminiModel.generateContent([
      INVOICE_EXTRACTION_PROMPT,
      {
        inlineData: {
          data: base64Data,
          mimeType: fileType || "application/pdf",
        },
      },
    ]);

    const responseText = result.response.text();
    const aiParsed = sanitizeAIResponse(responseText);

    const category = aiParsed?.category as string | undefined;
    const isValidCategory = category && category !== "No Category";

    const extractedData: ExtractionResponse = isValidCategory
      ? {
        success: true,
        profit: (aiParsed?.profit as number) || 0,
        date_created: (aiParsed?.date_created as string) ||
          new Date().toISOString().split("T")[0],
        category: category,
      }
      : {
        success: false,
        rejection_reason: (aiParsed?.rejection_reason as string) ||
          "Dieses Dokument konnte nicht als gültige Rechnung identifiziert werden. Bitte stellen Sie sicher, dass Sie einen unterstützten Rechnungstyp hochladen.",
      };

    // We can keep logging on backend side for debugging purposes
    console.log("Extracted Data:", extractedData);

    return new Response(JSON.stringify(extractedData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
