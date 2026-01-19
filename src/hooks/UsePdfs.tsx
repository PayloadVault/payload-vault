import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import type { Database } from "../types/supabase";
import type { PostgrestError } from "@supabase/supabase-js";

export function usePdfs(userId: string) {
  type PdfRecord = Database["public"]["Tables"]["pdf_records"]["Row"];

  const [pdfs, setPdfs] = useState<PdfRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  useEffect(() => {
    async function fetchInvoices() {
      setLoading(true);

      const { data, error } = await supabase
        .from("pdf_records")
        .select("*")
        .eq("user_id", userId)
        .order("date_created", { ascending: false });

      if (error) {
        setError(error);
        setPdfs([]);
      } else {
        setPdfs(data || []);
      }

      setLoading(false);
    }

    if (userId) fetchInvoices();
  }, [userId]);

  return { pdfs, loading, error };
}
