import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Offer } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreditCard, CheckCircle, ArrowLeft } from 'lucide-react';

export default function OffersTransaction() {
  const { offerId } = useParams<{ offerId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [guestForm, setGuestForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });

  useEffect(() => {
    api
      .get(`/api/offers/${offerId}`)
      .then((res) => {
        setOffer(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Nie udało się pobrać oferty');
        setLoading(false);
      });
  }, [offerId]);

  const handleGuestChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGuestForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
        <div className="text-muted-foreground text-lg">Ładowanie...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-8 pb-8">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-accent-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Zakup potwierdzony!</h2>
            <p className="text-muted-foreground mb-4">
              Oferta <strong>{offer?.offerName}</strong> została zakupiona pomyślnie.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Ważność: {offer?.durationDays} dni od daty zakupu
            </p>
            <Button onClick={() => navigate('/offers')}>Wróć do ofert</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 gap-2">
        <ArrowLeft className="w-5 h-5" /> Powrót
      </Button>

      <Card className="overflow-hidden">
        {/* Offer summary */}
        <div className="bg-gradient-to-r from-secondary to-card p-8 border-b">
          <h1 className="text-2xl font-bold mb-2">{offer?.offerName}</h1>
          <div className="text-accent text-3xl font-extrabold">
            {offer?.priceText || `${offer?.price} zł`}
          </div>
          {offer?.offerDescription && (
            <p className="text-muted-foreground mt-2 text-sm">{offer.offerDescription}</p>
          )}
          <p className="text-muted-foreground/70 mt-1 text-sm">
            Ważność: {offer?.durationDays} dni
          </p>
        </div>

        {/* Purchase form */}
        <CardContent className="p-8">
          <CardTitle className="flex items-center gap-2 mb-6">
            <CreditCard className="w-6 h-6 text-primary" /> Finalizacja zakupu
          </CardTitle>

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {isAuthenticated ? (
            <div>
              <div className="bg-muted rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-1">Zalogowany jako:</p>
                <p className="font-semibold">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <Button onClick={handlePurchase} disabled={submitting} className="w-full" size="lg">
                {submitting ? 'Przetwarzanie...' : 'Potwierdź zakup'}
              </Button>
            </div>
          ) : (
            <form onSubmit={handlePurchase} className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Nie jesteś zalogowany. Podaj swoje dane, aby dokonać zakupu jako gość.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Imię</label>
                  <Input
                    type="text"
                    name="firstName"
                    value={guestForm.firstName}
                    onChange={handleGuestChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nazwisko</label>
                  <Input
                    type="text"
                    name="lastName"
                    value={guestForm.lastName}
                    onChange={handleGuestChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <Input
                  type="email"
                  name="email"
                  value={guestForm.email}
                  onChange={handleGuestChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefon</label>
                <Input
                  type="tel"
                  name="phoneNumber"
                  value={guestForm.phoneNumber}
                  onChange={handleGuestChange}
                />
              </div>
              <Button type="submit" disabled={submitting} className="w-full" size="lg">
                {submitting ? 'Przetwarzanie...' : 'Kup jako gość'}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Masz konto?{' '}
                <Link to="/login" className="text-primary font-semibold hover:underline">
                  Zaloguj się
                </Link>{' '}
                aby zakupić szybciej.
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
