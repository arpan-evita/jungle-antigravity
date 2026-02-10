import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useExperiences } from "@/hooks/useExperiences";
import { Skeleton } from "@/components/ui/skeleton";

const Experiences = () => {
  const { data: experiences, isLoading } = useExperiences();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 bg-forest-deep">
          <div className="luxury-container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <span className="luxury-label text-gold-light">Discover</span>
              <h1 className="luxury-heading text-ivory mt-4">
                Curated Experiences
              </h1>
              <p className="text-ivory/70 mt-4 max-w-2xl mx-auto">
                Every moment at Jungle Heritage is an opportunity for discovery. From thrilling
                wildlife safaris to romantic dining under the stars, we've curated
                experiences that create lasting memories.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Experiences Grid */}
        <section className="luxury-section">
          <div className="luxury-container">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : experiences?.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-muted-foreground text-lg">
                  No experiences available at the moment. Check back soon!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {experiences?.map((experience, index) => (
                  <motion.div
                    key={experience.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group"
                  >
                    <Link to={`/experiences/${experience.slug}`}>
                      <div className="relative overflow-hidden rounded-2xl image-zoom mb-6">
                        <div className="aspect-[4/5]">
                          {experience.image_url ? (
                            <img
                              src={experience.image_url}
                              alt={experience.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground">No Image</span>
                            </div>
                          )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/80 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <span className="text-gold-light text-xs uppercase tracking-widest">
                            {experience.subtitle || "Experience"}
                          </span>
                          <h3 className="font-serif text-2xl text-ivory mt-1 group-hover:text-gold-light transition-colors">
                            {experience.name}
                          </h3>
                        </div>
                      </div>
                    </Link>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {experience.description || "Discover this unique experience at Jungle Heritage."}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-foreground">
                      {experience.duration && (
                        <span className="flex items-center gap-1">
                          <span className="text-gold">●</span>
                          {experience.duration}
                        </span>
                      )}
                      {experience.best_time && (
                        <span className="flex items-center gap-1">
                          <span className="text-gold">●</span>
                          {experience.best_time}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Experiences;
