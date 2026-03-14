import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

const FALLBACK_CATEGORY = "Sonstiges";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Parse Form Data (used for file uploads)
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const incomingCategory = formData.get("category") as string ||
      FALLBACK_CATEGORY;
    const manualVendor = formData.get("vendor_name") as string;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Generate a unique file path
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}_${
      file.name.replace(/\.[^/.]+$/, "")
    }.${fileExt}`;
    const filePath = fileName; // Adjust path folder logic here if needed

    // 3. Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("expense_invoices")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // 4. Mock Extraction Logic (Now using the uploaded file info)
    const response = {
      success: true,
      amount: 123.45,
      currency: "EUR",
      expense_date: new Date().toISOString().split("T")[0], // Today
      category: incomingCategory,
      vendor_name: manualVendor ||
        file.name.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " "),
      storage_path: uploadData.path, // Confirmation of where it was saved
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
