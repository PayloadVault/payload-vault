// Minimal module declarations to keep TypeScript tooling happy in this repo.
// Supabase Edge Functions run on Deno, where these specifiers are valid.

declare module "https://deno.land/std@0.168.0/encoding/base64.ts" {
  export function decode(input: string): Uint8Array;
}

declare module "npm:pdfjs-dist@4.10.38/legacy/build/pdf.mjs" {
  // Keep this intentionally loose — PDF.js types are large and not needed here.
  export function getDocument(src: any): { promise: Promise<any> };
}
