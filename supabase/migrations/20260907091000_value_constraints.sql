-- ============================================================
-- Server-side bounds on user-supplied values.
--
-- All writes go straight from the browser to PostgREST, so the database
-- is the only trust boundary. Without these, a client can store
-- arbitrarily large text/JSON in its own rows (storage abuse, oversized
-- exports and reports).
--
-- Added NOT VALID so pre-existing rows are never rejected at deploy time;
-- the constraints are still enforced on every INSERT and UPDATE from now on.
-- ============================================================

ALTER TABLE public.expenses
  ADD CONSTRAINT expenses_vendor_name_length
    CHECK (vendor_name IS NULL OR length(vendor_name) <= 300) NOT VALID;

ALTER TABLE public.expenses
  ADD CONSTRAINT expenses_file_name_length
    CHECK (length(file_name) BETWEEN 1 AND 300) NOT VALID;

ALTER TABLE public.expenses
  ADD CONSTRAINT expenses_image_url_length
    CHECK (length(image_url) BETWEEN 1 AND 1024) NOT VALID;

ALTER TABLE public.expenses
  ADD CONSTRAINT expenses_amount_upper_bound
    CHECK (amount <= 100000000) NOT VALID;

ALTER TABLE public.expenses
  ADD CONSTRAINT expenses_products_shape
    CHECK (
      jsonb_typeof(products) = 'array'
      AND jsonb_array_length(products) <= 500
      AND length(products::text) <= 200000
    ) NOT VALID;

ALTER TABLE public.pdf_records
  ADD CONSTRAINT pdf_records_file_name_length
    CHECK (length(file_name) BETWEEN 1 AND 300) NOT VALID;

ALTER TABLE public.pdf_records
  ADD CONSTRAINT pdf_records_pdf_url_length
    CHECK (length(pdf_url) BETWEEN 1 AND 1024) NOT VALID;
