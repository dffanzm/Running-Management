import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://aenlovlhplphplyszrmj.supabase.co"; // ganti
const SUPABASE_ANON_KEY ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlbmxvdmxocGxwaHBseXN6cm1qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNDkzODEsImV4cCI6MjA3NTgyNTM4MX0.Bo_Z1pjHJAnzva0eH-9tX7gey3jl2Kk_qlwYHIfQQLE"; // ganti
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
