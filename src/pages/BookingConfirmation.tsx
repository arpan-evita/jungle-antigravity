import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Check,
  Calendar,
  Users,
  MapPin,
  Utensils,
  Download,
  Mail,
  Phone,
  ArrowRight,
  Home,
  User,
  Copy,
  CheckCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const MEAL_PLAN_LABELS: Record<string, string> = {
  EP: "Room Only (European Plan)",
  CP: "Breakfast Included (Continental Plan)",
  MAP: "Breakfast & Dinner (Modified American Plan)",
  AP: "All Meals Included (American Plan)",
};

interface BookingDetails {
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomName: string;
  packageName?: string;
  checkInDate: string;
  checkOutDate: string;
  numNights: number;
  numAdults: number;
  numChildren: number;
  mealPlan: string;
  grandTotal: number;
  isEnquiryOnly: boolean;
}

export default function BookingConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Get booking details from location state
  const bookingDetails = location.state?.booking as BookingDetails | undefined;

  useEffect(() => {
    // If no booking details, redirect to booking page
    if (!bookingDetails) {
      navigate("/booking", { replace: true });
    }
  }, [bookingDetails, navigate]);

  if (!bookingDetails) {
    return null;
  }

  const handleCopyReference = () => {
    navigator.clipboard.writeText(bookingDetails.bookingReference);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Booking reference copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateAccount = () => {
    navigate("/signup", {
      state: {
        bookingRef: bookingDetails.bookingReference,
        email: bookingDetails.guestEmail,
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 py-8 sm:py-12">
        <div className="container max-w-3xl mx-auto px-4">
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="flex justify-center mb-6"
          >
            <div className="flex items-center justify-center h-20 w-20 rounded-full bg-green-100">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <Check className="h-10 w-10 text-green-600" />
              </motion.div>
            </div>
          </motion.div>

          {/* Confirmation Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-serif text-foreground mb-2">
              {bookingDetails.isEnquiryOnly ? "Enquiry Submitted!" : "Booking Confirmed!"}
            </h1>
            <p className="text-muted-foreground">
              {bookingDetails.isEnquiryOnly
                ? "We'll get back to you shortly with availability and pricing."
                : "Your reservation has been confirmed. Check your email for details."}
            </p>
          </motion.div>

          {/* Booking Reference */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="mb-6 border-[hsl(var(--gold))]/30 bg-[hsl(var(--gold))]/5">
              <CardContent className="py-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <p className="text-sm text-muted-foreground mb-1">
                      {bookingDetails.isEnquiryOnly ? "Enquiry Reference" : "Booking Reference"}
                    </p>
                    <p className="text-2xl font-mono font-bold text-[hsl(var(--forest))]">
                      {bookingDetails.bookingReference}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyReference}
                    className="flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <CheckCheck className="h-4 w-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Booking Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="mb-6 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[hsl(var(--forest))]" />
                  Stay Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Room & Package */}
                <div>
                  <h3 className="font-serif text-lg">{bookingDetails.roomName}</h3>
                  {bookingDetails.packageName && (
                    <p className="text-sm text-[hsl(var(--gold))]">
                      {bookingDetails.packageName} Package
                    </p>
                  )}
                </div>

                <Separator />

                {/* Dates & Guests */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Check-in</span>
                    </div>
                    <p className="font-medium">
                      {format(new Date(bookingDetails.checkInDate), "EEE, MMM d, yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground">After 2:00 PM</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">Check-out</span>
                    </div>
                    <p className="font-medium">
                      {format(new Date(bookingDetails.checkOutDate), "EEE, MMM d, yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground">Before 11:00 AM</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">Guests</span>
                    </div>
                    <p className="font-medium">
                      {bookingDetails.numAdults} Adult{bookingDetails.numAdults > 1 ? "s" : ""}
                    </p>
                    {bookingDetails.numChildren > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {bookingDetails.numChildren} Child{bookingDetails.numChildren > 1 ? "ren" : ""}
                      </p>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Utensils className="h-4 w-4" />
                      <span className="text-sm">Meal Plan</span>
                    </div>
                    <p className="font-medium">{bookingDetails.mealPlan}</p>
                    <p className="text-sm text-muted-foreground">
                      {MEAL_PLAN_LABELS[bookingDetails.mealPlan]?.split("(")[0]}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {bookingDetails.numNights} Night{bookingDetails.numNights > 1 ? "s" : ""} Total
                    </p>
                    <p className="text-2xl font-serif font-semibold text-[hsl(var(--forest))]">
                      ₹{bookingDetails.grandTotal.toLocaleString("en-IN")}
                    </p>
                  </div>
                  {!bookingDetails.isEnquiryOnly && (
                    <div className="text-right">
                      <p className="text-sm text-green-600 font-medium">
                        Pay at Resort
                      </p>
                      <p className="text-xs text-muted-foreground">
                        No advance payment required
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Guest Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="mb-6 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-[hsl(var(--forest))]" />
                  Guest Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{bookingDetails.guestName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      {bookingDetails.guestEmail}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {bookingDetails.guestPhone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Create Account Prompt (if not logged in) */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="mb-6 border-[hsl(var(--forest))]/20 bg-[hsl(var(--forest))]/5">
                <CardHeader>
                  <CardTitle className="text-lg">Track Your Booking</CardTitle>
                  <CardDescription>
                    Create an account to easily manage your reservation and view your booking history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-4 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      View and manage all your bookings
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Quick rebooking for future stays
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-600" />
                      Add special requests to your reservation
                    </li>
                  </ul>
                  <Button onClick={handleCreateAccount} className="w-full sm:w-auto">
                    Create Free Account
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            {user && (
              <Link to="/account">
                <Button className="w-full sm:w-auto">
                  View My Bookings
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            )}
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-8 text-sm text-muted-foreground"
          >
            <p>
              Questions about your booking? Contact us at{" "}
              <a
                href="tel:+919876543210"
                className="text-[hsl(var(--gold))] hover:underline"
              >
                +91 98765 43210
              </a>
              {" "}or{" "}
              <a
                href="mailto:reservation@jungleheritage.com"
                className="text-[hsl(var(--gold))] hover:underline"
              >
                reservation@jungleheritage.com
              </a>
            </p>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
