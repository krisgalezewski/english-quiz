// Paste your Supabase project values here (Project settings → API).
// The anon key is safe to expose in client-side code — that's what it's for.
const SUPABASE_URL = "https://mumvnjyiupzvmcoatwye.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11bXZuanlpdXB6dm1jb2F0d3llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyODEzMDMsImV4cCI6MjA5Njg1NzMwM30.JgMQRDkIvGFUvKR_Iwoo91zaPdd5urNig8yc0g0oMRk";

export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);