import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Award, Leaf, Heart, Users, Shield, Star } from "lucide-react";
import villaImage from "@/assets/villa-interior.jpg";
import safariImage from "@/assets/safari.jpg";
import poolImage from "@/assets/pool.jpg";
const values = [{
  icon: Leaf,
  title: "Sustainability",
  description: "We are committed to eco-conscious luxury that preserves and protects the natural environment around us."
}, {
  icon: Award,
  title: "Excellence",
  description: "Every detail is carefully curated to deliver an unparalleled experience for our guests."
}, {
  icon: Heart,
  title: "Authenticity",
  description: "We foster genuine connections between our guests and the wilderness they came to experience."
}, {
  icon: Users,
  title: "Community",
  description: "We work closely with local communities, supporting livelihoods and cultural preservation."
}, {
  icon: Shield,
  title: "Conservation",
  description: "Active participation in wildlife conservation and habitat restoration programs."
}, {
  icon: Star,
  title: "Hospitality",
  description: "Warm, personalized service that makes every guest feel like family."
}];
const teamMembers = [{
  name: "Rajesh Sharma",
  role: "Founder & Managing Director",
  bio: "With over 25 years in hospitality and a deep passion for wildlife, Rajesh founded Jungle Heritage Resort to create a sanctuary where luxury meets nature."
}, {
  name: "Priya Verma",
  role: "General Manager",
  bio: "Priya brings 15 years of luxury resort management experience, ensuring every guest receives impeccable service."
}, {
  name: "Amit Kumar",
  role: "Head Naturalist",
  bio: "A certified wildlife expert with extensive knowledge of Dudhwa's flora and fauna, Amit leads our safari experiences."
}, {
  name: "Sunita Devi",
  role: "Executive Chef",
  bio: "Trained in both traditional Indian and international cuisines, Sunita crafts memorable dining experiences using local ingredients."
}];
const About = () => {
  const storyRef = useRef(null);
  const valuesRef = useRef(null);
  const teamRef = useRef(null);
  const storyInView = useInView(storyRef, {
    once: true,
    margin: "-100px"
  });
  const valuesInView = useInView(valuesRef, {
    once: true,
    margin: "-100px"
  });
  const teamInView = useInView(teamRef, {
    once: true,
    margin: "-100px"
  });
  return <div className="min-h-screen bg-background">
    <Header />
    <main>
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={poolImage} alt="Jungle Heritage Resort" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/70 via-forest-deep/50 to-forest-deep/80" />
        </div>
        <div className="relative z-10 text-center px-6">
          <motion.span initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.2
          }} className="inline-block px-5 py-2 border border-gold-light/30 rounded-full text-gold-light text-[11px] uppercase tracking-[0.25em] mb-6">
            Our Story
          </motion.span>
          <motion.h1 initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.3
          }} className="font-serif text-4xl md:text-6xl font-medium text-ivory tracking-tight">
            About Jungle Heritage
          </motion.h1>
          <motion.p initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.4
          }} className="mt-4 text-ivory/80 text-lg max-w-2xl mx-auto">
            A sanctuary where nature inspires luxury
          </motion.p>
        </div>
      </section>

      {/* Story Section */}
      <section ref={storyRef} className="py-24 md:py-32 bg-background">
        <div className="luxury-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div initial={{
              opacity: 0,
              x: -50
            }} animate={storyInView ? {
              opacity: 1,
              x: 0
            } : {}} transition={{
              duration: 0.8
            }} className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-luxury">
                <div className="aspect-[4/5]">
                  <img alt="Luxury villa interior" className="w-full h-full object-cover" src="/lovable-uploads/635adb9e-4da0-4e64-abac-7f40935860f8.jpg" />
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 lg:-right-16 w-40 md:w-56 rounded-2xl overflow-hidden shadow-luxury border-4 border-background">
                <div className="aspect-square">
                  <img src={safariImage} alt="Safari experience" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="absolute -top-6 -left-6 lg:-left-10 bg-forest-deep text-ivory p-6 rounded-2xl shadow-luxury">
                <div className="text-center">
                  <span className="block font-serif text-4xl font-semibold text-gold-light">10+</span>
                  <span className="text-xs uppercase tracking-widest text-ivory/80">Years of<br />Excellence</span>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{
              opacity: 0,
              x: 50
            }} animate={storyInView ? {
              opacity: 1,
              x: 0
            } : {}} transition={{
              duration: 0.8,
              delay: 0.2
            }}>
              <h2 className="font-serif text-4xl md:text-5xl font-medium text-foreground tracking-tight leading-[1.15]">
                Our Journey
                <span className="block italic text-forest mt-1">Began with a Vision</span>
              </h2>
              <div className="w-20 h-[1px] bg-gradient-to-r from-gold to-transparent my-8" />
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Tucked away in the tranquil forests of Dudhwa, Jungle Heritage Resort is a sanctuary where luxury and wilderness blend seamlessly. Designed for those who seek meaningful escapes, the resort offers an immersive experience in nature, without compromising on elegance or comfort.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Born from a passion for wildlife and deep-rooted love for the Terai landscape, Jungle Heritage has become a preferred destination for travelers who crave authenticity, serenity, and soul-stirring adventures.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We take pride in delivering curated stays, warm hospitality, and experiences that honor both the forest and the people who live in harmony with it.

                Where every stay tells a story, and every moment connects you to nature.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-forest-deep text-ivory">
        <div className="luxury-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div initial={{
              opacity: 0,
              y: 30
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6
            }} className="text-center md:text-left">
              <h3 className="font-serif text-2xl font-medium text-gold-light mb-4">Our Mission</h3>
              <p className="text-ivory/80 leading-relaxed">
                To craft immersive wilderness experiences that soothe the soul, honor the environment, and uplift local communities, all while delivering exceptional, personalized luxury in the heart of nature.
              </p>
            </motion.div>
            <motion.div initial={{
              opacity: 0,
              y: 30
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6,
              delay: 0.2
            }} className="text-center md:text-left">
              <h3 className="font-serif text-2xl font-medium text-gold-light mb-4">Our Vision</h3>
              <p className="text-ivory/80 leading-relaxed">
                To become India’s leading eco-luxury destination, setting benchmarks in sustainable tourism, wildlife conservation, and conscious hospitality that inspires every guest to reconnect with the wild and protect it.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section ref={valuesRef} className="py-24 md:py-32 bg-muted/30">
        <div className="luxury-container">
          <motion.div initial={{
            opacity: 0,
            y: 30
          }} animate={valuesInView ? {
            opacity: 1,
            y: 0
          } : {}} transition={{
            duration: 0.6
          }} className="text-center mb-16">
            <span className="inline-block px-5 py-2 border border-gold/30 rounded-full text-gold text-[11px] uppercase tracking-[0.25em] mb-6">
              What We Stand For
            </span>
            <h2 className="font-serif text-4xl md:text-5xl font-medium text-foreground tracking-tight">
              Our Core Values
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => <motion.div key={value.title} initial={{
              opacity: 0,
              y: 30
            }} animate={valuesInView ? {
              opacity: 1,
              y: 0
            } : {}} transition={{
              duration: 0.6,
              delay: index * 0.1
            }} className="bg-background p-8 rounded-2xl shadow-soft">
              <div className="w-14 h-14 rounded-full bg-forest/10 flex items-center justify-center mb-5">
                <value.icon className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-serif text-xl font-medium text-foreground mb-3">
                {value.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {value.description}
              </p>
            </motion.div>)}
          </div>
        </div>
      </section>

      {/* Team Section */}

    </main>
    <Footer />
  </div>;
};
export default About;