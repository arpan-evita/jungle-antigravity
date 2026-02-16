const chunks = [
    {
        content: "Jungle Heritage Resort is tucked away in the tranquil forests of Dudhwa National Park. It is a sanctuary where luxury and wilderness blend seamlessly, designed for those who seek meaningful escapes in nature without compromising on elegance or comfort.",
        source_url: "/about",
        metadata: { category: "about", type: "intro" }
    },
    {
        content: "Our mission is to craft immersive wilderness experiences that soothe the soul, honor the environment, and uplift local communities, all while delivering exceptional, personalized luxury in the heart of nature.",
        source_url: "/about",
        metadata: { category: "about", type: "mission" }
    },
    {
        content: "Our vision is to become India’s leading eco-luxury destination, setting benchmarks in sustainable tourism, wildlife conservation, and conscious hospitality that inspires every guest to reconnect with the wild.",
        source_url: "/about",
        metadata: { category: "about", type: "vision" }
    },
    {
        content: "Jungle Heritage Resort values: Sustainability (eco-conscious luxury), Excellence (carefully curated details), Authenticity (genuine connections with wilderness), Community (supporting local culture), Conservation (wildlife restoration), and Hospitality (warm, personalized service).",
        source_url: "/about",
        metadata: { category: "about", type: "values" }
    },
    {
        content: "Accommodations at Jungle Heritage Resort include luxury Rooms & Villas. Each room is a sanctuary of luxury, thoughtfully designed to immerse guests in the beauty of the forest while providing modern comfort.",
        source_url: "/rooms",
        metadata: { category: "rooms", type: "intro" }
    },
    {
        content: "Jungle Heritage Resort offers curated experiences including thrilling wildlife safaris in Dudhwa National Park, romantic dining under the stars, and discovery moments that create lasting memories.",
        source_url: "/experiences",
        metadata: { category: "experiences", type: "intro" }
    },
    {
        content: "Contact Information for Jungle Heritage Resort: Phone: +91 9250225752, Email: reservation@jungleheritage.com, WhatsApp: +91 9250225752. Located nearby Kishanpur Gate, Bhira, Jagdevpur, Uttar Pradesh 262901.",
        source_url: "/contact",
        metadata: { category: "contact", type: "info" }
    },
    {
        content: "Navigation Links for Jungle Heritage Resort: Home (/), Rooms & Villas (/rooms), Curated Experiences (/experiences), Special Packages (/packages), Photo Gallery (/gallery), About Our Story (/about), Careers (/careers), and our Journal/Blog (/blog). Use these relative paths to provide links to users.",
        source_url: "sitemap",
        metadata: { category: "navigation", type: "links" }
    },
    {
        content: "Our Journal (Blog) at /blog features stories from the jungle, travel tips for Dudhwa National Park, and updates about life at Jungle Heritage Resort. Guests can read full stories at /blog.",
        source_url: "/blog",
        metadata: { category: "blog", type: "intro" }
    },
    {
        content: "To book a stay or check availability, users can click the Quick Actions or visit the Booking page at /booking. The resort is located near the Kishanpur Gate of Dudhwa National Park.",
        source_url: "/booking",
        metadata: { category: "navigation", type: "booking" }
    },
    {
        content: "Dudhwa National Park has two major zones: Kishanpur and Dudhwa. Jungle Heritage Resort is located near the Kishanpur Gate.",
        source_url: "/contact",
        metadata: { category: "contact", type: "location" }
    }
];

async function ingest() {
    const FUNCTION_URL = "https://imlbvvxyxlknevvlbbpr.supabase.co/functions/v1/embed-content";
    const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltbGJ2dnh5eGxrbmV2dmxiYnByIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5Mjg3NjYsImV4cCI6MjA4NTUwNDc2Nn0.kJ9LExD3-x0h5IwJ1TFwZtEyvwOnp5s9CpXV9CKajUA";

    console.log(`Starting ingestion of ${chunks.length} chunks...`);

    for (const chunk of chunks) {
        console.log(`Ingesting: ${chunk.source_url} - ${chunk.content.substring(0, 30)}...`);
        try {
            const resp = await fetch(FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ANON_KEY}`
                },
                body: JSON.stringify(chunk)
            });
            const data = await resp.json();
            if (data.error) console.error(`Error: ${data.error}`);
            else console.log(`Success!`);
        } catch (e) {
            console.error(`Fetch failed: ${e.message}`);
        }
    }
}

ingest();
