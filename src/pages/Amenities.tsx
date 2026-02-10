import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import {
  Dumbbell,
  UtensilsCrossed,
  Wifi,
  Car,
  Stethoscope,
  PawPrint,
  Heart,
} from "lucide-react";
import poolImage from "@/assets/pool.jpg";

const amenities = [
  {
    icon: Dumbbell,
    title: "Fitness Center",
    description:
      "A fully-equipped gym with modern equipment, open 24/7 for guests who wish to maintain their fitness routine while on vacation.",
  },
  {
    icon: UtensilsCrossed,
    title: "Restaurant & Bar",
    description:
      "Jungle Heritage, our signature restaurant, serves global cuisine with locally-sourced ingredients. The bar offers premium spirits and forest-inspired cocktails.",
  },
  {
    icon: Wifi,
    title: "High-Speed WiFi",
    description:
      "Complimentary high-speed internet throughout the property. Stay connected while you disconnect from the everyday world.",
  },
  {
    icon: Car,
    title: "Valet Parking",
    description:
      "Secure, complimentary parking for all guests. Airport transfers and local transportation can be arranged upon request.",
  },
  {
    icon: Stethoscope,
    title: "Doctor on Call",
    description:
      "Round-the-clock medical assistance available. A qualified doctor and first-aid facilities are always accessible for emergencies.",
  },
  {
    icon: PawPrint,
    title: "Pet Friendly",
    description:
      "We welcome your furry companions. Select accommodations are pet-friendly with special amenities for your four-legged friends.",
  },
  {
    icon: Heart,
    title: "Couple Friendly",
    description:
      "Unmarried couples are welcome. We provide a safe, private, and romantic environment for all our guests.",
  },
];

const Amenities = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={poolImage}
              alt="Jungle Heritage Resort Pool"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-forest-deep/80" />
          </div>
          <div className="relative luxury-container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <span className="luxury-label text-gold-light">Facilities</span>
              <h1 className="luxury-heading text-ivory mt-4">
                Resort Amenities
              </h1>
              <p className="text-ivory/70 mt-4 max-w-2xl mx-auto">
                Every detail at Jungle Heritage is designed to enhance your comfort and create
                memorable experiences. Discover our world-class facilities.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Amenities Grid */}
        <section className="luxury-section">
          <div className="luxury-container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {amenities.map((amenity, index) => (
                <motion.div
                  key={amenity.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="group p-8 bg-card rounded-2xl border border-border hover:shadow-luxury transition-all duration-500"
                >
                  <div className="w-14 h-14 rounded-full bg-forest/5 flex items-center justify-center mb-6 group-hover:bg-forest transition-colors duration-500">
                    <amenity.icon className="w-6 h-6 text-gold group-hover:text-ivory transition-colors duration-500" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-foreground mb-3">
                    {amenity.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {amenity.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Amenities;
