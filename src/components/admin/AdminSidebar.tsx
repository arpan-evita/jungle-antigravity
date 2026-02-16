import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  BedDouble,
  Package,
  DollarSign,
  MessageSquare,
  BarChart3,
  Settings,
  Users,
  UserCheck,
  ChevronLeft,
  Images,
  Compass,
  Star,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import logoImage from "@/assets/logo.png";

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isSuperAdmin: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true
  },
  {
    title: "Bookings",
    href: "/admin/bookings",
    icon: CalendarDays
  },
  {
    title: "Calendar",
    href: "/admin/calendar",
    icon: CalendarRange
  },
  {
    title: "Rooms",
    href: "/admin/rooms",
    icon: BedDouble
  },
  {
    title: "Packages",
    href: "/admin/packages",
    icon: Package
  },
  {
    title: "Experiences",
    href: "/admin/experiences",
    icon: Compass
  },
  {
    title: "Gallery",
    href: "/admin/gallery",
    icon: Images
  },
  {
    title: "Reviews",
    href: "/admin/reviews",
    icon: Star
  },
  {
    title: "Pricing",
    href: "/admin/pricing",
    icon: DollarSign
  },
  {
    title: "Enquiries",
    href: "/admin/enquiries",
    icon: MessageSquare
  },
  {
    title: "Chat Leads",
    href: "/admin/leads",
    icon: MessageSquare
  },
  {
    title: "Blogs",
    href: "/admin/blogs",
    icon: FileText
  },
  {
    title: "Guests",
    href: "/admin/guests",
    icon: UserCheck
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: BarChart3
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings
  },
];

export function AdminSidebar({ collapsed, onToggle, isSuperAdmin, mobileOpen, onMobileClose }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavClick = (href: string) => {
    navigate(href);
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const isActive = (href: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border/50 transition-all duration-300 ease-in-out transform",
        "bg-[hsl(var(--forest-deep))] text-white",
        collapsed ? "w-16" : "w-64",
        // Mobile: hidden by default, slide in when mobileOpen
        "max-md:-translate-x-full",
        mobileOpen && "max-md:translate-x-0 max-md:w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex h-16 items-center border-b border-white/10 px-4",
        collapsed ? "justify-center" : "justify-between"
      )}>
        <div className={cn("flex items-center gap-3", collapsed && "hidden")}>
          <img src={logoImage} alt="Jungle Heritage" className="h-10 w-auto" />
          <div>
            <h1 className="font-serif text-lg font-medium text-white">Jungle Heritage</h1>
            <p className="text-[10px] uppercase tracking-widest text-white/60">Admin</p>
          </div>
        </div>
        {collapsed && (
          <img src={logoImage} alt="Jungle Heritage" className="h-8 w-auto" />
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn(
            "h-8 w-8 text-white/70 hover:bg-white/10 hover:text-white",
            collapsed && "hidden"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 w-full text-left",
                collapsed && !mobileOpen && "justify-center px-2",
                isActive(item.href, item.exact)
                  ? "bg-[hsl(var(--gold))] text-[hsl(var(--forest-deep))]"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0")} />
              {(!collapsed || mobileOpen) && <span>{item.title}</span>}
            </button>
          ))}

          {/* Super Admin Only - Users */}
          {isSuperAdmin && (
            <button
              onClick={() => handleNavClick("/admin/users")}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 mt-4 pt-4 border-t border-white/10 w-full text-left",
                collapsed && !mobileOpen && "justify-center px-2 border-t-0 mt-2 pt-2",
                location.pathname === "/admin/users"
                  ? "bg-[hsl(var(--gold))] text-[hsl(var(--forest-deep))]"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <Users className={cn("h-5 w-5 flex-shrink-0")} />
              {(!collapsed || mobileOpen) && <span>Staff Management</span>}
            </button>
          )}
        </nav>
      </ScrollArea>
    </aside>
  );
}
