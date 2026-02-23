import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Offer } from '../types';
import { CreditCard, CheckCircle, ArrowLeft } from 'lucide-react';

const OffersTransaction: React.FC = () => {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Guest form
  const [guestForm, setGuestForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });

  useEffect(() => {
    api.get(`/api/offers/${offerId}`)
      .then(res => {
        setOffer(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Nie udało się pobrać oferty');
        setLoading(false);
      });
  }, [offerId]);

  const handleGuestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuestForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (isAuthenticated) {
        await api.post('/api/purchases', { offerId: Number(offerId) });
      } else {
        await api.post('/api/purchases/guest', {
          offerId: Number(offerId),
          ...guestForm,
        });
      }
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Błąd podczas zakupu. Spróbuj ponownie.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-gray-500 text-lg">Ładowanie...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-[#B0F2B4] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-700" />
          </div>
          <h2 className="text-2xl font-bold text-[#030027] mb-2">Zakup potwierdzony!</h2>
          <p className="text-gray-600 mb-4">
            Oferta <strong>{offer?.offerName}</strong> została zakupiona pomyślnie.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Ważność: {offer?.durationDays} dni od daty zakupu
          </p>
          <button onClick={() => navigate('/offers')}
            className="bg-[#9B7EDE] hover:bg-[#8568c9] text-white px-6 py-3 rounded-xl font-semibold transition-colors">
            Wróć do ofert
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-[#9B7EDE] hover:text-[#8568c9] mb-6 font-medium">
        <ArrowLeft className="w-5 h-5" /> Powrót
      </button>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Offer summary */}
        <div className="bg-gradient-to-r from-[#151E3F] to-[#030027] p-8">
          <h1 className="text-2xl font-bold text-white mb-2">{offer?.offerName}</h1>
          <div className="text-[#B0F2B4] text-3xl font-extrabold">
            {offer?.priceText || `${offer?.price} zł`}
          </div>
          {offer?.offerDescription && (
            <p className="text-[#BCD2EE] mt-2 text-sm">{offer.offerDescription}</p>
          )}
          <p className="text-[#BCD2EE]/70 mt-1 text-sm">Ważność: {offer?.durationDays} dni</p>
        </div>

        {/* Purchase form */}
        <div className="p-8">
          <h2 className="text-xl font-bold text-[#030027] mb-6 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#9B7EDE]" /> Finalizacja zakupu
          </h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          {isAuthenticated ? (
            <div>
              <div className="bg-[#BCD2EE]/10 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Zalogowany jako:</p>
                <p className="font-semibold text-[#030027]">{user?.firstName} {user?.lastName}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
              <button onClick={handlePurchase} disabled={submitting}
                className="w-full bg-[#B0F2B4] hover:bg-[#9de0a1] text-[#030027] py-4 rounded-xl font-bold text-lg transition-colors disabled:opacity-50">
                {submitting ? 'Przetwarzanie...' : 'Potwierdź zakup'}
              </button>
            </div>
          ) : (
            <form onSubmit={handlePurchase} className="space-y-4">
              <p className="text-sm text-gray-500 mb-4">
                Nie jesteś zalogowany. Podaj swoje dane, aby dokonać zakupu jako gość.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#030027] mb-1">Imię</label>
                  <input type="text" name="firstName" value={guestForm.firstName} onChange={handleGuestChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE] transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#030027] mb-1">Nazwisko</label>
                  <input type="text" name="lastName" value={guestForm.lastName} onChange={handleGuestChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE] transition" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#030027] mb-1">Email *</label>
                <input type="email" name="email" value={guestForm.email} onChange={handleGuestChange} required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE] transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#030027] mb-1">Telefon</label>
                <input type="tel" name="phoneNumber" value={guestForm.phoneNumber} onChange={handleGuestChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE] transition" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full bg-[#B0F2B4] hover:bg-[#9de0a1] text-[#030027] py-4 rounded-xl font-bold text-lg transition-colors disabled:opacity-50 mt-2">
                {submitting ? 'Przetwarzanie...' : 'Kup jako gość'}
              </button>
              <p className="text-center text-sm text-gray-500">
                Masz konto? <a href="/login" className="text-[#9B7EDE] font-semibold hover:underline">Zaloguj się</a> aby zakupić szybciej.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default OffersTransaction;
