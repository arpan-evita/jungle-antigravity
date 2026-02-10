import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useReviews } from "@/hooks/useReviews";

// Fallback testimonials when no reviews in database
const fallbackTestimonials = [
  {
    id: "1",
    reviewer_name: "Priya & Rahul Sharma",
    reviewer_location: "New Delhi",
    occasion: "Anniversary Getaway",
    rating: 5,
    review_text: "An absolutely magical experience. The candlelight dinner by the pool, the early morning safari, and the impeccable service made our anniversary unforgettable. Jungle Heritage is a true gem hidden in the wilderness.",
  },
  {
    id: "2",
    reviewer_name: "The Mehta Family",
    reviewer_location: "Mumbai",
    occasion: "Family Vacation",
    rating: 5,
    review_text: "Our children are still talking about the safari! The resort handled everything perfectly - from kid-friendly activities to fine dining. A perfect balance of adventure and relaxation.",
  },
  {
    id: "3",
    reviewer_name: "Aditya Verma",
    reviewer_location: "Bangalore",
    occasion: "Corporate Gathering",
    rating: 5,
    review_text: "We hosted our leadership team offsite here and it exceeded all expectations. The serene environment fostered incredible discussions, and the team bonding activities were excellent.",
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function TestimonialsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const { data: reviews, isLoading } = useReviews();

  // Use fetched reviews or fallback
  const testimonials = reviews && reviews.length > 0 ? reviews : fallbackTestimonials;

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, testimonials.length]);

  // Reset index if testimonials change
  useEffect(() => {
    if (currentIndex >= testimonials.length) {
      setCurrentIndex(0);
    }
  }, [testimonials.length, currentIndex]);

  const handleManualNavigation = (direction: 'prev' | 'next') => {
    setIsAutoPlaying(false);
    if (direction === 'prev') prevTestimonial();
    else nextTestimonial();
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const currentTestimonial = testimonials[currentIndex];

  if (!currentTestimonial) return null;

  return (
    <section ref={ref} className="py-24 md:py-32 lg:py-40 bg-cream relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute top-1/4 right-0 w-[600px] h-[600px] rounded-full bg-forest blur-3xl" />
      </div>

      <div className="luxury-container relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-5 py-2 border border-gold/30 rounded-full text-gold text-[11px] uppercase tracking-[0.25em] mb-6">
            Guest Stories
          </span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-foreground tracking-tight">
            What Our Guests
            <span className="italic text-forest ml-3">Say</span>
          </h2>
        </motion.div>

        {/* Testimonial Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative bg-background rounded-3xl p-10 md:p-16 shadow-luxury border border-border/50">
            {/* Large Quote Mark */}
            <div className="absolute -top-4 left-10 md:left-16 text-gold/20 text-[120px] font-serif leading-none select-none">
              "
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {/* Stars */}
                <div className="flex items-center justify-center gap-1.5 mb-10">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-gold text-gold" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="font-serif text-xl md:text-2xl lg:text-3xl text-foreground text-center leading-relaxed mb-10 relative z-10">
                  {currentTestimonial.review_text}
                </blockquote>

                {/* Author */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-forest flex items-center justify-center text-ivory font-medium text-lg">
                    {getInitials(currentTestimonial.reviewer_name)}
                  </div>
                  <div className="text-center">
                    <p className="font-serif text-lg font-medium text-foreground">
                      {currentTestimonial.reviewer_name}
                    </p>
                    <p className="text-muted-foreground text-sm mt-1">
                      {[currentTestimonial.reviewer_location, currentTestimonial.occasion]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-6 mt-12">
              <button
                onClick={() => handleManualNavigation('prev')}
                className="w-12 h-12 rounded-full border border-border hover:border-gold hover:bg-gold/5 flex items-center justify-center transition-all group"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="w-5 h-5 text-foreground group-hover:text-gold transition-colors" />
              </button>

              <div className="flex items-center gap-2.5">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setIsAutoPlaying(false);
                      setCurrentIndex(i);
                      setTimeout(() => setIsAutoPlaying(true), 8000);
                    }}
                    className={`h-2 rounded-full transition-all duration-500 ${i === currentIndex
                        ? "w-8 bg-gold"
                        : "w-2 bg-border hover:bg-gold/50"
                      }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => handleManualNavigation('next')}
                className="w-12 h-12 rounded-full border border-border hover:border-gold hover:bg-gold/5 flex items-center justify-center transition-all group"
                aria-label="Next testimonial"
              >
                <ChevronRight className="w-5 h-5 text-foreground group-hover:text-gold transition-colors" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-8 md:gap-16 mt-16 text-muted-foreground"
        >
          <div className="text-center">
            <span className="block font-serif text-3xl font-medium text-foreground">500+</span>
            <span className="text-sm">Happy Guests</span>
          </div>
          <div className="w-px h-12 bg-border hidden md:block" />
          <div className="text-center">
            <span className="block font-serif text-3xl font-medium text-foreground">4.9/5</span>
            <span className="text-sm">Average Rating</span>
          </div>
          <div className="w-px h-12 bg-border hidden md:block" />
          <div className="text-center">
            <span className="block font-serif text-3xl font-medium text-foreground">98%</span>
            <span className="text-sm">Would Recommend</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
