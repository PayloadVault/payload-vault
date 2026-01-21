import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
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
    const base64Data = btoa(
      String.fromCharCode(...new Uint8Array(arrayBuffer)),
    );

    // 4. Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(Deno.env.get("GOOGLE_API_KEY") ?? "");

    // --- FIX: USE EXACT NAME FROM YOUR LIST ---
    // Your list showed "gemini-flash-latest".
    // If this hits a limit, try "gemini-2.0-flash-lite-preview-02-05" (Lite is usually free)
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
    });

    // 5. Define the prompt
    const prompt = `
      Analyze this invoice PDF. Extract the following data in strict JSON format:
      - profit: The total gross amount (Summe Brutto). Return as a number (e.g. 405.00).
      - date_created: The invoice date (Faktura-Datum). Return as YYYY-MM-DD string.
      - category: Categorize strictly as one of: "Strom & Gas", "Barmenia Abrechnung", "IKK Abrechnung", "Adcuri Abschlussprovision", "Adcuri Bestandsprovision".
      
      If you are unsure about the category, default to "Strom & Gas".
      Return ONLY the JSON object, no markdown formatting.
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

    // Clean up response (sometimes AI adds ```json ... ```)
    const cleanedJson = responseText.replace(/```json|```/g, "").trim();
    const extractedData = JSON.parse(cleanedJson);

    return new Response(JSON.stringify(extractedData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    // Return error details so you can see them in the browser console
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
