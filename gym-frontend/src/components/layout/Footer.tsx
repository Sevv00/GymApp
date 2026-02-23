import React from 'react';
import { Dumbbell, Mail, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#030027] text-[#BCD2EE] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Dumbbell className="w-6 h-6 text-[#9B7EDE]" />
              <span className="text-white font-bold text-xl">GymApp</span>
            </div>
            <p className="text-sm text-[#BCD2EE]/70">
              Twoja siłownia, Twoje cele. Dołącz do nas i zacznij swoją przygodę z treningiem.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold mb-3">Szybkie linki</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-[#B0F2B4] transition-colors">Strona główna</a></li>
              <li><a href="/offers" className="hover:text-[#B0F2B4] transition-colors">Oferty</a></li>
              <li><a href="/login" className="hover:text-[#B0F2B4] transition-colors">Logowanie</a></li>
              <li><a href="/register" className="hover:text-[#B0F2B4] transition-colors">Rejestracja</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-3">Kontakt</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#9B7EDE]" />
                kontakt@gymapp.pl
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#9B7EDE]" />
                +48 123 456 789
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#151E3F] mt-8 pt-6 text-center text-sm text-[#BCD2EE]/50">
          &copy; {new Date().getFullYear()} GymApp. Wszelkie prawa zastrzeżone.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
