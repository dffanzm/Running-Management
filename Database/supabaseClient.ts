import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://wsrggcpkolmydmjqmhqc.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzcmdnY3Brb2xteWRtanFtaHFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NDQ0NDMsImV4cCI6MjA3NjUyMDQ0M30.D361S2ySY19mNfsonTIfz-E1X_0bg-3tVubFdJZoEqw";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
