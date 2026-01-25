import { createClient } from "jsr:@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

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

    // 1. Initialize Supabase Admin Client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    // 2. Download the file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("pdf_reports")
      .download(filePath);

    if (downloadError) throw downloadError;

    // 3. Convert file to Base64
    const arrayBuffer = await fileData.arrayBuffer();
    const base64Data = base64Encode(new Uint8Array(arrayBuffer));

    // 4. Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(Deno.env.get("GOOGLE_API_KEY") ?? "");

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
    });

    // 5. Define the prompt
    const prompt = `
      You are an automated invoice parser.

      You will receive a PDF invoice (German language).
      Your task is to extract structured data EXACTLY as specified.

      IMPORTANT RULES:
      - Read ONLY the content of the provided PDF.
      - Do NOT guess values.
      - Do NOT invent numbers or dates.
      - If a value cannot be found with high confidence, use the fallback rules below.
      - Your response MUST be valid JSON.
      - Your response MUST contain ONLY the JSON object.

      --------------------
      FIELDS TO EXTRACT
      --------------------

      1) profit
      - Definition: The actual payout amount transferred to the bank account.
      - KEYWORDS: Look for "Überweisung", "Auszahlungsbetrag", or "Auszahlung".
      - LOGIC:
        1. Priority: Find the line item labeled "Überweisung" or "Auszahlung".
        2. Handling Negatives: If "Überweisung" is listed as a negative number (e.g. "-737,45"), convert it to a POSITIVE number (737.45).
        3. Deductions: Do NOT sum up individual commissions (like "Provision" + "Zuschuss"). You must account for deductions (like "Rücklage").
        4. Fallback: Only if no "Überweisung" line exists, use the "Gesamtbetrag" or "Summe".
      - Remove currency symbols (€, EUR).
      - Convert comma decimals to dot decimals.
      - Return as a NUMBER.

      2) date_created
      - Definition: The invoice issue date.
      - Look for labels such as:
        - "Faktura-Datum"
        - "Rechnungsdatum"
        - "Datum"
        - "vom"
      - Convert the date to ISO format: YYYY-MM-DD.
      - If multiple dates exist, prefer the invoice date over service period dates.
      - If no valid date is found, use today's date.

      3) category
      - You MUST return EXACTLY ONE of the following values:
        - "Strom & Gas"
        - "Barmenia Abrechnung"
        - "IKK Abrechnung"
        - "Adcuri Abschlussprovision"
        - "Adcuri Bestandsprovision"

      CATEGORY RULES:
      - If the invoice mentions electricity, gas, energy providers, kWh, Abschlag → "Strom & Gas"
      - If it mentions "Barmenia" → "Barmenia Abrechnung"
      - If it mentions "IKK" → "IKK Abrechnung"
      - If it mentions "Adcuri" AND "Abschlussprovision" → "Adcuri Abschlussprovision"
      - If it mentions "Adcuri" AND "Bestandsprovision" → "Adcuri Bestandsprovision", if it mentions "Adcuri" but neither provision type, prefer "Adcuri Bestandsprovision"
      - If unsure or unclear → "No Category"

      If the content is some random document but NOT a recognized invoice, return:
      - "No Category" for category
      - Include a "rejection_reason" field explaining briefly why the document was not recognized (e.g., "Document does not appear to be an invoice" or "No recognizable invoice format or provider found").

      --------------------
      OUTPUT FORMAT
      --------------------

      For valid invoices, return EXACTLY this JSON structure:

      {
        "profit": number,
        "date_created": "YYYY-MM-DD",
        "category": "string"
      }

      For unrecognized documents, return:

      {
        "profit": 0,
        "date_created": "YYYY-MM-DD",
        "category": "No Category",
        "rejection_reason": "Brief explanation of why the document was not recognized"
      }

      Do NOT include markdown.
      Do NOT include explanations outside the JSON.
      Do NOT include extra fields beyond those specified.
      `;

    // 6. Call Gemini
    const result = await model.generateContent([
      prompt,
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
          "Could not identify this document as a valid invoice. Please ensure you are uploading a supported invoice type.",
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
