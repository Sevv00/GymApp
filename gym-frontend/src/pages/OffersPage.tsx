import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Offer, ClassInfo } from '../types';
import { ShoppingCart, Calendar, Users, Clock, Tag } from 'lucide-react';

const OffersPage: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [tab, setTab] = useState<'offers' | 'classes'>('offers');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/offers').catch(() => ({ data: [] })),
      api.get('/api/classes').catch(() => ({ data: [] })),
    ]).then(([offersRes, classesRes]) => {
      setOffers(offersRes.data || []);
      setClasses(classesRes.data || []);
      setLoading(false);
    });
  }, []);

  const regularOffers = offers.filter(o => !o.classInfo);
  const classOffers = offers.filter(o => o.classInfo);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-500 text-lg">Ładowanie ofert...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#030027] mb-4">Nasze Oferty</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">Wybierz idealny karnet lub zajęcia dopasowane do Twoich potrzeb i celów.</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-10">
        <div className="bg-[#BCD2EE]/20 rounded-xl p-1 flex">
          <button onClick={() => setTab('offers')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${tab === 'offers' ? 'bg-[#9B7EDE] text-white shadow-md' : 'text-[#030027] hover:bg-white/50'}`}>
            <Tag className="w-4 h-4 inline mr-2" /> Karnety i Oferty
          </button>
          <button onClick={() => setTab('classes')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${tab === 'classes' ? 'bg-[#9B7EDE] text-white shadow-md' : 'text-[#030027] hover:bg-white/50'}`}>
            <Calendar className="w-4 h-4 inline mr-2" /> Zajęcia
          </button>
        </div>
      </div>

      {/* Offers tab */}
      {tab === 'offers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularOffers.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">Brak aktualnych ofert</p>
          ) : (
            regularOffers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 overflow-hidden flex flex-col">
                <div className="bg-gradient-to-r from-[#151E3F] to-[#030027] p-6">
                  <h3 className="text-xl font-bold text-white mb-1">{offer.offerName}</h3>
                  <div className="text-[#B0F2B4] text-2xl font-extrabold">
                    {offer.priceText || `${offer.price} zł`}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  {offer.offerDescription && (
                    <p className="text-gray-600 text-sm mb-4">{offer.offerDescription}</p>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Clock className="w-4 h-4" />
                    <span>Ważność: {offer.durationDays} dni</span>
                  </div>
                  {!offer.isPermanent && offer.offerExpiredDate && (
                    <div className="text-xs text-orange-500 mb-3">
                      Oferta limitowana do {new Date(offer.offerExpiredDate).toLocaleDateString('pl-PL')}
                    </div>
                  )}
                  <div className="mt-auto">
                    <Link to={`/offers/${offer.id}/buy`}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#9B7EDE] hover:bg-[#8568c9] text-white py-3 rounded-xl font-semibold transition-colors">
                      <ShoppingCart className="w-5 h-5" /> Kup teraz
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Classes tab */}
      {tab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">Brak aktualnych zajęć</p>
          ) : (
            classes.map((cls) => (
              <div key={cls.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-[#9B7EDE] to-[#151E3F] p-6">
                  <h3 className="text-xl font-bold text-white mb-1">{cls.offerName || 'Zajęcia'}</h3>
                  {cls.instructorName && (
                    <p className="text-[#BCD2EE] text-sm">Prowadzący: {cls.instructorName}</p>
                  )}
                </div>
                <div className="p-6">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-[#9B7EDE]" />
                      <span>{new Date(cls.startTime).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4 text-[#9B7EDE]" />
                      <span>
                        {new Date(cls.startTime).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {new Date(cls.endTime).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4 text-[#9B7EDE]" />
                      <span>Miejsca: {cls.registeredCount}/{cls.capacity}</span>
                    </div>
                  </div>
                  {cls.registeredCount < cls.capacity ? (
                    <div className="mt-4 bg-[#B0F2B4]/20 text-green-700 text-sm py-2 rounded-lg text-center font-medium">
                      Wolne miejsca
                    </div>
                  ) : (
                    <div className="mt-4 bg-red-50 text-red-600 text-sm py-2 rounded-lg text-center font-medium">
                      Brak miejsc
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default OffersPage;
