import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Dumbbell, User, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const { isAuthenticated, isEmployee, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-[#151E3F] text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl hover:text-[#B0F2B4] transition-colors">
            <Dumbbell className="w-7 h-7 text-[#9B7EDE]" />
            <span>GymApp</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="hover:text-[#B0F2B4] transition-colors">Strona główna</Link>
            <Link to="/offers" className="hover:text-[#B0F2B4] transition-colors">Oferty</Link>

            {!isAuthenticated ? (
              <>
                <Link to="/login" className="hover:text-[#B0F2B4] transition-colors">Logowanie</Link>
                <Link to="/register" className="bg-[#9B7EDE] px-4 py-2 rounded-lg hover:bg-[#8568c9] transition-colors font-semibold">
                  Rejestracja
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="hover:text-[#B0F2B4] transition-colors">Mój Panel</Link>
                {isEmployee && (
                  <Link to="/employee" className="hover:text-[#B0F2B4] transition-colors">Panel Pracownika</Link>
                )}
                {isAdmin && (
                  <Link to="/admin" className="hover:text-[#B0F2B4] transition-colors">Admin</Link>
                )}
                <div className="flex items-center gap-3 ml-2">
                  <span className="text-[#BCD2EE] text-sm flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {user?.firstName || user?.email}
                  </span>
                  <button onClick={handleLogout} className="text-red-300 hover:text-red-100 transition-colors" title="Wyloguj">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden bg-[#151E3F] border-t border-[#9B7EDE]/30 px-4 pb-4">
          <div className="flex flex-col gap-3 pt-3">
            <Link to="/" onClick={() => setMobileOpen(false)} className="hover:text-[#B0F2B4] py-1">Strona główna</Link>
            <Link to="/offers" onClick={() => setMobileOpen(false)} className="hover:text-[#B0F2B4] py-1">Oferty</Link>
            {!isAuthenticated ? (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="hover:text-[#B0F2B4] py-1">Logowanie</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="bg-[#9B7EDE] px-4 py-2 rounded-lg text-center font-semibold">Rejestracja</Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="hover:text-[#B0F2B4] py-1">Mój Panel</Link>
                {isEmployee && <Link to="/employee" onClick={() => setMobileOpen(false)} className="hover:text-[#B0F2B4] py-1">Panel Pracownika</Link>}
                {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)} className="hover:text-[#B0F2B4] py-1">Admin</Link>}
                <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="text-red-300 hover:text-red-100 py-1 text-left flex items-center gap-2">
                  <LogOut className="w-4 h-4" /> Wyloguj
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
