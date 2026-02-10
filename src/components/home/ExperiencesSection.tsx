import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useExperiences } from "@/hooks/useExperiences";
import { Skeleton } from "@/components/ui/skeleton";
export function ExperiencesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-100px"
  });
  const {
    data: experiences,
    isLoading
  } = useExperiences();

  // Take first 4 experiences for the home page
  const displayExperiences = experiences?.slice(0, 4) || [];
  return <section ref={ref} className="py-24 md:py-32 lg:py-40 bg-background relative">
    <div className="luxury-container">
      {/* Header */}
      <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={isInView ? {
        opacity: 1,
        y: 0
      } : {}} transition={{
        duration: 0.8
      }} className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
        <div className="max-w-2xl">
          <span className="inline-block px-5 py-2 border border-gold/30 rounded-full text-gold text-[11px] uppercase tracking-[0.25em] mb-6">
            Unforgettable Moments
          </span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-foreground tracking-tight leading-[1.1]">
            Curated
            <span className="italic text-forest ml-3">Experiences</span>
          </h2>
          <p className="text-muted-foreground mt-6 text-lg leading-relaxed max-w-xl">
            Every moment at Jungle Heritage is crafted to create memories that last a lifetime. From thrilling safaris to serene nature experiences.
          </p>
        </div>
        <Link to="/experiences" className="group flex items-center gap-3 text-forest hover:text-gold transition-colors font-medium self-start lg:self-auto">
          <span className="text-sm uppercase tracking-wider">Explore All</span>
          <div className="w-10 h-10 rounded-full border border-current flex items-center justify-center group-hover:bg-gold group-hover:border-gold group-hover:text-ivory transition-all">
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </motion.div>

      {/* Loading State */}
      {isLoading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8">
        <div className="lg:col-span-7">
          <Skeleton className="aspect-[4/3] lg:aspect-[16/12] w-full rounded-3xl" />
        </div>
        <div className="lg:col-span-5 flex flex-col gap-6">
          {[1, 2, 3].map(i => <div key={i} className="flex gap-5 items-center p-4">
            <Skeleton className="w-28 h-28 md:w-32 md:h-32 rounded-2xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>)}
        </div>
      </div> : displayExperiences.length === 0 ? <div className="text-center py-16">
        <p className="text-muted-foreground">No experiences available yet.</p>
      </div> : (/* Experience Grid - Asymmetric Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Large Featured Card */}
          {displayExperiences[0] && <motion.div initial={{
            opacity: 0,
            y: 40
          }} animate={isInView ? {
            opacity: 1,
            y: 0
          } : {}} transition={{
            duration: 0.8,
            delay: 0.2
          }} className="lg:col-span-7 group">
            <Link to={`/experiences/${displayExperiences[0].slug}`} className="block">
              <div className="relative overflow-hidden rounded-3xl aspect-[4/3] lg:aspect-[16/12]">
                {displayExperiences[0].image_url ? <img src={displayExperiences[0].image_url} alt={displayExperiences[0].name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" /> : <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">No Image</span>
                </div>}
                <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/80 via-forest-deep/20 to-transparent" />

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-10">
                  <span className="inline-block px-4 py-1.5 bg-gold/20 backdrop-blur-sm rounded-full text-gold-light text-xs uppercase tracking-widest mb-4">
                    {displayExperiences[0].subtitle || "Experience"}
                  </span>
                  <h3 className="font-serif text-3xl lg:text-4xl font-medium text-ivory mb-3 group-hover:text-gold-light transition-colors">
                    {displayExperiences[0].name}
                  </h3>
                  <p className="text-ivory/80 text-base leading-relaxed max-w-md">
                    {displayExperiences[0].description || "Discover this unique experience."}
                  </p>
                  <div className="flex items-center gap-2 mt-6 text-gold-light text-sm font-medium">
                    <span>Discover More</span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>}

          {/* Stacked Cards */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:gap-8">
            {displayExperiences.slice(1).map((experience, index) => <motion.div key={experience.id} initial={{
              opacity: 0,
              y: 40
            }} animate={isInView ? {
              opacity: 1,
              y: 0
            } : {}} transition={{
              duration: 0.8,
              delay: 0.3 + index * 0.1
            }} className="group">
              <Link to={`/experiences/${experience.slug}`} className="flex gap-5 items-center p-4 rounded-2xl hover:bg-cream transition-all duration-300">
                <div className="relative overflow-hidden rounded-2xl w-28 h-28 md:w-32 md:h-32 flex-shrink-0">
                  {experience.image_url ? <img src={experience.image_url} alt={experience.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" /> : <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-xs">No Image</span>
                  </div>}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-gold text-xs uppercase tracking-widest font-medium">
                    {experience.subtitle || "Experience"}
                  </span>
                  <h3 className="font-serif text-xl md:text-2xl font-medium text-foreground mt-1 group-hover:text-forest transition-colors">
                    {experience.name}
                  </h3>
                  <p className="text-muted-foreground text-sm mt-2 line-clamp-2 leading-relaxed">
                    {experience.description || "Discover this unique experience."}
                  </p>
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-gold flex-shrink-0 transition-colors" />
              </Link>
            </motion.div>)}
          </div>
        </div>)}
    </div>
  </section>;
}