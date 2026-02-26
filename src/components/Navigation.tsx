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
  LogOut,
  UserCog,
  FilePenLine,
} from "lucide-react";
import RIG from "@/assets/RIG.png";
import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useUserRole } from "@/hooks/useUserRole";

interface NavigationProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const Navigation: React.FC<NavigationProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const { role } = useUserRole();

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
  }, []);

  const isAdminOrClubAdmin = role === "admin" || role === "club_admin";
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
    setIsMenuOpen(false);
  };

  const navLinks = [
    { name: "Home", href: "/", icon: <Home /> },
    { name: "Canteen", href: "/canteen", icon: <Utensils /> },
    { name: "Announcements", href: "/announcements", icon: <Megaphone /> },
    { name: "Clubs", href: "/clubs", icon: <Users /> },
    { name: "Shuttle Bus", href: "/shuttle-bus", icon: <Bus /> },
  ];

  return (
    <>
      {/* Mobile Top Bar - Fixed at top for all viewports below lg */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-card lg:hidden">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 sm:h-[72px]">
            {/* Logo - compact on mobile */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3 group min-w-0" onClick={() => setIsMenuOpen(false)}>
              <img
                src={RIG}
                alt="Rangsit University Logo"
                className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="font-playfair text-base sm:text-xl font-bold text-primary truncate">
                  Rangsit Inter Guide
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground font-medium hidden sm:block">
                  Excellence in Education
                </div>
              </div>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex-shrink-0 p-2.5 -mr-2 text-foreground hover:bg-muted rounded-md transition-colors touch-manipulation"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu Dropdown - Full width below top bar */}
          {isMenuOpen && (
            <div className="lg:hidden border-t border-border bg-background/95 backdrop-blur-md max-h-[calc(100vh-4rem)] sm:max-h-[calc(100vh-72px)] overflow-y-auto">
              <div className="flex flex-col py-3 px-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:text-primary hover:bg-muted rounded-md transition-colors",
                      location.pathname === link.href && "bg-muted"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="flex-shrink-0 w-5 h-5">{link.icon}</span>
                    {link.name}
                  </Link>
                ))}
                <div className="flex flex-col gap-1 mt-2 pt-3 border-t border-border">
                  {session ? (
                    <>
                      {location.pathname !== '/admin-panel' && (
                        <Link to="/admin-panel" className="w-full" onClick={() => setIsMenuOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start gap-3">
                            <UserCog className="w-5 h-5" />
                            Admin
                          </Button>
                        </Link>
                      )}
                      {isAdminOrClubAdmin && (
                        <Button variant="ghost" className="w-full justify-start gap-3 text-destructive hover:text-destructive" onClick={handleLogout}>
                          <LogOut className="w-5 h-5" />
                          Logout
                        </Button>
                      )}
                    </>
                  ) : (
                    <Link to="/admin-login" className="w-full" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start gap-3">
                        <LogIn className="w-5 h-5" />
                        Login
                      </Button>
                    </Link>
                  )}
                  {!session && (
                    <a href="https://rsuip.org/application-form/" target="_blank" rel="noopener noreferrer" className="w-full" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full shadow-card justify-center gap-2">
                        <FilePenLine className="w-4 h-4" />
                        Apply Now
                      </Button>
                    </a>
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
              <>
                {location.pathname !== '/admin-panel' && (
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
                )}
                {isAdminOrClubAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full flex items-center gap-4 text-destructive hover:text-destructive",
                      !isSidebarOpen && "justify-center"
                    )}
                    onClick={handleLogout}
                  >
                    <LogOut />
                    {isSidebarOpen && <span>Logout</span>}
                  </Button>
                )}
              </>
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
