import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Rooms from "./pages/Rooms";
import RoomDetail from "./pages/RoomDetail";
import Experiences from "./pages/Experiences";
import Amenities from "./pages/Amenities";
import Packages from "./pages/Packages";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import BookingNew from "./pages/BookingNew";
import BookingConfirmation from "./pages/BookingConfirmation";
import GuestLogin from "./pages/GuestLogin";
import GuestSignup from "./pages/GuestSignup";
import GuestAccount from "./pages/GuestAccount";
import About from "./pages/About";
import Careers from "./pages/Careers";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import { ChatWidget } from "@/components/chat/ChatWidget";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import BookingsPage from "./pages/admin/BookingsPage";
import BookingDetails from "./pages/admin/BookingDetails";
import CalendarPage from "./pages/admin/CalendarPage";
import RoomsPage from "./pages/admin/RoomsPage";
import PackagesPage from "./pages/admin/PackagesPage";
import GalleryPage from "./pages/admin/GalleryPage";
import ExperiencesPage from "./pages/admin/ExperiencesPage";
import ExperienceDetail from "./pages/ExperienceDetail";
import PricingPage from "./pages/admin/PricingPage";
import EnquiriesPage from "./pages/admin/EnquiriesPage";
import ReportsPage from "./pages/admin/ReportsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import UsersPage from "./pages/admin/UsersPage";
import GuestsPage from "./pages/admin/GuestsPage";
import ReviewsPage from "./pages/admin/ReviewsPage";
import BlogsPage from "./pages/admin/BlogsPage";
import ChatLeads from "./pages/admin/ChatLeads";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/rooms/:slug" element={<RoomDetail />} />
            <Route path="/experiences" element={<Experiences />} />
            <Route path="/experiences/:slug" element={<ExperienceDetail />} />
            <Route path="/amenities" element={<Amenities />} />
            <Route path="/packages" element={<Packages />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/blog" element={<Blogs />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/booking" element={<BookingNew />} />
            <Route path="/booking/confirmation" element={<BookingConfirmation />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsAndConditions />} />

            {/* Guest Auth Routes */}
            <Route path="/login" element={<GuestLogin />} />
            <Route path="/signup" element={<GuestSignup />} />
            <Route path="/account" element={<GuestAccount />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="bookings" element={<BookingsPage />} />
              <Route path="bookings/:id" element={<BookingDetails />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="rooms" element={<RoomsPage />} />
              <Route path="packages" element={<PackagesPage />} />
              <Route path="experiences" element={<ExperiencesPage />} />
              <Route path="gallery" element={<GalleryPage />} />
              <Route path="pricing" element={<PricingPage />} />
              <Route path="enquiries" element={<EnquiriesPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="guests" element={<GuestsPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="reviews" element={<ReviewsPage />} />
              <Route path="blogs" element={<BlogsPage />} />
              <Route path="leads" element={<ChatLeads />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ChatWidget />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
