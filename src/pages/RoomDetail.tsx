import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Users, ArrowLeft, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoomCategory } from "@/hooks/useRoomCategory";
import { useState } from "react";
import placeholderImage from "/placeholder.svg";

const RoomDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: room, isLoading, error } = useRoomCategory(slug);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const formatOccupancy = (adults: number, children: number) => {
    let text = `${adults} Adult${adults > 1 ? "s" : ""}`;
    if (children > 0) {
      text += ` + ${children} Child${children > 1 ? "ren" : ""}`;
    }
    return text;
  };

  const images = room?.images && room.images.length > 0 ? room.images : [placeholderImage];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-20">
          <div className="luxury-container text-center">
            <h1 className="text-2xl font-serif text-foreground mb-4">Room Not Found</h1>
            <p className="text-muted-foreground mb-8">
              The room you're looking for doesn't exist or is no longer available.
            </p>
            <Button variant="luxuryDark" asChild>
              <Link to="/rooms">View All Rooms</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section with Image Gallery */}
        <section className="relative pt-24 md:pt-32">
          {isLoading ? (
            <Skeleton className="w-full h-[50vh] md:h-[70vh]" />
          ) : (
            <div className="relative w-full h-[50vh] md:h-[70vh] overflow-hidden">
              <motion.img
                key={currentImageIndex}
                src={images[currentImageIndex]}
                alt={`${room?.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/80 via-transparent to-forest-deep/30" />

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-ivory/20 backdrop-blur-sm border border-ivory/30 flex items-center justify-center text-ivory hover:bg-ivory/30 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-ivory/20 backdrop-blur-sm border border-ivory/30 flex items-center justify-center text-ivory hover:bg-ivory/30 transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Image Indicators */}
              {images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentImageIndex
                          ? "bg-gold w-8"
                          : "bg-ivory/50 hover:bg-ivory/80"
                        }`}
                    />
                  ))}
                </div>
              )}

              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="absolute top-6 left-4 md:left-8 flex items-center gap-2 text-ivory/80 hover:text-ivory transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back</span>
              </button>

              {/* Room Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                <div className="luxury-container">
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <span className="luxury-label text-gold-light">Accommodation</span>
                    <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl font-medium text-ivory mt-2">
                      {room?.name}
                    </h1>
                  </motion.div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Room Details Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="luxury-container">
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-6">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-32 w-full" />
                  <Skeleton className="h-6 w-32" />
                </div>
                <div>
                  <Skeleton className="h-64 w-full rounded-2xl" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="lg:col-span-2"
                >
                  {/* Description */}
                  <div className="mb-10">
                    <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground mb-4">
                      About This Accommodation
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      {room?.description ||
                        `Experience the ultimate luxury in our ${room?.name}. Nestled within the heart of the forest, this accommodation offers a perfect blend of comfort and nature. Wake up to the sounds of birdsong and fall asleep under a canopy of stars.`}
                    </p>
                  </div>

                  {/* Occupancy */}
                  <div className="mb-10">
                    <h3 className="font-serif text-xl font-medium text-foreground mb-4">
                      Room Capacity
                    </h3>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Users className="w-5 h-5 text-gold" />
                      <span>{formatOccupancy(room?.max_adults || 2, room?.max_children || 0)}</span>
                    </div>
                  </div>

                  {/* Amenities */}
                  {room?.amenities && room.amenities.length > 0 && (
                    <div>
                      <h3 className="font-serif text-xl font-medium text-foreground mb-6">
                        Amenities & Features
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {room.amenities.map((amenity, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                            className="flex items-center gap-3"
                          >
                            <div className="w-6 h-6 rounded-full bg-gold/10 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-gold" />
                            </div>
                            <span className="text-foreground">{amenity}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Booking Card */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <div className="sticky top-32 bg-card border border-border rounded-2xl p-6 md:p-8 shadow-luxury">
                    <div className="text-center mb-6">
                      <span className="text-muted-foreground text-sm">Starting from</span>
                      <div className="flex items-baseline justify-center gap-1 mt-1">
                        <span className="font-serif text-4xl font-semibold text-foreground">
                          ₹{room?.base_price_per_night.toLocaleString("en-IN")}
                        </span>
                        <span className="text-muted-foreground">/night</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Button variant="luxury" size="lg" className="w-full" asChild>
                        <Link to="/booking">Book Now</Link>
                      </Button>
                      <Button variant="outline" size="lg" className="w-full" asChild>
                        <Link to="/contact">Enquire</Link>
                      </Button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-border">
                      <p className="text-center text-sm text-muted-foreground">
                        Free cancellation up to 48 hours before check-in
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </section>

        {/* Image Gallery Grid */}
        {!isLoading && images.length > 1 && (
          <section className="pb-16 md:pb-24 bg-background">
            <div className="luxury-container">
              <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground mb-8">
                Gallery
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-xl overflow-hidden relative group ${index === currentImageIndex ? "ring-2 ring-gold" : ""
                      }`}
                  >
                    <img
                      src={image}
                      alt={`${room?.name} - Gallery ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-forest-deep/0 group-hover:bg-forest-deep/20 transition-colors" />
                  </motion.button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-forest-deep">
          <div className="luxury-container text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="font-serif text-3xl md:text-4xl font-medium text-ivory mb-4">
                Ready to Experience Luxury?
              </h2>
              <p className="text-ivory/70 mb-8 max-w-xl mx-auto">
                Book your stay and immerse yourself in the tranquility of our forest resort.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="luxury" size="lg" asChild>
                  <Link to="/booking">Reserve Your Stay</Link>
                </Button>
                <Button variant="luxuryOutline" size="lg" asChild>
                  <Link to="/rooms">Explore Other Rooms</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default RoomDetail;