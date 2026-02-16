import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://imlbvvxyxlknevvlbbpr.supabase.co";
const GEMINI_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltbGJ2dnh5eGxrbmV2dmxiYnByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5Mjg3NjYsImV4cCI6MjA4NTUwNDc2Nn0.kJ9LExD3-x0h5IwJ1TFwZtEyvwOnp5s9CpXV9CKajUA";

const supabase = createClient(SUPABASE_URL, GEMINI_ANON_KEY);

async function debug() {
    const { data: experiences, error: e1 } = await supabase.from('experiences').select('count');
    const { data: packages, error: e2 } = await supabase.from('packages').select('count');
    const { data: blogs, error: e3 } = await supabase.from('blogs').select('count');

    console.log("Experiences:", experiences, "Error:", e1);
    console.log("Packages:", packages, "Error:", e2);
    console.log("Blogs:", blogs, "Error:", e3);
}

debug();
