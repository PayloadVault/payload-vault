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
  model: "gemini-2.5-flash",
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

const allowedOrigin = Deno.env.get("APP_ORIGIN") ?? "*";
const corsHeaders = {
  "Access-Control-Allow-Origin": allowedOrigin,
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Simple in-memory rate limiter (per warm instance)
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const WINDOW_MS = 60_000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = requestCounts.get(userId);
  if (!entry || now > entry.resetAt) {
    requestCounts.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Validate JWT — ensure caller is an authenticated user
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  const { data: { user }, error: authError } = await supabase.auth.getUser(
    authHeader.replace("Bearer ", ""),
  );
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Rate limiting
  if (!checkRateLimit(user.id)) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { filePath, fileType } = await req.json();

    if (!filePath || typeof filePath !== "string") {
      throw new Error("No filePath provided");
    }

    // Prevent path traversal and enforce ownership
    if (filePath.includes("..") || filePath.includes("\0")) {
      return new Response(JSON.stringify({ error: "Invalid file path" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!filePath.startsWith(`${user.id}/`)) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Edge function error:", msg);
    return new Response(
      JSON.stringify({ error: "Verarbeitung fehlgeschlagen. Bitte erneut versuchen." }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
