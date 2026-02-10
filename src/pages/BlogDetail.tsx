import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Calendar,
    User,
    ArrowLeft,
    Clock,
    Share2,
    Bookmark,
    Loader2,
    ChevronRight,
    Facebook,
    Instagram,
    Linkedin
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function BlogDetail() {
    const { slug } = useParams<{ slug: string }>();

    const { data: blog, isLoading } = useQuery({
        queryKey: ["blog", slug],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("blogs")
                .select("*")
                .eq("slug", slug)
                .single();

            if (error) throw error;
            return data;
        },
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-grow flex items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-[hsl(var(--gold))]" />
                </div>
                <Footer />
            </div>
        );
    }

    if (!blog) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <div className="flex-grow flex flex-col items-center justify-center py-20 px-4 text-center">
                    <h1 className="text-3xl font-serif mb-4">Story not found</h1>
                    <p className="text-muted-foreground mb-8">The article you're looking for might have been moved or removed.</p>
                    <Button asChild>
                        <Link to="/blog">Return to Stories</Link>
                    </Button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-grow">
                {/* Hero Section with Featured Image */}
                <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
                    <img
                        src={blog.featured_image || "https://images.unsplash.com/photo-1433086566608-bcfa2963c17a?q=80&w=1200&auto=format&fit=crop"}
                        alt={blog.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    <div className="absolute inset-0 flex items-end">
                        <div className="container px-4 pb-12 md:pb-20">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7 }}
                                className="max-w-4xl"
                            >
                                <div className="flex items-center gap-2 text-white/80 mb-6 text-sm md:text-base font-medium">
                                    <Link to="/" className="hover:text-white transition-colors">Home</Link>
                                    <ChevronRight className="h-4 w-4" />
                                    <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
                                    <ChevronRight className="h-4 w-4" />
                                    <span className="text-white line-clamp-1">{blog.title}</span>
                                </div>

                                <Badge className="mb-6 bg-[hsl(var(--gold))] text-white hover:bg-[hsl(var(--gold)/0.9)] border-0 py-1.5 px-4 text-sm">
                                    {blog.category || "Wilderness"}
                                </Badge>

                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-tight mb-8">
                                    {blog.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm md:text-base">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-[hsl(var(--gold))] flex items-center justify-center text-white ring-2 ring-white/20">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <span className="font-medium">Jungle Heritage Resort</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-[hsl(var(--gold))]" />
                                        {blog.published_at ? format(new Date(blog.published_at), "MMMM dd, yyyy") : format(new Date(blog.created_at), "MMMM dd, yyyy")}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-5 w-5 text-[hsl(var(--gold))]" />
                                        8 min read
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Content Section */}
                <section className="py-20 bg-white">
                    <div className="container px-4">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                            {/* Sidebar / Sharing */}
                            <aside className="lg:col-span-1 hidden lg:block sticky top-32 h-fit">
                                <div className="flex flex-col gap-6 items-center">
                                    <a href="https://www.facebook.com/jungleheritage" target="_blank" rel="noopener noreferrer" className="p-3 bg-[hsl(var(--gold))/0.05] rounded-full text-[hsl(var(--gold))] cursor-pointer hover:bg-[hsl(var(--gold))] hover:text-white transition-all">
                                        <Facebook className="h-5 w-5" />
                                    </a>
                                    <a href="https://www.instagram.com/jungleheritage/" target="_blank" rel="noopener noreferrer" className="p-3 bg-[hsl(var(--gold))/0.05] rounded-full text-[hsl(var(--gold))] cursor-pointer hover:bg-[hsl(var(--gold))] hover:text-white transition-all">
                                        <Instagram className="h-5 w-5" />
                                    </a>
                                    <div className="w-[1px] h-12 bg-border my-2" />
                                    <Linkedin className="h-5 w-5 text-muted-foreground hover:text-[#0A66C2] cursor-pointer transition-colors" />
                                </div>
                            </aside>

                            {/* Main Article Content */}
                            <article className="lg:col-span-8">
                                <div className="prose prose-lg md:prose-xl max-w-none prose-headings:font-serif prose-headings:font-medium prose-p:text-muted-foreground prose-p:leading-relaxed prose-img:rounded-3xl prose-img:shadow-xl">
                                    {(() => {
                                        let blocks = [];
                                        try {
                                            const parsed = JSON.parse(blog.content);
                                            blocks = Array.isArray(parsed) ? parsed : [{ type: "paragraph", content: blog.content }];
                                        } catch {
                                            blocks = [{ type: "paragraph", content: blog.content }];
                                        }

                                        return blocks.map((block: any, index: number) => {
                                            switch (block.type) {
                                                case "heading":
                                                    const HeadingTag = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
                                                    return <HeadingTag key={index} className="mt-12 first:mt-0">{block.content}</HeadingTag>;
                                                case "paragraph":
                                                    return <p key={index} className="whitespace-pre-wrap">{block.content}</p>;
                                                case "image":
                                                    return (
                                                        <figure key={index} className="my-12">
                                                            <img
                                                                src={block.content}
                                                                alt={block.caption || "Blog image"}
                                                                className="w-full rounded-3xl shadow-2xl"
                                                            />
                                                            {block.caption && (
                                                                <figcaption className="mt-4 text-center text-sm text-muted-foreground italic">
                                                                    {block.caption}
                                                                </figcaption>
                                                            )}
                                                        </figure>
                                                    );
                                                default:
                                                    return null;
                                            }
                                        });
                                    })()}
                                </div>

                                <div className="mt-16 pt-8 border-t flex flex-wrap items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-semibold text-foreground uppercase tracking-wider">Tags:</span>
                                        <div className="flex gap-2">
                                            <Badge variant="outline" className="rounded-full px-4 hover:border-[hsl(var(--gold))] hover:text-[hsl(var(--gold))] transition-colors cursor-pointer capitalize">{blog.category || "Wildlife"}</Badge>
                                            <Badge variant="outline" className="rounded-full px-4 hover:border-[hsl(var(--gold))] hover:text-[hsl(var(--gold))] transition-colors cursor-pointer">Adventure</Badge>
                                            <Badge variant="outline" className="rounded-full px-4 hover:border-[hsl(var(--gold))] hover:text-[hsl(var(--gold))] transition-colors cursor-pointer">Sanctuary</Badge>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 lg:hidden">
                                        <a href="https://www.facebook.com/jungleheritage" target="_blank" rel="noopener noreferrer">
                                            <Facebook className="h-5 w-5 text-muted-foreground" />
                                        </a>
                                        <a href="https://www.instagram.com/jungleheritage/" target="_blank" rel="noopener noreferrer">
                                            <Instagram className="h-5 w-5 text-muted-foreground" />
                                        </a>
                                    </div>
                                </div>

                                {/* Author Card */}
                                <div className="mt-16 p-8 md:p-12 bg-[hsl(var(--gold)/0.03)] rounded-[2rem] border border-[hsl(var(--gold)/0.1)] flex flex-col md:flex-row items-center gap-8">
                                    <div className="w-24 h-24 rounded-full bg-[hsl(var(--gold))] flex items-center justify-center shrink-0">
                                        <User className="h-12 w-12 text-white" />
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h3 className="text-2xl font-serif mb-2">Resort Editorial Team</h3>
                                        <p className="text-muted-foreground leading-relaxed">
                                            Bringing you the latest updates, conservation news, and insider tips from the heart of the wilderness. Join us in celebrating the beauty of nature.
                                        </p>
                                    </div>
                                </div>
                            </article>

                            {/* Desktop Sidebar (Optional) */}
                            <aside className="lg:col-span-3 space-y-12">
                                <div>
                                    <h4 className="text-lg font-serif mb-6 border-b pb-2">Related Articles</h4>
                                    <div className="space-y-6">
                                        {/* Placeholder for related blogs */}
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="group cursor-pointer">
                                                <div className="text-xs text-[hsl(var(--gold))] font-medium mb-1">Wildlife</div>
                                                <h5 className="font-medium group-hover:text-[hsl(var(--gold))] transition-colors line-clamp-2">The Secret Life of Tigers in the Wilderness</h5>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-8 bg-foreground rounded-3xl text-white text-center">
                                    <h4 className="text-xl font-serif mb-4">Book Your Stay</h4>
                                    <p className="text-white/60 text-sm mb-6">Experience the magic ourselves.</p>
                                    <Button className="w-full bg-[hsl(var(--gold))] text-white hover:bg-[hsl(var(--gold)/0.9)]" asChild>
                                        <Link to="/booking">Check Availability</Link>
                                    </Button>
                                </div>
                            </aside>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
