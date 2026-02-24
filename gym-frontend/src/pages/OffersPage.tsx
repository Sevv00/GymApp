import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Offer, ClassInfo, Purchase } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Calendar, Users, Clock, Tag, UserPlus, UserMinus, Percent } from 'lucide-react';

export default function OffersPage() {
  const { isAuthenticated, user } = useAuth();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<number[]>([]);
  const [myPurchases, setMyPurchases] = useState<Purchase[]>([]);
  const [tab, setTab] = useState<'offers' | 'classes'>('offers');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [msg, setMsg] = useState('');

  const loadData = () => {
    const requests: Promise<any>[] = [
      api.get('/api/offers').catch(() => ({ data: [] })),
      api.get('/api/classes').catch(() => ({ data: [] })),
    ];
    if (isAuthenticated) {
      requests.push(api.get('/api/classes/my-registrations').catch(() => ({ data: [] })));
      requests.push(api.get('/api/purchases/my').catch(() => ({ data: [] })));
    }
    Promise.all(requests).then(([offersRes, classesRes, regRes, purchasesRes]) => {
      setOffers(offersRes.data || []);
      setClasses(classesRes.data || []);
      if (regRes) setMyRegistrations(regRes.data || []);
      if (purchasesRes) setMyPurchases(purchasesRes.data || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [isAuthenticated]);

  const handleRegister = async (classId: number) => {
    setActionLoading(classId);
    setMsg('');
    try {
      await api.post(`/api/classes/${classId}/register`);
      setMsg('Zapisano na zajęcia!');
      loadData();
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Błąd zapisu');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnregister = async (classId: number) => {
    setActionLoading(classId);
    setMsg('');
    try {
      await api.delete(`/api/classes/${classId}/unregister`);
      setMsg('Wypisano z zajęć');
      loadData();
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Błąd wypisu');
    } finally {
      setActionLoading(null);
    }
  };

  // Discount calculation
  const getDiscountMultiplier = (): number => {
    if (!user?.discount || user.discount === 'NONE') return 1;
    if (user.discount === 'STUDENT') return 0.8;
    if (user.discount === 'MULTISPORT') return 0.6;
    return 1;
  };

  const getDiscountLabel = (): string | null => {
    if (!user?.discount || user.discount === 'NONE') return null;
    if (user.discount === 'STUDENT') return '-20% STUDENT';
    if (user.discount === 'MULTISPORT') return '-40% MULTISPORT';
    return null;
  };

  const discountMultiplier = getDiscountMultiplier();
  const discountLabel = getDiscountLabel();

  const regularOffers = offers.filter((o) => !o.classInfo);

  const hasActivePurchase = (offerId: number): boolean => {
    return myPurchases.some(
      (p) => p.offerId === offerId && p.validUntil && new Date(p.validUntil) > new Date()
    );
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-muted-foreground text-lg">Ładowanie ofert...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Nasze Oferty</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Wybierz idealny karnet lub zajęcia dopasowane do Twoich potrzeb i celów.
        </p>
        {discountLabel && (
          <div className="mt-3 inline-flex items-center gap-2 bg-accent/20 text-accent-foreground dark:text-accent px-4 py-2 rounded-full text-sm font-medium">
            <Percent className="w-4 h-4" /> Twoja zniżka: {discountLabel}
          </div>
        )}
      </div>

      {msg && (
        <div className="bg-accent/10 border border-accent/30 text-accent-foreground dark:text-accent px-4 py-3 rounded-lg mb-6 text-sm text-center">
          {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex justify-center mb-10">
        <div className="bg-muted rounded-lg p-1 flex">
          <Button
            variant={tab === 'offers' ? 'default' : 'ghost'}
            onClick={() => setTab('offers')}
            className="gap-2"
          >
            <Tag className="w-4 h-4" /> Karnety i Oferty
          </Button>
          <Button
            variant={tab === 'classes' ? 'default' : 'ghost'}
            onClick={() => setTab('classes')}
            className="gap-2"
          >
            <Calendar className="w-4 h-4" /> Zajęcia
          </Button>
        </div>
      </div>

      {/* Offers tab */}
      {tab === 'offers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {regularOffers.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground">Brak aktualnych ofert</p>
          ) : (
            regularOffers.map((offer) => {
              const discountedPrice = (offer.price * discountMultiplier).toFixed(2);
              const hasDiscount = discountMultiplier < 1;
              return (
                <Card key={offer.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="bg-gradient-to-r from-secondary to-card p-6 border-b">
                    <h3 className="text-xl font-bold mb-1">{offer.offerName}</h3>
                    {hasDiscount ? (
                      <div>
                        <div className="text-muted-foreground line-through text-sm">
                          {offer.priceText || `${offer.price} zł`}
                        </div>
                        <div className="text-accent text-2xl font-extrabold">
                          {discountedPrice} zł
                          <span className="text-xs ml-2 bg-accent/20 px-2 py-0.5 rounded-full">{discountLabel}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-accent text-2xl font-extrabold">
                        {offer.priceText || `${offer.price} zł`}
                      </div>
                    )}
                  </div>
                  <CardContent className="flex-1 flex flex-col pt-6">
                    {offer.offerDescription && (
                      <p className="text-muted-foreground text-sm mb-4">{offer.offerDescription}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Clock className="w-4 h-4" />
                      <span>Ważność: {offer.durationDays} dni</span>
                    </div>
                    {!offer.isPermanent && offer.offerExpiredDate && (
                      <div className="text-xs text-destructive mb-3">
                        Oferta limitowana do{' '}
                        {new Date(offer.offerExpiredDate).toLocaleDateString('pl-PL')}
                      </div>
                    )}
                    <div className="mt-auto pt-4">
                      {isAuthenticated && hasActivePurchase(offer.id) ? (
                        <div className="w-full text-center bg-accent/20 text-accent-foreground dark:text-accent text-sm py-2.5 rounded-lg font-medium">
                          Posiadasz aktywny karnet
                        </div>
                      ) : (
                        <Button asChild className="w-full gap-2">
                          <Link to={`/offers/${offer.id}/buy`}>
                            <ShoppingCart className="w-5 h-5" /> Kup teraz
                          </Link>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Classes tab */}
      {tab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground">Brak aktualnych zajęć</p>
          ) : (
            classes.map((cls) => {
              const isRegistered = myRegistrations.includes(cls.id);
              const isFull = cls.registeredCount >= cls.capacity;
              return (
                <Card key={cls.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="bg-gradient-to-r from-primary/20 to-secondary p-6 border-b">
                    <h3 className="text-xl font-bold mb-1">{cls.offerName || 'Zajęcia'}</h3>
                    {cls.instructorName && (
                      <p className="text-muted-foreground text-sm">Prowadzący: {cls.instructorName}</p>
                    )}
                  </div>
                  <CardContent className="pt-6">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>
                          {new Date(cls.startTime).toLocaleDateString('pl-PL', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>
                          {new Date(cls.startTime).toLocaleTimeString('pl-PL', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                          {' - '}
                          {new Date(cls.endTime).toLocaleTimeString('pl-PL', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-4 h-4 text-primary" />
                        <span>
                          Miejsca: {cls.registeredCount}/{cls.capacity}
                        </span>
                      </div>
                    </div>

                    {/* Registration buttons */}
                    {isAuthenticated ? (
                      isRegistered ? (
                        <Button
                          variant="destructive"
                          className="w-full mt-4 gap-2"
                          disabled={actionLoading === cls.id}
                          onClick={() => handleUnregister(cls.id)}
                        >
                          <UserMinus className="w-4 h-4" />
                          {actionLoading === cls.id ? 'Wypisywanie...' : 'Wypisz się'}
                        </Button>
                      ) : isFull ? (
                        <div className="mt-4 bg-destructive/10 text-destructive text-sm py-2 rounded-lg text-center font-medium">
                          Brak miejsc
                        </div>
                      ) : (
                        <Button
                          className="w-full mt-4 gap-2"
                          disabled={actionLoading === cls.id}
                          onClick={() => handleRegister(cls.id)}
                        >
                          <UserPlus className="w-4 h-4" />
                          {actionLoading === cls.id ? 'Zapisywanie...' : 'Zapisz się'}
                        </Button>
                      )
                    ) : !isFull ? (
                      <div className="mt-4 bg-accent/20 text-accent-foreground dark:text-accent text-sm py-2 rounded-lg text-center font-medium">
                        Wolne miejsca — <Link to="/login" className="underline font-semibold">zaloguj się</Link>, aby się zapisać
                      </div>
                    ) : (
                      <div className="mt-4 bg-destructive/10 text-destructive text-sm py-2 rounded-lg text-center font-medium">
                        Brak miejsc
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
