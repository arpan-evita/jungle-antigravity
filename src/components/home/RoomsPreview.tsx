import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoomCategories } from "@/hooks/useRoomCategories";
import placeholderImage from "/placeholder.svg";

export function RoomsPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { data: rooms = [], isLoading } = useRoomCategories(3);

  const formatOccupancy = (adults: number, children: number) => {
    let text = `${adults} Adult${adults > 1 ? "s" : ""}`;
    if (children > 0) {
      text += ` + ${children} Child${children > 1 ? "ren" : ""}`;
    }
    return text;
  };

  const getFirstAmenity = (amenities: string[] | null) => {
    if (!amenities || amenities.length === 0) return "Luxury Accommodation";
    return amenities[0];
  };

  const getRoomImage = (images: string[] | null) => {
    if (!images || images.length === 0) return placeholderImage;
    return images[0];
  };

  return (
    <section ref={ref} className="py-24 md:py-32 lg:py-40 bg-forest-deep relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold/20 to-transparent" />

      <div className="luxury-container relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 lg:mb-20"
        >
          <span className="inline-block px-5 py-2 border border-gold/30 rounded-full text-gold-light text-[11px] uppercase tracking-[0.25em] mb-6">
            Accommodations
          </span>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-medium text-ivory tracking-tight leading-[1.1]">
            Our
            <span className="italic text-gold-light ml-3">Signature Escapes</span>
          </h2>
          <p className="text-ivory/60 mt-6 max-w-2xl mx-auto text-lg leading-relaxed">
            Each accommodation is thoughtfully designed to immerse you in nature
            while providing the utmost comfort and luxury.
          </p>
          <div className="w-20 h-[1px] bg-gradient-to-r from-transparent via-gold/50 to-transparent mx-auto mt-8" />
        </motion.div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-3xl bg-forest/50 overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full bg-ivory/10" />
                <div className="p-6 lg:p-8 space-y-4">
                  <Skeleton className="h-4 w-24 bg-ivory/10" />
                  <Skeleton className="h-8 w-48 bg-ivory/10" />
                  <Skeleton className="h-4 w-32 bg-ivory/10" />
                </div>
              </div>
            ))
          ) : rooms.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-ivory/60">No rooms available at the moment.</p>
            </div>
          ) : (
            rooms.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.15 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-3xl bg-forest/50 backdrop-blur-sm border border-ivory/5">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={getRoomImage(room.images)}
                      alt={room.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-transparent to-transparent" />

                    {/* Price Badge */}
                    <div className="absolute top-5 right-5 bg-ivory/95 backdrop-blur-md rounded-xl px-4 py-3 text-center shadow-luxury">
                      <div className="flex items-baseline gap-1">
                        <span className="font-serif text-2xl font-semibold text-forest-deep">
                          ₹{room.base_price_per_night.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">per night</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 lg:p-8">
                    {room.description && (
                      <span className="text-gold-light text-sm italic font-serif line-clamp-1">
                        {room.description.slice(0, 50)}...
                      </span>
                    )}
                    <h3 className="font-serif text-2xl md:text-3xl font-medium text-ivory mt-2 group-hover:text-gold-light transition-colors">
                      {room.name}
                    </h3>

                    {/* Details */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-5 text-ivory/60 text-sm">
                      <span className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gold" />
                        {formatOccupancy(room.max_adults, room.max_children)}
                      </span>
                    </div>

                    {/* Highlight Badge */}
                    <div className="flex items-center gap-2 mt-5 text-gold-light text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span>{getFirstAmenity(room.amenities)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-6 pt-6 border-t border-ivory/10">
                      <Button variant="luxury" size="sm" asChild className="flex-1">
                        <Link to="/booking">Book Now</Link>
                      </Button>
                      <Link
                        to={`/rooms/${room.slug}`}
                        className="flex items-center gap-2 text-ivory/60 hover:text-gold text-sm transition-colors"
                      >
                        Details
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-16"
        >
          <Button variant="luxuryOutline" size="lg" asChild>
            <Link to="/rooms" className="flex items-center gap-3">
              View All Accommodations
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
