import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Home, Compass, Heart, TreePine, Utensils, Shield } from "lucide-react";

const highlights = [{
  icon: Home,
  title: "Luxury Villas",
  description: "Elegantly designed forest villas with private decks and panoramic views"
}, {
  icon: Compass,
  title: "Jungle Safari",
  description: "Exclusive wildlife safaris with expert naturalists into Dudhwa"
}, {
  icon: Heart,
  title: "Couples Welcome",
  description: "Unmarried couples are welcome. We provide a safe, private, and romantic environment for all our guests."
}, {
  icon: TreePine,
  title: "Nature Walks",
  description: "Guided nature trails and authentic wilderness adventures"
}, {
  icon: Utensils,
  title: "Fine Dining",
  description: "Curated culinary experiences with farm-to-table cuisine"
}, {
  icon: Shield,
  title: "Private & Secure",
  description: "Complete privacy with 24/7 security and discreet service"
}];

const containerVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 30
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const
    }
  }
};

export function HighlightsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-100px"
  });

  return (
    <section ref={ref} className="py-24 md:py-32 lg:py-40 bg-cream relative overflow-hidden">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-forest blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-gold blur-3xl" />
      </div>

      <div className="luxury-container relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-5 py-2 border border-gold/30 rounded-full text-gold text-[11px] uppercase tracking-[0.25em] mb-6">
            The Jungle Heritage Experience
          </span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-foreground tracking-tight leading-[1.1]">
            Curated for the
            <span className="block italic text-forest mt-1">Discerning Traveler</span>
          </h2>
          <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mt-8" />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-4"
        >
          {highlights.map((item) => (
            <motion.div
              key={item.title}
              variants={itemVariants}
              className="group text-center p-6 lg:p-4 rounded-2xl hover:bg-background transition-all duration-500"
            >
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-forest/5 border border-forest/10 flex items-center justify-center group-hover:bg-forest group-hover:border-forest transition-all duration-500 group-hover:scale-110">
                <item.icon className="w-7 h-7 text-gold group-hover:text-ivory transition-colors duration-500" />
              </div>
              <h3 className="font-serif text-lg font-medium text-foreground mb-2 group-hover:text-forest transition-colors">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
