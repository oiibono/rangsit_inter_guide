import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Home,
  Utensils,
  Megaphone,
  Users,
  Bus,
  LogIn,
  UserCog,
  FilePenLine,
} from "lucide-react";
import RIG from "@/assets/RIG.png";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";

interface NavigationProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const navLinks = [
    { name: "Home", href: "/", icon: <Home /> },
    { name: "Canteen", href: "/canteen", icon: <Utensils /> },
    { name: "Announcements", href: "/announcements", icon: <Megaphone /> },
    { name: "Clubs", href: "/clubs", icon: <Users /> },
    { name: "Shuttle Bus", href: "/shuttle-bus", icon: <Bus /> },
  ];

  return (
    <>
      {/* Top Bar for Logo and Mobile Menu */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-card lg:hidden">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <img
                src={RIG}
                alt="Rangsit University Logo"
                className="w-16 h-16"
              />
              <div className="hidden md:block">
                <div className="font-playfair text-xl font-bold text-primary">
                  Rangsit Inter Guide
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  Excellence in Education
                </div>
              </div>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-foreground hover:bg-muted rounded-md transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-border bg-background">
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={cn(
                      "px-4 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors",
                      location.pathname === link.href && "bg-muted"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="flex flex-col gap-2 mt-4 px-4">
                  {session ? (
                    location.pathname !== '/admin-panel' && (
                      <Link to="/admin-panel" className="w-full">
                        <Button variant="ghost" className="w-full">Admin</Button>
                      </Link>
                    )
                  ) : (
                    <Link to="/admin-login" className="w-full">
                      <Button variant="ghost" className="w-full">Login</Button>
                    </Link>
                  )}
                  {!session && (
                    <Button className="w-full shadow-card">Apply Now</Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Desktop Sidebar Navigation */}
      <div
        onMouseEnter={() => setIsSidebarOpen(true)}
        onMouseLeave={() => setIsSidebarOpen(false)}
        className="hidden lg:flex flex-col fixed top-0 left-0 h-full bg-background/80 backdrop-blur-md border-r border-border shadow-card z-50 transition-all duration-300"
        style={{ width: isSidebarOpen ? "250px" : "80px" }}
      >
        <div className="flex flex-col items-center py-4 h-full">
          <Link to="/" className="flex items-center gap-3 group mb-8">
            <img src={RIG} alt="Rangsit University Logo" className="w-16 h-16" />
          </Link>
          <div className="flex flex-col gap-4 w-full px-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors",
                  location.pathname === link.href && "bg-muted",
                  !isSidebarOpen && "justify-center"
                )}
              >
                <div>{link.icon}</div>
                {isSidebarOpen && <span>{link.name}</span>}
              </Link>
            ))}
          </div>
          <div className="mt-auto flex flex-col gap-2 w-full px-4">
            {session ? (
              location.pathname !== '/admin-panel' && (
                <Link to="/admin-panel">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full flex items-center gap-4",
                      !isSidebarOpen && "justify-center"
                    )}
                  >
                    <UserCog />
                    {isSidebarOpen && <span>Admin</span>}
                  </Button>
                </Link>
              )
            ) : (
              <Link to="/admin-login">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full flex items-center gap-4",
                    !isSidebarOpen && "justify-center"
                  )}
                >
                  <LogIn />
                  {isSidebarOpen && <span>Login</span>}
                </Button>
              </Link>
            )}
            {!session && (
              <Link to="https://rsuip.org/application-form/" target="_blank">
                <Button
                  size="sm"
                  className={cn(
                    "w-full flex items-center gap-4 shadow-card hover:shadow-elegant",
                    !isSidebarOpen && "justify-center"
                  )}
                >
                  <FilePenLine />
                  {isSidebarOpen && <span>Apply Now</span>}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;
