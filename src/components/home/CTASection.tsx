import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, Calendar, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-resort.jpg";
export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: "-100px"
  });
  return <section ref={ref} className="relative py-32 md:py-40 lg:py-48 overflow-hidden">
    {/* Background */}
    <div className="absolute inset-0">
      <img src={heroImage} alt="Jungle Heritage Resort" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-forest-deep/90" />
      <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/50 via-transparent to-forest-deep/80" />
    </div>

    {/* Decorative Lines */}
    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

    {/* Content */}
    <div className="relative z-10 luxury-container">
      <div className="max-w-4xl mx-auto text-center">
        <motion.span initial={{
          opacity: 0,
          y: 20
        }} animate={isInView ? {
          opacity: 1,
          y: 0
        } : {}} transition={{
          duration: 0.8
        }} className="inline-block px-5 py-2 border border-gold/40 rounded-full text-gold-light text-[11px] uppercase tracking-[0.25em] mb-8">
          Begin Your Journey
        </motion.span>

        <motion.h2 initial={{
          opacity: 0,
          y: 30
        }} animate={isInView ? {
          opacity: 1,
          y: 0
        } : {}} transition={{
          duration: 0.8,
          delay: 0.1
        }} className="font-serif text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium text-ivory tracking-tight leading-[1.1]">
          Ready to Experience
          <span className="block italic text-gold-light mt-2">the Magic of Forest?</span>
        </motion.h2>

        <motion.div initial={{
          scaleX: 0
        }} animate={isInView ? {
          scaleX: 1
        } : {}} transition={{
          duration: 0.8,
          delay: 0.3
        }} className="w-24 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent mx-auto my-10" />

        <motion.p initial={{
          opacity: 0,
          y: 20
        }} animate={isInView ? {
          opacity: 1,
          y: 0
        } : {}} transition={{
          duration: 0.8,
          delay: 0.2
        }} className="text-ivory/80 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
          Book your stay today and discover a world where luxury meets wilderness.
          Our concierge team is ready to craft your perfect forest escape.
        </motion.p>

        <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={isInView ? {
          opacity: 1,
          y: 0
        } : {}} transition={{
          duration: 0.8,
          delay: 0.4
        }} className="flex flex-col sm:flex-row items-center justify-center gap-5 mt-12">
          <Button variant="luxury" size="xl" asChild className="min-w-[220px]">
            <Link to="/booking" className="flex items-center gap-3">
              <Calendar className="w-5 h-5" />
              Reserve Your Stay
            </Link>
          </Button>
          <Button variant="luxuryOutline" size="lg" asChild>
            <a target="_blank" rel="noopener noreferrer" className="flex items-center gap-2" href="https://wa.me/919250225752">
              <MessageCircle className="w-5 h-5" />
              WhatsApp Enquiry
            </a>
          </Button>
        </motion.div>

        {/* Contact Info */}
        <motion.div initial={{
          opacity: 0
        }} animate={isInView ? {
          opacity: 1
        } : {}} transition={{
          duration: 0.8,
          delay: 0.6
        }} className="flex flex-wrap items-center justify-center gap-8 mt-16 text-ivory/60">
          <a href="tel:+919999999999" className="flex items-center gap-2 hover:text-gold transition-colors">
            <Phone className="w-4 h-4" />
            <span>+91 9250225752</span>
          </a>
          <span className="hidden sm:block w-px h-4 bg-ivory/20" />
          <Link to="/contact" className="flex items-center gap-2 hover:text-gold transition-colors">
            <span>Get in Touch</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>
    </div>
  </section>;
}