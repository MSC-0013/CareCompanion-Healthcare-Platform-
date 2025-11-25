import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Heart, LogOut, Menu, Home, MessageSquare, FileText, Crown, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  const navLinks = [
    { to: "/", label: "Home", icon: Home },
    { to: "/chat", label: "Chat Assistant", icon: MessageSquare },
    { to: "/diseases", label: "Diseases", icon: FileText },
    { to: "/plans", label: "Plans", icon: Crown },
    { to: "/profile", label: "Profile", icon: UserIcon },
  ];

  const NavLink = ({ link, mobile = false }) => {
    const isActive = location.pathname === link.to;
    const Icon = link.icon;

    return (
      <Link
        to={link.to}
        onClick={() => mobile && setMobileMenuOpen(false)}
        className={`
          group relative px-4 py-2 rounded-xl text-sm font-medium
          flex items-center gap-2 transition-all duration-300
          btn-neon
          ${isActive ? "bg-white text-black font-bold" : "text-gray-300 hover:text-white"}
          ${mobile ? "w-full justify-start py-3" : ""}
        `}
      >
        <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
        <span className={mobile ? "block" : "hidden lg:block"}>{link.label}</span>
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-black text-white navbar-glow">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-lg group">
            <Heart className="h-7 w-7 text-white group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">CareCompanion Pro+</span>
            <span className="sm:hidden">CC Pro+</span>
          </Link>

          {/* ============== NOT LOGGED IN ============== */}
          {!isAuthenticated && (
            <div className="flex items-center gap-2">
              <Link to="/auth">
                <Button className="bg-white text-black hover:bg-gray-200 font-bold">
                  Login
                </Button>
              </Link>
            </div>
          )}

          {/* ============== LOGGED IN ============== */}
          {isAuthenticated && (
            <>
              {/* Desktop nav */}
              <div className="hidden md:flex items-center gap-3">
                {navLinks.map((link) => (
                  <NavLink key={link.to} link={link} />
                ))}
              </div>

              {/* Avatar + Logout */}
              <div className="flex items-center gap-3">
                <Link to="/profile" className="hidden md:flex items-center gap-2">
                  <Avatar className="h-9 w-9 border border-white">
                    <AvatarFallback className="bg-black text-white font-semibold">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="hidden lg:block">
                    <p className="text-xs font-medium">{user?.name}</p>
                    <p className="text-xs capitalize">{user?.plan || "Free"}</p>
                  </div>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden md:flex gap-2 text-white hover:text-red-500"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline">Logout</span>
                </Button>

                {/* Mobile menu */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild className="md:hidden">
                    <Button variant="ghost" size="icon" className="text-white">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>

                  <SheetContent side="right" className="w-72 bg-black text-white border-l border-white">
                    <div className="flex flex-col h-full">

                      {/* Mobile profile */}
                      <div className="flex items-center gap-3 pb-6 border-b border-gray-700">
                        <Avatar className="h-12 w-12 border border-white">
                          <AvatarFallback className="bg-black text-white font-bold text-lg">
                            {user?.name?.charAt(0)?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>

                        <div>
                          <p className="font-semibold">{user?.name}</p>
                          <p className="text-sm">{user?.plan || "Free"} Plan</p>
                        </div>
                      </div>

                      {/* Mobile links */}
                      <nav className="flex flex-col gap-2 py-6 flex-1">
                        {navLinks.map((link) => (
                          <NavLink key={link.to} link={link} mobile />
                        ))}
                      </nav>

                      <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="w-full border-gray-600 text-white hover:text-red-500"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </Button>

                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
