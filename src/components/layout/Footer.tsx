import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Instagram, Facebook, MessageCircle } from "lucide-react";
import logoImage from "@/assets/logo.png";
const PHONE_NUMBER = "9250225752";
const quickLinks = [{
  name: "Rooms & Villas",
  path: "/rooms"
}, {
  name: "Experiences",
  path: "/experiences"
}, {
  name: "Amenities",
  path: "/amenities"
}, {
  name: "Packages & Offers",
  path: "/packages"
}, {
  name: "Gallery",
  path: "/gallery"
}, {
  name: "About Us",
  path: "/about"
}, {
  name: "Careers",
  path: "/careers"
}, {
  name: "Contact Us",
  path: "/contact"
}];
const experienceLinks = [{
  name: "Jungle Safari",
  path: "/experiences"
}, {
  name: "Nature Walk",
  path: "/experiences"
}, {
  name: "Bird Watching",
  path: "/experiences"
}, {
  name: "Candlelight Dinner",
  path: "/experiences"
}, {
  name: "Weddings & Events",
  path: "/weddings"
}];
export function Footer() {
  return <footer className="bg-forest-deep text-ivory">
    {/* Main Footer */}
    <div className="luxury-container py-16 md:py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
        {/* Brand Column */}
        <div className="lg:col-span-1">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <img src={logoImage} alt="Jungle Heritage Resort" className="h-16 w-auto" />
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-semibold tracking-tight">
                Jungle Heritage
              </span>
              <span className="font-serif text-sm italic text-gold-light">
                Jagdevpur (Bhira)
              </span>
            </div>
          </Link>
          <p className="text-ivory/70 text-sm leading-relaxed mb-6">
            A sanctuary where luxury meets wilderness. Experience the magic of
            untouched forests, exotic wildlife, and unparalleled hospitality.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://www.instagram.com/jungleheritage/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-ivory/20 flex items-center justify-center hover:bg-gold hover:border-gold transition-all duration-300" aria-label="Instagram">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="https://www.facebook.com/jungleheritage" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-ivory/20 flex items-center justify-center hover:bg-gold hover:border-gold transition-all duration-300" aria-label="Facebook">
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-serif text-lg font-medium mb-6">Quick Links</h4>
          <ul className="space-y-3">
            {quickLinks.map(link => <li key={link.path}>
              <Link to={link.path} className="text-ivory/70 hover:text-gold transition-colors duration-300 text-sm">
                {link.name}
              </Link>
            </li>)}
          </ul>
        </div>

        {/* Experiences */}
        <div>
          <h4 className="font-serif text-lg font-medium mb-6">Experiences</h4>
          <ul className="space-y-3">
            {experienceLinks.map(link => <li key={link.name}>
              <Link to={link.path} className="text-ivory/70 hover:text-gold transition-colors duration-300 text-sm">
                {link.name}
              </Link>
            </li>)}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-serif text-lg font-medium mb-6">Contact Us</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gold shrink-0 mt-0.5" />
              <span className="text-ivory/70 text-sm">
                Jungle Heritage Resort, Bhira,<br />
                Jagdevpur, Uttar Pradesh 262901
              </span>
            </li>
            <li>
              <a href={`tel:+91${PHONE_NUMBER}`} className="flex items-center gap-3 text-ivory/70 hover:text-gold transition-colors duration-300">
                <Phone className="w-5 h-5 text-gold shrink-0" />
                <span className="text-sm">+91 {PHONE_NUMBER}</span>
              </a>
            </li>
            <li>
              <a href="mailto:reservations@jungleheritage.com" className="flex items-center gap-3 text-ivory/70 hover:text-gold transition-colors duration-300">
                <Mail className="w-5 h-5 text-gold shrink-0" />
                <span className="text-sm">reservation@jungleheritage.in</span>
              </a>
            </li>
            <li>
              <a href={`https://wa.me/91${PHONE_NUMBER}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-ivory/70 hover:text-gold transition-colors duration-300">
                <MessageCircle className="w-5 h-5 text-gold shrink-0" />
                <span className="text-sm">WhatsApp Enquiry</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    {/* Bottom Bar */}
    <div className="border-t border-ivory/10">
      <div className="luxury-container py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-ivory/50 text-sm">
          © {new Date().getFullYear()} Jungle Heritage Resort. All rights reserved.
        </p>
        <div className="flex items-center gap-6">
          <Link to="/privacy" className="text-ivory/50 hover:text-gold text-sm transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="text-ivory/50 hover:text-gold text-sm transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  </footer>;
}