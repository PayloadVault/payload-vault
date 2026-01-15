// Script to seed the local Supabase database with a test user and sample PDF records

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/types/supabase";

const supabaseUrl = "http://127.0.0.1:54321";
const serviceRoleKey = "sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz";

// Connecting to local supabase instance as admin
const supabaseAdmin = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function seed() {
    // Create a test user
    const { data: userAuth } = await supabaseAdmin.auth.admin
        .createUser({
            email: "bazilje@profina.de",
            password: "123456",
            email_confirm: true,
        });

    let userId = userAuth.user?.id;
    if (!userId) {
        return;
    }

    const categories = [
        "Strom & Gas",
        "Barmenia Abrechnung",
        "IKK Abrechnung",
        "Adcuri Abschlussprovision",
        "Adcuri Bestandsprovision",
    ] as const;

    for (const cat of categories) {
        // Create a dummy PDF file in storage
        const fileName = `${cat.replace(/ /g, "_").toLowerCase()}_sample.pdf`;
        await supabaseAdmin.storage
            .from("pdf_reports")
            .upload(`${userId}/${fileName}`, "Dummy PDF Content", {
                contentType: "application/pdf",
                upsert: true,
            });
        // Get public URL of the uploaded file
        const { data: urlData } = supabaseAdmin.storage.from("pdf_reports")
            .getPublicUrl(`${userId}/${fileName}`);

        // Insert a record into pdf_records table with user info and file URL
        await supabaseAdmin
            .from("pdf_records")
            .insert({
                user_id: userId,
                category: cat,
                profit: Number((Math.random() * (600 - 400) + 400).toFixed(2)),
                date_created: "2026-01-15",
                file_name: fileName,
                pdf_url: urlData.publicUrl,
            });
    }
    console.log("Seeding finished.");
}

seed();
