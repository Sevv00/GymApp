import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Announcement, GymInfo } from '../types';
import { Clock, Phone, Mail, ArrowRight, Megaphone, Dumbbell, Users, Trophy } from 'lucide-react';

const MainPage: React.FC = () => {
  const [gymInfo, setGymInfo] = useState<GymInfo | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/gym-info').catch(() => ({ data: null })),
      api.get('/api/announcements').catch(() => ({ data: [] })),
    ]).then(([gymRes, annRes]) => {
      setGymInfo(gymRes.data);
      setAnnouncements(annRes.data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#030027] via-[#151E3F] to-[#030027] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#9B7EDE] rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-[#B0F2B4] rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32 lg:py-40">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
              Twoja <span className="text-[#9B7EDE]">Siłownia</span>, Twoje <span className="text-[#B0F2B4]">Cele</span>
            </h1>
            <p className="text-lg sm:text-xl text-[#BCD2EE] max-w-2xl mx-auto mb-8">
              {gymInfo?.gymDesc || 'Dołącz do naszej społeczności i osiągaj swoje cele fitness. Profesjonalny sprzęt, wykwalifikowana kadra i przyjazna atmosfera.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/offers" className="inline-flex items-center gap-2 bg-[#9B7EDE] hover:bg-[#8568c9] px-8 py-4 rounded-xl text-lg font-bold transition-all transform hover:scale-105">
                Zobacz oferty <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/register" className="inline-flex items-center gap-2 border-2 border-[#B0F2B4] text-[#B0F2B4] hover:bg-[#B0F2B4] hover:text-[#030027] px-8 py-4 rounded-xl text-lg font-bold transition-all">
                Dołącz do nas
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-[#BCD2EE]/20 to-transparent hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[#9B7EDE] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#030027] mb-2">Profesjonalny Sprzęt</h3>
              <p className="text-gray-600">Najnowocześniejsze maszyny i wolne ciężary dla każdego poziomu zaawansowania.</p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-[#BCD2EE]/20 to-transparent hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[#9B7EDE] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#030027] mb-2">Zajęcia Grupowe</h3>
              <p className="text-gray-600">Różnorodne zajęcia grupowe prowadzone przez doświadczonych instruktorów.</p>
            </div>
            <div className="text-center p-8 rounded-2xl bg-gradient-to-b from-[#BCD2EE]/20 to-transparent hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-[#9B7EDE] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#030027] mb-2">Osiągaj Cele</h3>
              <p className="text-gray-600">Indywidualne podejście i wsparcie na drodze do Twoich celów treningowych.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Gym Info */}
      {gymInfo && (gymInfo.openingHours || gymInfo.firstPhoneNumber || gymInfo.firstEmail) && (
        <section className="py-16 bg-[#BCD2EE]/10">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-[#030027] mb-10">Informacje o siłowni</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {gymInfo.openingHours && (
                <div className="bg-white p-6 rounded-2xl shadow-sm flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#9B7EDE]/10 rounded-xl flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6 text-[#9B7EDE]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#030027] mb-1">Godziny otwarcia</h3>
                    <p className="text-gray-600 whitespace-pre-line text-sm">{gymInfo.openingHours}</p>
                  </div>
                </div>
              )}
              {(gymInfo.firstPhoneNumber || gymInfo.secondPhoneNumber) && (
                <div className="bg-white p-6 rounded-2xl shadow-sm flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#9B7EDE]/10 rounded-xl flex items-center justify-center shrink-0">
                    <Phone className="w-6 h-6 text-[#9B7EDE]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#030027] mb-1">Telefon</h3>
                    {gymInfo.firstPhoneNumber && <p className="text-gray-600 text-sm">{gymInfo.firstPhoneNumber}</p>}
                    {gymInfo.secondPhoneNumber && <p className="text-gray-600 text-sm">{gymInfo.secondPhoneNumber}</p>}
                  </div>
                </div>
              )}
              {(gymInfo.firstEmail || gymInfo.secondEmail) && (
                <div className="bg-white p-6 rounded-2xl shadow-sm flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#9B7EDE]/10 rounded-xl flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6 text-[#9B7EDE]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#030027] mb-1">Email</h3>
                    {gymInfo.firstEmail && <p className="text-gray-600 text-sm">{gymInfo.firstEmail}</p>}
                    {gymInfo.secondEmail && <p className="text-gray-600 text-sm">{gymInfo.secondEmail}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Announcements */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-[#030027] mb-10 flex items-center justify-center gap-3">
            <Megaphone className="w-8 h-8 text-[#9B7EDE]" /> Aktualności
          </h2>
          {loading ? (
            <div className="text-center text-gray-500">Ładowanie...</div>
          ) : announcements.length === 0 ? (
            <p className="text-center text-gray-500">Brak aktualności</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.slice(0, 6).map((a) => (
                <div key={a.id} className="bg-gradient-to-br from-[#151E3F] to-[#030027] text-white rounded-2xl p-6 hover:shadow-xl transition-shadow">
                  <h3 className="text-lg font-bold mb-2 text-[#B0F2B4]">{a.title}</h3>
                  <p className="text-[#BCD2EE] text-sm mb-4 line-clamp-3">{a.content}</p>
                  <div className="flex justify-between items-center text-xs text-[#BCD2EE]/60">
                    <span>{a.authorName}</span>
                    <span>{a.createdAt ? new Date(a.createdAt).toLocaleDateString('pl-PL') : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-[#9B7EDE] to-[#151E3F]">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Gotowy na zmianę?</h2>
          <p className="text-[#BCD2EE] text-lg mb-8">Sprawdź nasze oferty i wybierz karnet idealny dla siebie!</p>
          <Link to="/offers" className="inline-flex items-center gap-2 bg-[#B0F2B4] text-[#030027] px-8 py-4 rounded-xl text-lg font-bold hover:bg-[#9de0a1] transition-all transform hover:scale-105">
            Przejdź do ofert <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default MainPage;
