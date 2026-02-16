import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://imlbvvxyxlknevvlbbpr.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = "PLACEHOLDER_SERVICE_KEY"; // Need to get this or use anon for select
const GEMINI_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltbGJ2dnh5eGxrbmV2dmxiYnByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5Mjg3NjYsImV4cCI6MjA4NTUwNDc2Nn0.kJ9LExD3-x0h5IwJ1TFwZtEyvwOnp5s9CpXV9CKajUA";

const supabase = createClient(SUPABASE_URL, GEMINI_ANON_KEY);
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/embed-content`;

async function sync() {
    console.log("Fetching dynamic content from database...");

    // 1. Fetch Latest Blogs
    const { data: blogs } = await supabase.from('blogs')
        .select('title, slug, excerpt')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(5);

    // 2. Fetch Latest Experiences
    const { data: experiences } = await supabase.from('experiences')
        .select('name, slug, description')
        .eq('is_active', true)
        .limit(5);

    // 3. Fetch Latest Packages
    const { data: packages } = await supabase.from('packages')
        .select('name, slug, short_description')
        .eq('is_active', true)
        .limit(5);

    const chunks = [];

    if (blogs) {
        blogs.forEach(b => {
            chunks.push({
                content: `Latest Blog: "${b.title}". ${b.excerpt}. Read full story here: /blog/${b.slug}`,
                source_url: `/blog/${b.slug}`,
                metadata: { category: "blog", type: "latest", title: b.title }
            });
        });
    }

    if (experiences) {
        experiences.forEach(e => {
            chunks.push({
                content: `Experience: "${e.name}". ${e.description}. View all details: /experiences/${e.slug}`,
                source_url: `/experiences/${e.slug}`,
                metadata: { category: "experience", type: "latest", title: e.name }
            });
        });
    }

    if (packages) {
        packages.forEach(p => {
            chunks.push({
                content: `Special Package: "${p.name}". ${p.short_description}. View and book package: /packages/${p.slug}`,
                source_url: `/packages/${p.slug}`,
                metadata: { category: "package", type: "latest", title: p.name }
            });
        });
    }

    console.log(`Prepared ${chunks.length} dynamic content chunks.`);

    for (const chunk of chunks) {
        console.log(`Ingesting content for: ${chunk.source_url}`);
        try {
            const resp = await fetch(FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GEMINI_ANON_KEY}`
                },
                body: JSON.stringify(chunk)
            });
            const data = await resp.json();
            if (data.error) console.error(`Error: ${data.error}`);
            else console.log(`Success!`);
        } catch (e) {
            console.error(`Fetch failed for ${chunk.source_url}: ${e.message}`);
        }
    }
}

sync();
