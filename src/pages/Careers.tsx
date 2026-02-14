import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import {
  Heart,
  Home,
  GraduationCap,
  Utensils,
  TreePine,
  Users,
  MapPin,
  Clock,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import safariImage from "@/assets/safari.jpg";

const benefits = [
  {
    icon: Home,
    title: "Accommodation",
    description: "Comfortable on-site housing for all full-time staff members",
  },
  {
    icon: Utensils,
    title: "Meals Provided",
    description: "Three nutritious meals daily from our resort kitchen",
  },
  {
    icon: GraduationCap,
    title: "Training & Growth",
    description: "Regular skill development programs and career advancement",
  },
  {
    icon: TreePine,
    title: "Nature Immersion",
    description: "Work in one of India's most beautiful wildlife destinations",
  },
  {
    icon: Users,
    title: "Team Culture",
    description: "Join a supportive, passionate team that feels like family",
  },
];

const positions = [
  {
    title: "Senior Naturalist",
    department: "Wildlife & Safari",
    type: "Full-time",
    location: "On-site",
    description: "Lead safari experiences and educate guests about Dudhwa's wildlife. Requires wildlife certification and 3+ years experience.",
  },
  {
    title: "Front Desk Executive",
    department: "Guest Services",
    type: "Full-time",
    location: "On-site",
    description: "Manage guest check-ins, inquiries, and reservations. Excellent communication skills and hospitality experience required.",
  },
  {
    title: "Sous Chef",
    department: "Food & Beverage",
    type: "Full-time",
    location: "On-site",
    description: "Assist in kitchen operations and menu planning. Culinary degree and 5+ years experience in fine dining preferred.",
  },
  {
    title: "Housekeeping Supervisor",
    department: "Housekeeping",
    type: "Full-time",
    location: "On-site",
    description: "Oversee housekeeping team and maintain resort standards. Previous supervisory experience in hospitality required.",
  },
];

const applicationSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().min(10, "Phone number must be at least 10 digits").max(15),
  position: z.string().min(1, "Please select a position"),
  experience: z.string().trim().min(1, "Please enter your experience").max(500),
  message: z.string().trim().max(1000).optional(),
});

const Careers = () => {
  const benefitsRef = useRef(null);
  const positionsRef = useRef(null);
  const formRef = useRef(null);
  const benefitsInView = useInView(benefitsRef, { once: true, margin: "-100px" });
  const positionsInView = useInView(positionsRef, { once: true, margin: "-100px" });
  const formInView = useInView(formRef, { once: true, margin: "-100px" });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    experience: "",
    message: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = applicationSchema.safeParse(formData);
    if (!validation.success) {
      toast({
        title: "Validation Error",
        description: validation.error.errors[0].message,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("enquiries").insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: `Career Application: ${formData.position}`,
        message: `Position: ${formData.position}\nExperience: ${formData.experience}\n\nAdditional Message: ${formData.message || "N/A"}`,
        category: "job_application",
      });

      if (error) throw error;

      // Send email notification
      await supabase.functions.invoke('send-notification-email', {
        body: {
          type: 'enquiry',
          data: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            subject: `Career Application: ${formData.position}`,
            message: `Position: ${formData.position}\nExperience: ${formData.experience}\n\nAdditional Message: ${formData.message || "N/A"}`,
            category: 'job_application'
          }
        }
      });

      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest. We'll review your application and get back to you soon.",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        position: "",
        experience: "",
        message: "",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={safariImage}
              alt="Join our team"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-forest-deep/70 via-forest-deep/50 to-forest-deep/80" />
          </div>
          <div className="relative z-10 text-center px-6">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block px-5 py-2 border border-gold-light/30 rounded-full text-gold-light text-[11px] uppercase tracking-[0.25em] mb-6"
            >
              Join Our Team
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-serif text-4xl md:text-6xl font-medium text-ivory tracking-tight"
            >
              Careers at Jungle Heritage
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-ivory/80 text-lg max-w-2xl mx-auto"
            >
              Build your career in one of India's most beautiful wildlife destinations
            </motion.p>
          </div>
        </section>

        {/* Benefits Section */}
        <section ref={benefitsRef} className="py-24 md:py-32 bg-background">
          <div className="luxury-container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <span className="inline-block px-5 py-2 border border-gold/30 rounded-full text-gold text-[11px] uppercase tracking-[0.25em] mb-6">
                Why Join Us
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-medium text-foreground tracking-tight">
                Employee Benefits
              </h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                We believe in taking care of our team as well as we take care of our guests
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={benefitsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-muted/30 p-8 rounded-2xl"
                >
                  <div className="w-14 h-14 rounded-full bg-forest/10 flex items-center justify-center mb-5">
                    <benefit.icon className="w-6 h-6 text-gold" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-foreground mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Positions Section */}
        <section ref={positionsRef} className="py-24 md:py-32 bg-muted/30">
          <div className="luxury-container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={positionsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <span className="inline-block px-5 py-2 border border-gold/30 rounded-full text-gold text-[11px] uppercase tracking-[0.25em] mb-6">
                Open Positions
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-medium text-foreground tracking-tight">
                Current Opportunities
              </h2>
            </motion.div>

            <div className="space-y-6">
              {positions.map((position, index) => (
                <motion.div
                  key={position.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={positionsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-background p-6 md:p-8 rounded-2xl shadow-soft"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-xl font-medium text-foreground">
                        {position.title}
                      </h3>
                      <p className="text-gold text-sm mt-1">{position.department}</p>
                      <div className="flex flex-wrap gap-4 mt-3">
                        <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                          <Clock className="w-4 h-4" />
                          {position.type}
                        </span>
                        <span className="flex items-center gap-1.5 text-muted-foreground text-sm">
                          <MapPin className="w-4 h-4" />
                          {position.location}
                        </span>
                      </div>
                      <p className="text-muted-foreground mt-4 leading-relaxed">
                        {position.description}
                      </p>
                    </div>
                    <Button
                      variant="luxuryDark"
                      className="md:shrink-0"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, position: position.title }));
                        formRef.current?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      Apply Now
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section ref={formRef} className="py-24 md:py-32 bg-background">
          <div className="luxury-container">
            <div className="max-w-2xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={formInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}
                className="text-center mb-12"
              >
                <span className="inline-block px-5 py-2 border border-gold/30 rounded-full text-gold text-[11px] uppercase tracking-[0.25em] mb-6">
                  Apply Now
                </span>
                <h2 className="font-serif text-4xl md:text-5xl font-medium text-foreground tracking-tight">
                  Submit Your Application
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Fill out the form below and we'll get back to you soon
                </p>
              </motion.div>

              <motion.form
                initial={{ opacity: 0, y: 30 }}
                animate={formInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 99999 99999"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position *</Label>
                    <Select
                      value={formData.position}
                      onValueChange={(value) => setFormData({ ...formData, position: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a position" />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((pos) => (
                          <SelectItem key={pos.title} value={pos.title}>
                            {pos.title}
                          </SelectItem>
                        ))}
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience">Relevant Experience *</Label>
                  <Textarea
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    placeholder="Briefly describe your relevant experience and qualifications..."
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Additional Message (Optional)</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Anything else you'd like us to know..."
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  variant="luxuryDark"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              </motion.form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Careers;
