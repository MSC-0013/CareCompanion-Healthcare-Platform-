import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Heart, LogOut, Menu, Home, MessageSquare, FileText, Crown, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { isAuthenticated, logout, getCurrentUser } from '@/lib/auth';


const Navbar = () => {
  const location = useLocation();
  const isAuth = isAuthenticated();
  const user = getCurrentUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    window.location.href = '/auth';
  };

  const navLinks = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/chat', label: 'Chat Assistant', icon: MessageSquare },
    { to: '/diseases', label: 'Diseases', icon: FileText },
    { to: '/plans', label: 'Plans', icon: Crown },
    { to: '/profile', label: 'Profile', icon: UserIcon },
  ];

  const NavLink = ({ link, mobile = false }: { link: typeof navLinks[0]; mobile?: boolean }) => {
    const isActive = location.pathname === link.to;
    const Icon = link.icon;

    return (
      <Link
        to={link.to}
        onClick={() => mobile && setMobileMenuOpen(false)}
        className={`group relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
          isActive
            ? 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
        } ${mobile ? 'w-full justify-start py-3' : ''}`}
      >
        <Icon className={`h-4 w-4 transition-transform group-hover:scale-110 ${isActive ? 'animate-pulse' : ''}`} />
        <span className={mobile ? 'block' : 'hidden lg:block'}>{link.label}</span>
        {isActive && !mobile && (
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-primary-foreground rounded-full" />
        )}
      </Link>
    );
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-background via-card to-background backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 font-bold text-lg group"
          >
            <div className="relative">
              <Heart className="h-7 w-7 text-primary fill-primary transition-transform group-hover:scale-110 group-hover:rotate-6" />
              <span className="absolute inset-0 h-7 w-7 text-primary fill-primary blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
            </div>
            <span className="hidden sm:inline bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CareCompanion Pro+
            </span>
            <span className="sm:hidden bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CC Pro+
            </span>
          </Link>

          {isAuth && (
            <>
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-2">
                {navLinks.map((link) => (
                  <NavLink key={link.to} link={link} />
                ))}
              </div>

              {/* User Menu & Actions */}
              <div className="flex items-center gap-3">
                {/* User Avatar - Desktop */}
                <Link to="/profile" className="hidden md:flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <Avatar className="h-9 w-9 border-2 border-primary/20 hover:border-primary/40 transition-colors">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-semibold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.plan}</p>
                  </div>
                </Link>

                {/* Logout Button - Desktop */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden md:flex gap-2 hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden lg:inline">Logout</span>
                </Button>

                {/* Mobile Menu */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild className="md:hidden">
                    <Button variant="ghost" size="icon" className="relative">
                      <Menu className="h-5 w-5" />
                      <span className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full animate-pulse" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-72 bg-gradient-to-b from-card to-background">
                    <div className="flex flex-col h-full">
                      {/* Mobile User Profile */}
                      <div className="flex items-center gap-3 pb-6 border-b">
                        <Avatar className="h-12 w-12 border-2 border-primary">
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold text-lg">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{user?.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">{user?.plan} Plan</p>
                        </div>
                      </div>

                      {/* Mobile Navigation Links */}
                      <nav className="flex flex-col gap-2 py-6 flex-1">
                        {navLinks.map((link) => (
                          <NavLink key={link.to} link={link} mobile />
                        ))}
                      </nav>

                      {/* Mobile Logout */}
                      <Button
                        variant="outline"
                        onClick={handleLogout}
                        className="w-full gap-2 border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
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
