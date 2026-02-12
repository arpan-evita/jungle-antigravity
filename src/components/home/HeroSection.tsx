import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronDown, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import heroImage from "@/assets/hero-lake-view.jpg";
import safariImage from "@/assets/WhatsApp Image 2026-01-26 at 8.56.54 PM (1).jpeg";
import villaImage from "@/assets/hero-villa-interior.jpg";
import poolImage from "@/assets/hero-pool-side.jpg";
const slides = [{
  image: heroImage,
  label: "A Luxury Forest Escape",
  title: "Where Wilderness",
  titleAccent: "Meets Luxury",
  description: "Discover an exclusive sanctuary nestled in the heart of Dudhwa's pristine forests."
}, {
  image: safariImage,
  label: "Wildlife Adventures",
  title: "Into the Wild",
  titleAccent: "Dudhwa Safari",
  description: "Witness majestic tigers, one-horned rhinos, and exotic wildlife in their natural habitat."
}, {
  image: villaImage,
  label: "Premium Accommodations",
  title: "Elegance in",
  titleAccent: "Every Detail",
  description: "Luxuriously appointed villas designed for the discerning traveler."
}, {
  image: poolImage,
  label: "Relaxation Redefined",
  title: "Relaxation",
  titleAccent: "Redefined",
  description: "Lounge at our infinity pool as the sun sets over the forest, embracing serene luxury at Jungle Heritage Resort."
}];
export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const nextSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  }, []);
  const prevSlide = useCallback(() => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  }, []);
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);
  const handleManualNavigation = (direction: 'prev' | 'next' | number) => {
    setIsAutoPlaying(false);
    if (direction === 'prev') prevSlide(); else if (direction === 'next') nextSlide(); else setCurrentSlide(direction);
    // Resume autoplay after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };
  return <section className="relative h-screen min-h-[800px] flex items-center justify-center overflow-hidden">
    {/* Background Image Slider */}
    <AnimatePresence mode="wait">
      <motion.div key={currentSlide} initial={{
        opacity: 0,
        scale: 1.1
      }} animate={{
        opacity: 1,
        scale: 1
      }} exit={{
        opacity: 0
      }} transition={{
        duration: 1.2,
        ease: [0.43, 0.13, 0.23, 0.96]
      }} className="absolute inset-0">
        <img src={slides[currentSlide].image} alt={slides[currentSlide].title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/50 via-forest-deep/20 to-forest-deep/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/40 via-transparent to-forest-deep/40" />
      </motion.div>
    </AnimatePresence>

    {/* Decorative Elements */}
    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-forest-deep/30 to-transparent z-10" />
    <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-forest-deep/60 to-transparent z-10" />

    {/* Content */}
    <div className="relative z-20 luxury-container text-center text-ivory">
      <AnimatePresence mode="wait">
        <motion.div key={currentSlide} initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} transition={{
          duration: 0.6
        }} className="flex flex-col items-center">
          <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8,
            delay: 0.2
          }} className="mb-8">
            <span className="inline-block px-6 py-2 border border-gold/40 rounded-full text-gold-light text-xs uppercase tracking-[0.3em] backdrop-blur-sm bg-forest-deep/20">
              {slides[currentSlide].label}
            </span>
          </motion.div>

          <motion.h1 initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8,
            delay: 0.4
          }} className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium leading-[1.1] mb-6 max-w-5xl mx-auto tracking-tight">
            {slides[currentSlide].title}
            <span className="block italic text-gold-light mt-2 font-normal">
              {slides[currentSlide].titleAccent}
            </span>
          </motion.h1>

          <motion.div initial={{
            scaleX: 0
          }} animate={{
            scaleX: 1
          }} transition={{
            duration: 0.8,
            delay: 0.6
          }} className="w-24 h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent mb-8" />

          <motion.p initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8,
            delay: 0.7
          }} className="text-lg md:text-xl text-ivory/90 max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            {slides[currentSlide].description}
          </motion.p>

          <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8,
            delay: 0.9
          }} className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Button variant="luxury" size="xl" asChild className="min-w-[200px]">
              <Link to="/booking">Reserve Your Escape</Link>
            </Button>
            <Button variant="luxuryOutline" size="lg" asChild>
              <a target="_blank" rel="noopener noreferrer" className="flex items-center gap-2" href="https://wa.me/919250225752">
                <MessageCircle className="w-5 h-5" />
                Enquire Now
              </a>
            </Button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>

    {/* Slide Navigation Arrows */}
    <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30">
      <button onClick={() => handleManualNavigation('prev')} className="group w-12 h-12 md:w-14 md:h-14 rounded-full border border-ivory/30 hover:border-gold hover:bg-gold/10 flex items-center justify-center transition-all duration-300 backdrop-blur-sm" aria-label="Previous slide">
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-ivory/70 group-hover:text-gold transition-colors" />
      </button>
    </div>
    <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30">
      <button onClick={() => handleManualNavigation('next')} className="group w-12 h-12 md:w-14 md:h-14 rounded-full border border-ivory/30 hover:border-gold hover:bg-gold/10 flex items-center justify-center transition-all duration-300 backdrop-blur-sm" aria-label="Next slide">
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-ivory/70 group-hover:text-gold transition-colors" />
      </button>
    </div>

    {/* Slide Indicators */}
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
      {slides.map((_, index) => <button key={index} onClick={() => handleManualNavigation(index)} className={`relative h-1 rounded-full transition-all duration-500 overflow-hidden ${index === currentSlide ? "w-12 bg-gold" : "w-6 bg-ivory/30 hover:bg-ivory/50"}`} aria-label={`Go to slide ${index + 1}`}>
        {index === currentSlide && isAutoPlaying && <motion.div initial={{
          scaleX: 0
        }} animate={{
          scaleX: 1
        }} transition={{
          duration: 6,
          ease: "linear"
        }} className="absolute inset-0 bg-gold-light origin-left" />}
      </button>)}
    </div>

    {/* Scroll Indicator */}
    <motion.div initial={{
      opacity: 0
    }} animate={{
      opacity: 1
    }} transition={{
      delay: 1.5
    }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
      <motion.div animate={{
        y: [0, 8, 0]
      }} transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }} className="flex flex-col items-center gap-3 text-ivory/50">
        <span className="text-[10px] uppercase tracking-[0.25em] font-light">Scroll to Explore</span>
        <ChevronDown className="w-4 h-4" />
      </motion.div>
    </motion.div>

    {/* Side Text */}
    <div className="absolute left-8 bottom-32 z-20 hidden xl:block">
      <div className="flex items-center gap-4">
        <div className="w-16 h-[1px] bg-ivory/30" />
        <span className="text-ivory/40 text-xs uppercase tracking-[0.2em] font-light">
          Est. 2014
        </span>
      </div>
    </div>
    <div className="absolute right-8 bottom-32 z-20 hidden xl:block">
      <div className="flex items-center gap-4">
        <span className="text-ivory/40 text-xs uppercase tracking-[0.2em] font-light">
          Dudhwa, India
        </span>
        <div className="w-16 h-[1px] bg-ivory/30" />
      </div>
    </div>
  </section>;
}
