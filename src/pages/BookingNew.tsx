import { useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, differenceInDays, addDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Users, Utensils, User, CheckCircle, ChevronLeft, ChevronRight, Loader2, CreditCard, Wallet, Info, Landmark } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useRoomCategories, useMealPlanPrices, useTaxConfig, useSeasonMultiplier, useCheckAvailability, usePaymentSettings } from "@/hooks/useBookingData";
import { usePriceCalculation } from "@/hooks/usePriceCalculation";
import { useCreateBooking } from "@/hooks/useCreateBooking";
import { AvailabilityIndicator } from "@/components/booking/AvailabilityIndicator";
import type { BookingFormData, MealPlan } from "@/types/booking";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const steps = [
  { id: 1, title: 'Dates', icon: Calendar },
  { id: 2, title: 'Guests & Room', icon: Users },
  { id: 3, title: 'Your Details', icon: User },
  { id: 4, title: 'Confirm', icon: CheckCircle },
];

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const BookingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPaymentProvider, setSelectedPaymentProvider] = useState<string | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    checkInDate: undefined,
    checkOutDate: undefined,
    numAdults: 2,
    numChildren: 0,
    roomCategoryId: '',
    packageId: null,
    mealPlan: 'CP',
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    guestCity: '',
    specialRequests: '',
    isEnquiryOnly: false,
  });

  // Data hooks
  const { data: roomCategories = [], isLoading: roomsLoading } = useRoomCategories();
  const { data: mealPlanPrices = [], isLoading: mealsLoading } = useMealPlanPrices();
  const { data: taxConfig = [] } = useTaxConfig();
  const { data: seasonMultiplier = 1 } = useSeasonMultiplier(formData.checkInDate);
  const { data: availableRooms = 0, isSuccess: availabilityChecked } = useCheckAvailability(
    formData.roomCategoryId,
    formData.checkInDate,
    formData.checkOutDate
  );
  const { data: paymentProviders = [] } = usePaymentSettings();

  const sortedRoomCategories = useMemo(() => {
    return [...roomCategories].sort((a, b) => a.base_price_per_night - b.base_price_per_night);
  }, [roomCategories]);

  const selectedRoom = roomCategories.find(r => r.id === formData.roomCategoryId);

  const priceBreakdown = usePriceCalculation({
    checkInDate: formData.checkInDate,
    checkOutDate: formData.checkOutDate,
    numAdults: formData.numAdults,
    numChildren: formData.numChildren,
    roomCategory: selectedRoom,
    mealPlan: formData.mealPlan,
    mealPlanPrices,
    selectedPackage: undefined,
    taxConfig,
    seasonMultiplier,
  });

  const createBooking = useCreateBooking();

  const numNights = formData.checkInDate && formData.checkOutDate
    ? differenceInDays(formData.checkOutDate, formData.checkInDate)
    : 0;

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.checkInDate && formData.checkOutDate && numNights > 0;
      case 2:
        return formData.roomCategoryId && formData.numAdults > 0;
      case 3:
        return formData.guestName.trim() && formData.guestEmail.trim() && formData.guestPhone.trim();
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 4 && canProceed()) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async (enquiryOnly: boolean) => {
    if (!priceBreakdown || !selectedRoom) return;

    // Decide if we should do payment or just enquiry
    const shouldDoPayment = !enquiryOnly && selectedPaymentProvider;

    try {
      // 1. Create the booking first
      const result = await createBooking.mutateAsync({
        formData: { ...formData, isEnquiryOnly: !shouldDoPayment },
        priceBreakdown,
      });

      if (!shouldDoPayment) {
        navigate("/booking/confirmation", {
          state: {
            booking: {
              bookingReference: result.booking_reference,
              guestName: formData.guestName,
              guestEmail: formData.guestEmail,
              guestPhone: formData.guestPhone,
              roomName: selectedRoom.name,
              packageName: undefined,
              checkInDate: formData.checkInDate!.toISOString(),
              checkOutDate: formData.checkOutDate!.toISOString(),
              numNights: priceBreakdown.numNights,
              numAdults: formData.numAdults,
              numChildren: formData.numChildren,
              mealPlan: formData.mealPlan,
              grandTotal: priceBreakdown.grandTotal,
              isEnquiryOnly: true,
            },
          },
        });
        return;
      }

      // 2. Handle Payment Flow based on provider
      if (selectedPaymentProvider === 'razorpay') {
        const razorpayConfig = paymentProviders?.find(p => p.provider === 'razorpay')?.config as any;
        const keyId = razorpayConfig?.key_id || "rzp_test_placeholder";

        const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
          body: {
            amount: priceBreakdown.grandTotal,
            currency: 'INR',
            receipt: result.booking_reference
          }
        });

        if (orderError) throw orderError;

        const options = {
          key: keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "Jungle Heritage Resort",
          description: `Booking #${result.booking_reference}`,
          order_id: orderData.id,
          handler: async function (response: any) {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-razorpay-payment', {
              body: {
                orderCreationId: orderData.id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                bookingId: result.id
              }
            });

            if (verifyError || !verifyData.success) {
              toast({
                title: "Payment Verification Failed",
                description: "Please contact support.",
                variant: "destructive"
              });
              return;
            }

            toast({
              title: "Payment Successful",
              description: "Your booking is confirmed!",
            });

            navigate("/booking/confirmation", {
              state: {
                booking: {
                  bookingReference: result.booking_reference,
                  guestName: formData.guestName,
                  guestEmail: formData.guestEmail,
                  guestPhone: formData.guestPhone,
                  roomName: selectedRoom.name,
                  packageName: undefined,
                  checkInDate: formData.checkInDate!.toISOString(),
                  checkOutDate: formData.checkOutDate!.toISOString(),
                  numNights: priceBreakdown.numNights,
                  numAdults: formData.numAdults,
                  numChildren: formData.numChildren,
                  mealPlan: formData.mealPlan,
                  grandTotal: priceBreakdown.grandTotal,
                  isEnquiryOnly: false,
                  paymentStatus: 'paid'
                },
              },
            });
          },
          prefill: {
            name: formData.guestName,
            email: formData.guestEmail,
            contact: formData.guestPhone
          },
          theme: {
            color: "#1a3a2f"
          }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response: any) {
          toast({
            title: "Payment Failed",
            description: response.error.description,
            variant: "destructive"
          });
        });
        rzp1.open();
      } else if (selectedPaymentProvider === 'stripe') {
        // Stripe implementation would go here
        toast({
          title: "Stripe Integration",
          description: "Stripe payment flow coming soon.",
        });
      } else {
        toast({
          title: "Unsupported Provider",
          description: "This payment provider is not fully integrated yet.",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error("Booking/Payment Error:", error);
      toast({
        title: "Error",
        description: "Failed to process booking or payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isLoading = roomsLoading || mealsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-20">
        <div className="luxury-container">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-5 py-2 border border-gold/30 rounded-full text-gold text-[11px] uppercase tracking-[0.25em] mb-4">
              Book Your Stay
            </span>
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-medium text-foreground">
              Reserve Your <span className="italic text-forest">Forest Escape</span>
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left: Form Steps */}
            <div className="lg:col-span-2">
              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-10 overflow-x-auto pb-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <button
                      onClick={() => step.id < currentStep && setCurrentStep(step.id)}
                      disabled={step.id > currentStep}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full transition-all whitespace-nowrap",
                        currentStep === step.id
                          ? "bg-forest text-ivory"
                          : currentStep > step.id
                            ? "bg-forest/10 text-forest cursor-pointer hover:bg-forest/20"
                            : "bg-muted text-muted-foreground"
                      )}
                    >
                      <step.icon className="w-4 h-4" />
                      <span className="text-sm font-medium hidden sm:inline">{step.title}</span>
                    </button>
                    {index < steps.length - 1 && (
                      <div className={cn(
                        "w-8 lg:w-16 h-px mx-2",
                        currentStep > step.id ? "bg-forest" : "bg-border"
                      )} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step Content */}
              <div className="bg-card rounded-3xl border border-border p-6 md:p-10 shadow-soft min-h-[400px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Step 1: Dates */}
                    {currentStep === 1 && (
                      <div className="space-y-6">
                        <h2 className="font-serif text-2xl font-medium">Select Your Dates</h2>
                        <p className="text-muted-foreground">Choose your check-in and check-out dates.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Check-in Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal h-12",
                                    !formData.checkInDate && "text-muted-foreground"
                                  )}
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {formData.checkInDate ? format(formData.checkInDate, "PPP") : "Select date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={formData.checkInDate}
                                  onSelect={(date) => {
                                    setFormData(prev => ({
                                      ...prev,
                                      checkInDate: date,
                                      checkOutDate: date && prev.checkOutDate && prev.checkOutDate <= date
                                        ? addDays(date, 1)
                                        : prev.checkOutDate
                                    }));
                                  }}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                  className="p-3 pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div className="space-y-2">
                            <Label>Check-out Date</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal h-12",
                                    !formData.checkOutDate && "text-muted-foreground"
                                  )}
                                >
                                  <Calendar className="mr-2 h-4 w-4" />
                                  {formData.checkOutDate ? format(formData.checkOutDate, "PPP") : "Select date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={formData.checkOutDate}
                                  onSelect={(date) => setFormData(prev => ({ ...prev, checkOutDate: date }))}
                                  disabled={(date) => !formData.checkInDate || date <= formData.checkInDate}
                                  initialFocus
                                  className="p-3 pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        {numNights > 0 && (
                          <div className="p-4 rounded-xl bg-forest/5 border border-forest/10">
                            <p className="text-forest font-medium">
                              {numNights} {numNights === 1 ? 'Night' : 'Nights'} Stay
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(formData.checkInDate!, 'EEE, MMM d')} - {format(formData.checkOutDate!, 'EEE, MMM d, yyyy')}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 2: Guests & Room */}
                    {currentStep === 2 && (
                      <div className="space-y-6">
                        <h2 className="font-serif text-2xl font-medium">Guests & Room</h2>
                        <p className="text-muted-foreground">Select number of guests and your preferred accommodation.</p>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <Label>Adults</Label>
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setFormData(prev => ({ ...prev, numAdults: Math.max(1, prev.numAdults - 1) }))}
                                disabled={formData.numAdults <= 1}
                              >
                                -
                              </Button>
                              <span className="w-12 text-center font-medium text-lg">{formData.numAdults}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setFormData(prev => ({ ...prev, numAdults: prev.numAdults + 1 }))}
                              >
                                +
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Children (0-12 years)</Label>
                            <div className="flex items-center gap-3">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setFormData(prev => ({ ...prev, numChildren: Math.max(0, prev.numChildren - 1) }))}
                                disabled={formData.numChildren <= 0}
                              >
                                -
                              </Button>
                              <span className="w-12 text-center font-medium text-lg">{formData.numChildren}</span>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setFormData(prev => ({ ...prev, numChildren: prev.numChildren + 1 }))}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 pt-4">
                          <Label>Select Room</Label>
                          <div className="grid gap-4">
                            {sortedRoomCategories.map((room) => (
                              <button
                                key={room.id}
                                onClick={() => setFormData(prev => ({ ...prev, roomCategoryId: room.id }))}
                                className={cn(
                                  "p-5 rounded-2xl border text-left transition-all",
                                  formData.roomCategoryId === room.id
                                    ? "border-gold bg-gold/5 shadow-gold"
                                    : "border-border hover:border-gold/50"
                                )}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-serif text-lg font-medium">{room.name}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      Up to {room.max_adults} adults, {room.max_children} children • {room.total_rooms} available
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-serif text-xl font-semibold text-forest">
                                      {formatCurrency(room.base_price_per_night * seasonMultiplier)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">per night</p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        {formData.roomCategoryId && (
                          <AvailabilityIndicator
                            roomCategoryId={formData.roomCategoryId}
                            checkIn={formData.checkInDate}
                            checkOut={formData.checkOutDate}
                            className="mt-4"
                          />
                        )}
                      </div>
                    )}

                    {/* Step 3: Guest Details (Formerly Step 4) */}
                    {currentStep === 3 && (
                      <div className="space-y-6">
                        <h2 className="font-serif text-2xl font-medium">Your Details</h2>
                        <p className="text-muted-foreground">Please provide your contact information.</p>

                        <div className="grid gap-5">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name *</Label>
                            <Input
                              id="name"
                              value={formData.guestName}
                              onChange={(e) => setFormData(prev => ({ ...prev, guestName: e.target.value }))}
                              placeholder="John Doe"
                              className="h-12"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                              <Label htmlFor="email">Email *</Label>
                              <Input
                                id="email"
                                type="email"
                                value={formData.guestEmail}
                                onChange={(e) => setFormData(prev => ({ ...prev, guestEmail: e.target.value }))}
                                placeholder="john@example.com"
                                className="h-12"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone *</Label>
                              <Input
                                id="phone"
                                type="tel"
                                value={formData.guestPhone}
                                onChange={(e) => setFormData(prev => ({ ...prev, guestPhone: e.target.value }))}
                                placeholder="+91 98765 43210"
                                className="h-12"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={formData.guestCity}
                              onChange={(e) => setFormData(prev => ({ ...prev, guestCity: e.target.value }))}
                              placeholder="Mumbai"
                              className="h-12"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="requests">Special Requests</Label>
                            <Textarea
                              id="requests"
                              value={formData.specialRequests}
                              onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                              placeholder="Any special requirements or requests..."
                              rows={3}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Confirmation (Formerly Step 5) */}
                    {currentStep === 4 && priceBreakdown && (
                      <div className="space-y-6">
                        <h2 className="font-serif text-2xl font-medium">Review & Confirm</h2>
                        <p className="text-muted-foreground">Please review your booking details before confirming.</p>

                        <div className="space-y-4 divide-y divide-border">
                          <div className="pb-4">
                            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-3">Stay Details</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Check-in</p>
                                <p className="font-medium">{format(formData.checkInDate!, 'EEE, MMM d, yyyy')}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Check-out</p>
                                <p className="font-medium">{format(formData.checkOutDate!, 'EEE, MMM d, yyyy')}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Guests</p>
                                <p className="font-medium">{formData.numAdults} Adults, {formData.numChildren} Children</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Room</p>
                                <p className="font-medium">{selectedRoom?.name}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Meal Plan</p>
                                <p className="font-medium">Continental Plan (Breakfast Included)</p>
                              </div>
                            </div>
                          </div>

                          <div className="py-4">
                            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-3">Guest Information</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Name</p>
                                <p className="font-medium">{formData.guestName}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Email</p>
                                <p className="font-medium">{formData.guestEmail}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Phone</p>
                                <p className="font-medium">{formData.guestPhone}</p>
                              </div>
                              {formData.guestCity && (
                                <div>
                                  <p className="text-muted-foreground">City</p>
                                  <p className="font-medium">{formData.guestCity}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4 pt-4">
                          <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider mb-3">Payment Method</h3>
                          {paymentProviders && paymentProviders.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {paymentProviders.map((payment) => (
                                <button
                                  key={payment.provider}
                                  onClick={() => setSelectedPaymentProvider(payment.provider)}
                                  className={cn(
                                    "p-4 rounded-xl border text-left transition-all flex items-center justify-between",
                                    selectedPaymentProvider === payment.provider
                                      ? "border-gold bg-gold/5 shadow-sm"
                                      : "border-border hover:border-gold/30"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    {payment.provider === "razorpay" && <Wallet className="h-5 w-5 text-blue-500" />}
                                    {payment.provider === "stripe" && <CreditCard className="h-5 w-5 text-indigo-500" />}
                                    {payment.provider === "paypal" && <Info className="h-5 w-5 text-blue-600" />}
                                    {payment.provider === "phonepe" && <Landmark className="h-5 w-5 text-purple-600" />}
                                    <span className="font-medium capitalize">{payment.provider}</span>
                                  </div>
                                  {selectedPaymentProvider === payment.provider && (
                                    <CheckCircle className="h-4 w-4 text-gold" />
                                  )}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="p-4 rounded-xl bg-orange-50 border border-orange-100 text-orange-700 text-sm">
                              Online payments are currently unavailable. You can send a booking enquiry instead.
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border mt-6">
                          <Button
                            variant="luxury"
                            size="lg"
                            className="flex-1"
                            onClick={() => handleSubmit(false)}
                            disabled={createBooking.isPending || (!selectedPaymentProvider && paymentProviders.length > 0)}
                          >
                            {createBooking.isPending ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              selectedPaymentProvider ? `Pay with ${selectedPaymentProvider.charAt(0).toUpperCase() + selectedPaymentProvider.slice(1)}` : "Confirm Booking"
                            )}
                          </Button>
                          <Button
                            variant="luxuryDark"
                            size="lg"
                            className="flex-1"
                            onClick={() => handleSubmit(true)}
                            disabled={createBooking.isPending}
                          >
                            Send Enquiry Instead
                          </Button>
                        </div>

                        {paymentProviders.length > 0 && !selectedPaymentProvider && (
                          <p className="text-xs text-center text-muted-foreground">
                            Please select a payment method to confirm your booking immediately.
                          </p>
                        )}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                {currentStep < 4 && (
                  <div className="flex justify-between mt-10 pt-6 border-t border-border">
                    <Button
                      variant="ghost"
                      onClick={handleBack}
                      disabled={currentStep === 1}
                      className="gap-2"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </Button>
                    <Button
                      variant="luxury"
                      onClick={handleNext}
                      disabled={!canProceed()}
                      className="gap-2"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Price Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 bg-forest-deep rounded-3xl p-6 md:p-8 text-ivory">
                <h3 className="font-serif text-xl font-medium mb-6">Price Summary</h3>

                {priceBreakdown ? (
                  <div className="space-y-4">
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-ivory/70">Room ({priceBreakdown.numNights} nights)</span>
                        <span>{formatCurrency(priceBreakdown.roomTotal)}</span>
                      </div>

                      {priceBreakdown.extraGuestTotal > 0 && (
                        <div className="flex justify-between">
                          <span className="text-ivory/70">Extra Guests</span>
                          <span>{formatCurrency(priceBreakdown.extraGuestTotal)}</span>
                        </div>
                      )}

                      {priceBreakdown.mealPlanTotal > 0 && (
                        <div className="flex justify-between">
                          <span className="text-ivory/70">Meal Plan</span>
                          <span>{formatCurrency(priceBreakdown.mealPlanTotal)}</span>
                        </div>
                      )}

                      <div className="flex justify-between pt-3 border-t border-ivory/20">
                        <span className="text-ivory/70">Subtotal</span>
                        <span>{formatCurrency(priceBreakdown.subtotal)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-ivory/70">Taxes ({priceBreakdown.taxRate}%)</span>
                        <span>{formatCurrency(priceBreakdown.taxes)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4 border-t border-ivory/20">
                      <span className="font-serif text-lg">Total</span>
                      <span className="font-serif text-2xl font-semibold text-gold-light">
                        {formatCurrency(priceBreakdown.grandTotal)}
                      </span>
                    </div>

                    {seasonMultiplier !== 1 && (
                      <div className="p-3 rounded-xl bg-gold/10 text-xs text-gold-light">
                        {seasonMultiplier > 1 ? '🔥 Peak Season Pricing' : '✨ Off-Season Discount Applied'}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-ivory/50">
                    <p>Select dates and room to see pricing</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BookingPage;
