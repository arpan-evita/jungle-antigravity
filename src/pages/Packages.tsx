import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePackages } from "@/hooks/usePackages";
import { Skeleton } from "@/components/ui/skeleton";

const Packages = () => {
  const { data: packages, isLoading } = usePackages();

  const formatPrice = (pkg: { price_modifier: number; is_percentage: boolean }) => {
    if (pkg.is_percentage) {
      return `${pkg.price_modifier}% off`;
    }
    return `₹${Number(pkg.price_modifier).toLocaleString("en-IN")}`;
  };

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
              <span className="luxury-label text-gold-light">Special Offers</span>
              <h1 className="luxury-heading text-ivory mt-4">
                Packages & Offers
              </h1>
              <p className="text-ivory/70 mt-4 max-w-2xl mx-auto">
                Curated packages designed for every occasion. From romantic getaways
                to family adventures, find the perfect way to experience Jungle Heritage.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Packages Section */}
        <section className="luxury-section bg-cream">
          <div className="luxury-container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="luxury-label">Our Offerings</span>
              <h2 className="luxury-heading text-foreground mt-4">Available Packages</h2>
            </motion.div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-6 space-y-3">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-6 w-2/3" />
                      <Skeleton className="h-8 w-1/2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : packages && packages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {packages.map((pkg, index) => (
                  <motion.div
                    key={pkg.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-luxury transition-shadow"
                  >
                    <div className="p-6">
                      <h3 className="font-serif text-xl text-foreground">{pkg.name}</h3>
                      {pkg.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {pkg.description}
                        </p>
                      )}
                      <div className="flex items-baseline gap-2 mt-4">
                        <span className="font-serif text-2xl font-semibold text-primary">
                          {formatPrice(pkg)}
                        </span>
                      </div>

                      {pkg.inclusions && pkg.inclusions.length > 0 && (
                        <ul className="space-y-2 mt-4 mb-6">
                          {pkg.inclusions.slice(0, 4).map((item, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm">
                              <Check className="w-4 h-4 text-gold shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                          {pkg.inclusions.length > 4 && (
                            <li className="text-sm text-muted-foreground">
                              +{pkg.inclusions.length - 4} more inclusions
                            </li>
                          )}
                        </ul>
                      )}

                      <Button variant="luxuryDark" className="w-full mt-4" asChild>
                        <Link to="/contact" className="flex items-center justify-center gap-2">
                          Enquire Now
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No packages available at the moment.</p>
                <p className="text-sm text-muted-foreground mt-2">Please check back later for our special offers.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Packages;
