import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Award, Leaf, Heart } from "lucide-react";
import villaImage from "@/assets/villa-interior.jpg";
import safariImage from "@/assets/safari.jpg";
const values = [{
  icon: Leaf,
  title: "Sustainability",
  description: "Eco-conscious luxury that preserves nature"
}, {
  icon: Award,
  title: "Excellence",
  description: "Uncompromising attention to every detail"
}, {
  icon: Heart,
  title: "Authenticity",
  description: "Genuine connections with the wilderness"
}];
export function AboutSnippet() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-100px"
  });
  return <section ref={ref} className="py-24 md:py-32 lg:py-40 bg-background relative overflow-hidden">
    {/* Decorative Background */}
    <div className="absolute top-0 right-0 w-1/2 h-full opacity-[0.02]">
      <div className="absolute inset-0 bg-forest rounded-l-[200px]" />
    </div>

    <div className="luxury-container relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
        {/* Image Side */}
        <motion.div initial={{
          opacity: 0,
          x: -50
        }} animate={isInView ? {
          opacity: 1,
          x: 0
        } : {}} transition={{
          duration: 0.8
        }} className="relative">
          <div className="relative">
            {/* Main Image */}
            <div className="relative rounded-3xl overflow-hidden shadow-luxury">
              <div className="aspect-[4/5]">
                <img alt="Luxury villa interior at Jungle Heritage" className="w-full h-full object-cover" src="/lovable-uploads/c206c149-b410-4cff-9dba-6379ca7cf7bf.jpg" />
              </div>
            </div>

            {/* Floating Image */}
            <div className="absolute -bottom-10 right-0 lg:-right-16 w-32 md:w-56 rounded-2xl overflow-hidden shadow-luxury border-4 border-background">
              <div className="aspect-square">
                <img alt="Safari experience" className="w-full h-full object-cover" src="/lovable-uploads/04db6b7f-900e-467e-8f52-0039f279c3d4.jpg" />
              </div>
            </div>

            {/* Experience Badge */}
            <div className="absolute -top-6 left-0 lg:-left-10 bg-forest-deep text-ivory p-6 rounded-2xl shadow-luxury transform scale-75 md:scale-100 origin-top-left md:origin-center">
              <div className="text-center">
                <span className="block font-serif text-4xl font-semibold text-gold-light">10+</span>
                <span className="text-xs uppercase tracking-widest text-ivory/80">Years of<br />Excellence</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Side */}
        <motion.div initial={{
          opacity: 0,
          x: 50
        }} animate={isInView ? {
          opacity: 1,
          x: 0
        } : {}} transition={{
          duration: 0.8,
          delay: 0.2
        }}>
          <span className="inline-block px-5 py-2 border border-gold/30 rounded-full text-gold text-[11px] uppercase tracking-[0.25em] mb-6">
            Our Story
          </span>

          <h2 className="font-serif text-4xl md:text-5xl font-medium text-foreground tracking-tight leading-[1.15]">
            A Sanctuary Where
            <span className="block italic text-forest mt-1">Nature Inspires Luxury</span>
          </h2>

          <div className="w-20 h-[1px] bg-gradient-to-r from-gold to-transparent my-8" />

          <p className="text-muted-foreground text-lg leading-relaxed mb-6">
            Set in the untouched wilderness of Dudhwa, Jungle Heritage Resort offers a rare union of refined comfort and natural serenity. Every space is thoughtfully crafted to immerse you in the rhythms of the forest—while delivering the warmth, care, and sophistication of a world-class resort.
          </p>

          <p className="text-muted-foreground leading-relaxed mb-10">
            Every element of our resort has been thoughtfully designed to create an
            immersive experience that celebrates the natural beauty surrounding us,
            while providing the comfort and service expected of a world-class resort.
          </p>

          {/* Values */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            {values.map((value, index) => <motion.div key={value.title} initial={{
              opacity: 0,
              y: 20
            }} animate={isInView ? {
              opacity: 1,
              y: 0
            } : {}} transition={{
              duration: 0.6,
              delay: 0.4 + index * 0.1
            }} className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-forest/5 flex items-center justify-center">
                <value.icon className="w-5 h-5 text-gold" />
              </div>
              <h4 className="font-serif text-sm font-medium text-foreground mb-1">
                {value.title}
              </h4>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {value.description}
              </p>
            </motion.div>)}
          </div>

          {/* CTA */}
          <Link to="/about" className="group inline-flex items-center gap-3 text-forest font-medium hover:text-gold transition-colors">
            <span className="text-sm uppercase tracking-wider">Discover Our Story</span>
            <div className="w-10 h-10 rounded-full border border-current flex items-center justify-center group-hover:bg-gold group-hover:border-gold group-hover:text-ivory transition-all">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  </section>;
}