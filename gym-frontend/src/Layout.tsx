import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Dumbbell, LogOut, Shield, Briefcase, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Layout() {
  const { user, isAuthenticated, isEmployee, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <Dumbbell className="w-6 h-6" />
            <span>GymApp</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" asChild>
              <Link to="/">Strona główna</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/offers">Oferty</Link>
            </Button>
            {isAuthenticated && (
              <Button variant="ghost" asChild>
                <Link to="/dashboard">Mój panel</Link>
              </Button>
            )}
            {isEmployee && (
              <Button variant="ghost" asChild>
                <Link to="/employee">
                  <Briefcase className="w-4 h-4 mr-1" />
                  Pracownik
                </Link>
              </Button>
            )}
            {isAdmin && (
              <Button variant="ghost" asChild>
                <Link to="/admin">
                  <Shield className="w-4 h-4 mr-1" />
                  Admin
                </Link>
              </Button>
            )}
          </nav>

          {/* User controls (desktop) */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {user?.firstName || user?.email}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" /> Wyloguj
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Zaloguj</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Zarejestruj</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t bg-card px-4 py-4 space-y-2">
            <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileOpen(false)}>
              <Link to="/">Strona główna</Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileOpen(false)}>
              <Link to="/offers">Oferty</Link>
            </Button>
            {isAuthenticated && (
              <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileOpen(false)}>
                <Link to="/dashboard">Mój panel</Link>
              </Button>
            )}
            {isEmployee && (
              <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileOpen(false)}>
                <Link to="/employee">
                  <Briefcase className="w-4 h-4 mr-1" /> Pracownik
                </Link>
              </Button>
            )}
            {isAdmin && (
              <Button variant="ghost" className="w-full justify-start" asChild onClick={() => setMobileOpen(false)}>
                <Link to="/admin">
                  <Shield className="w-4 h-4 mr-1" /> Admin
                </Link>
              </Button>
            )}
            <div className="border-t pt-2 mt-2 flex gap-2">
              {isAuthenticated ? (
                <Button variant="outline" size="sm" className="w-full" onClick={() => { handleLogout(); setMobileOpen(false); }}>
                  <LogOut className="w-4 h-4" /> Wyloguj
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" className="flex-1" asChild onClick={() => setMobileOpen(false)}>
                    <Link to="/login">Zaloguj</Link>
                  </Button>
                  <Button size="sm" className="flex-1" asChild onClick={() => setMobileOpen(false)}>
                    <Link to="/register">Zarejestruj</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} GymApp. Wszelkie prawa zastrzeżone.</p>
      </footer>
    </div>
  );
}
