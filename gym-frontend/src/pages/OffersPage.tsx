import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { Offer, ClassInfo } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Calendar, Users, Clock, Tag } from 'lucide-react';

export default function OffersPage() {
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

  const regularOffers = offers.filter((o) => !o.classInfo);

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
      </div>

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
            regularOffers.map((offer) => (
              <Card key={offer.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-r from-secondary to-card p-6 border-b">
                  <h3 className="text-xl font-bold mb-1">{offer.offerName}</h3>
                  <div className="text-accent text-2xl font-extrabold">
                    {offer.priceText || `${offer.price} zł`}
                  </div>
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
                    <Button asChild className="w-full gap-2">
                      <Link to={`/offers/${offer.id}/buy`}>
                        <ShoppingCart className="w-5 h-5" /> Kup teraz
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Classes tab */}
      {tab === 'classes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.length === 0 ? (
            <p className="col-span-full text-center text-muted-foreground">Brak aktualnych zajęć</p>
          ) : (
            classes.map((cls) => (
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
                  {cls.registeredCount < cls.capacity ? (
                    <div className="mt-4 bg-accent/20 text-accent-foreground dark:text-accent text-sm py-2 rounded-lg text-center font-medium">
                      Wolne miejsca
                    </div>
                  ) : (
                    <div className="mt-4 bg-destructive/10 text-destructive text-sm py-2 rounded-lg text-center font-medium">
                      Brak miejsc
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
