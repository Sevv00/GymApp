import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { Announcement, GymInfo } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Phone, Mail, ArrowRight, Megaphone, Dumbbell, Users, Trophy } from 'lucide-react';

export default function MainPage() {
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
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 py-24 sm:py-32 lg:py-40">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6">
              Twoja <span className="text-primary">Siłownia</span>, Twoje{' '}
              <span className="text-accent">Cele</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              {gymInfo?.gymDesc ||
                'Dołącz do naszej społeczności i osiągaj swoje cele fitness. Profesjonalny sprzęt, wykwalifikowana kadra i przyjazna atmosfera.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link to="/offers">
                  Zobacz oferty <ArrowRight className="w-5 h-5 ml-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6">
                <Link to="/register">Dołącz do nas</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Dumbbell className="w-8 h-8 text-primary-foreground" />,
                title: 'Profesjonalny Sprzęt',
                desc: 'Najnowocześniejsze maszyny i wolne ciężary dla każdego poziomu zaawansowania.',
              },
              {
                icon: <Users className="w-8 h-8 text-primary-foreground" />,
                title: 'Zajęcia Grupowe',
                desc: 'Różnorodne zajęcia grupowe prowadzone przez doświadczonych instruktorów.',
              },
              {
                icon: <Trophy className="w-8 h-8 text-primary-foreground" />,
                title: 'Osiągaj Cele',
                desc: 'Indywidualne podejście i wsparcie na drodze do Twoich celów treningowych.',
              },
            ].map((f, i) => (
              <Card key={i} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                  <p className="text-muted-foreground text-sm">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gym Info */}
      {gymInfo && (gymInfo.openingHours || gymInfo.firstPhoneNumber || gymInfo.firstEmail) && (
        <section className="py-16 border-t">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-10">Informacje o siłowni</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {gymInfo.openingHours && (
                <Card>
                  <CardContent className="flex items-start gap-4 pt-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Godziny otwarcia</h3>
                      <p className="text-muted-foreground whitespace-pre-line text-sm">{gymInfo.openingHours}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
              {(gymInfo.firstPhoneNumber || gymInfo.secondPhoneNumber) && (
                <Card>
                  <CardContent className="flex items-start gap-4 pt-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Telefon</h3>
                      {gymInfo.firstPhoneNumber && (
                        <p className="text-muted-foreground text-sm">{gymInfo.firstPhoneNumber}</p>
                      )}
                      {gymInfo.secondPhoneNumber && (
                        <p className="text-muted-foreground text-sm">{gymInfo.secondPhoneNumber}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              {(gymInfo.firstEmail || gymInfo.secondEmail) && (
                <Card>
                  <CardContent className="flex items-start gap-4 pt-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      {gymInfo.firstEmail && (
                        <p className="text-muted-foreground text-sm">{gymInfo.firstEmail}</p>
                      )}
                      {gymInfo.secondEmail && (
                        <p className="text-muted-foreground text-sm">{gymInfo.secondEmail}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Announcements */}
      <section className="py-16 border-t">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10 flex items-center justify-center gap-3">
            <Megaphone className="w-8 h-8 text-primary" /> Aktualności
          </h2>
          {loading ? (
            <div className="text-center text-muted-foreground">Ładowanie...</div>
          ) : announcements.length === 0 ? (
            <p className="text-center text-muted-foreground">Brak aktualności</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.slice(0, 6).map((a) => (
                <Card key={a.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-accent">{a.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{a.content}</p>
                    <div className="flex justify-between items-center text-xs text-muted-foreground/60">
                      <span>{a.authorName}</span>
                      <span>{a.createdAt ? new Date(a.createdAt).toLocaleDateString('pl-PL') : ''}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 border-t bg-gradient-to-r from-primary/20 to-accent/10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Gotowy na zmianę?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Sprawdź nasze oferty i wybierz karnet idealny dla siebie!
          </p>
          <Button size="lg" variant="default" asChild className="text-lg px-8 py-6">
            <Link to="/offers">
              Przejdź do ofert <ArrowRight className="w-5 h-5 ml-1" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
