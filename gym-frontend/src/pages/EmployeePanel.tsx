import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { Announcement, Offer, ClassInfo, GymInfo } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Megaphone, Tag, Calendar, Info, Plus, Trash2, Edit2, Save, X } from 'lucide-react';

export default function EmployeePanel() {
  const { isEmployee, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'announcements' | 'offers' | 'classes' | 'gyminfo'>('announcements');

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnn, setNewAnn] = useState({ title: '', content: '' });
  const [editAnnId, setEditAnnId] = useState<number | null>(null);
  const [editAnn, setEditAnn] = useState({ title: '', content: '' });

  const [offers, setOffers] = useState<Offer[]>([]);
  const [newOffer, setNewOffer] = useState({
    offerName: '',
    offerDescription: '',
    priceText: '',
    price: '',
    durationDays: '',
    isPermanent: true,
  });

  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [newClass, setNewClass] = useState({ offerId: '', startTime: '', endTime: '', capacity: '' });

  const [gymInfo, setGymInfo] = useState<GymInfo>({});
  const [gymMsg, setGymMsg] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !isEmployee) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, isEmployee]);

  const loadData = async () => {
    const [annRes, offRes, clsRes, gymRes] = await Promise.all([
      api.get('/api/announcements/all').catch(() => ({ data: [] })),
      api.get('/api/offers/all').catch(() => ({ data: [] })),
      api.get('/api/classes').catch(() => ({ data: [] })),
      api.get('/api/gym-info').catch(() => ({ data: {} })),
    ]);
    setAnnouncements(annRes.data || []);
    setOffers(offRes.data || []);
    setClasses(clsRes.data || []);
    setGymInfo(gymRes.data || {});
  };

  const handleCreateAnn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/announcements', newAnn);
      setNewAnn({ title: '', content: '' });
      setMsg('Ogłoszenie dodane!');
      loadData();
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Błąd');
    }
  };

  const handleUpdateAnn = async (id: number) => {
    try {
      await api.put(`/api/announcements/${id}`, editAnn);
      setEditAnnId(null);
      setMsg('Ogłoszenie zaktualizowane!');
      loadData();
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Błąd');
    }
  };

  const handleDeleteAnn = async (id: number) => {
    if (!window.confirm('Dezaktywować ogłoszenie?')) return;
    try {
      await api.delete(`/api/announcements/${id}`);
      setMsg('Ogłoszenie dezaktywowane');
      loadData();
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Błąd');
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/offers', {
        ...newOffer,
        price: Number(newOffer.price),
        durationDays: Number(newOffer.durationDays),
      });
      setNewOffer({ offerName: '', offerDescription: '', priceText: '', price: '', durationDays: '', isPermanent: true });
      setMsg('Oferta dodana!');
      loadData();
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Błąd');
    }
  };

  const handleDeleteOffer = async (id: number) => {
    if (!window.confirm('Dezaktywować ofertę?')) return;
    try {
      await api.delete(`/api/offers/${id}`);
      setMsg('Oferta dezaktywowana');
      loadData();
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Błąd');
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/classes', {
        offerId: Number(newClass.offerId),
        startTime: newClass.startTime,
        endTime: newClass.endTime,
        capacity: Number(newClass.capacity),
      });
      setNewClass({ offerId: '', startTime: '', endTime: '', capacity: '' });
      setMsg('Zajęcia dodane!');
      loadData();
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Błąd');
    }
  };

  const handleDeleteClass = async (id: number) => {
    if (!window.confirm('Usunąć zajęcia?')) return;
    try {
      await api.delete(`/api/classes/${id}`);
      setMsg('Zajęcia usunięte');
      loadData();
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Błąd');
    }
  };

  const handleSaveGymInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/api/gym-info', gymInfo);
      setGymMsg('Informacje zaktualizowane!');
      loadData();
    } catch (err: any) {
      setGymMsg(err.response?.data?.error || 'Błąd');
    }
  };

  if (!isEmployee) return null;

  const tabItems = [
    { key: 'announcements' as const, label: 'Ogłoszenia', icon: <Megaphone className="w-4 h-4" /> },
    { key: 'offers' as const, label: 'Oferty', icon: <Tag className="w-4 h-4" /> },
    { key: 'classes' as const, label: 'Zajęcia', icon: <Calendar className="w-4 h-4" /> },
    { key: 'gyminfo' as const, label: 'Info o siłowni', icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Panel Pracownika</h1>

      {msg && (
        <div className="bg-accent/10 border border-accent/30 text-accent-foreground dark:text-accent px-4 py-3 rounded-lg mb-6 text-sm flex justify-between items-center">
          {msg}
          <button onClick={() => setMsg('')}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabItems.map((t) => (
          <Button
            key={t.key}
            variant={tab === t.key ? 'default' : 'outline'}
            onClick={() => setTab(t.key)}
            className="gap-2"
          >
            {t.icon} {t.label}
          </Button>
        ))}
      </div>

      {/* Announcements */}
      {tab === 'announcements' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" /> Nowe ogłoszenie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateAnn} className="space-y-3">
                <Input
                  placeholder="Tytuł"
                  value={newAnn.title}
                  onChange={(e) => setNewAnn((p) => ({ ...p, title: e.target.value }))}
                  required
                />
                <textarea
                  placeholder="Treść"
                  value={newAnn.content}
                  onChange={(e) => setNewAnn((p) => ({ ...p, content: e.target.value }))}
                  required
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
                />
                <Button type="submit">Dodaj</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Lista ogłoszeń</CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border">
              {announcements.map((a) => (
                <div key={a.id} className="p-4">
                  {editAnnId === a.id ? (
                    <div className="space-y-2">
                      <Input
                        value={editAnn.title}
                        onChange={(e) => setEditAnn((p) => ({ ...p, title: e.target.value }))}
                      />
                      <textarea
                        value={editAnn.content}
                        onChange={(e) => setEditAnn((p) => ({ ...p, content: e.target.value }))}
                        rows={2}
                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs"
                      />
                      <div className="flex gap-2">
                        <Button size="icon-sm" variant="ghost" onClick={() => handleUpdateAnn(a.id)}>
                          <Save className="w-4 h-4 text-accent" />
                        </Button>
                        <Button size="icon-sm" variant="ghost" onClick={() => setEditAnnId(null)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">
                          {a.title}{' '}
                          {!a.isActive && <span className="text-xs text-destructive">(Nieaktywne)</span>}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">{a.content}</div>
                        <div className="text-xs text-muted-foreground/60 mt-1">
                          {a.authorName} |{' '}
                          {a.createdAt ? new Date(a.createdAt).toLocaleDateString('pl-PL') : ''}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0 ml-4">
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={() => {
                            setEditAnnId(a.id);
                            setEditAnn({ title: a.title, content: a.content });
                          }}
                        >
                          <Edit2 className="w-4 h-4 text-primary" />
                        </Button>
                        <Button size="icon-sm" variant="ghost" onClick={() => handleDeleteAnn(a.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Offers */}
      {tab === 'offers' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" /> Nowa oferta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateOffer} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Nazwa oferty"
                  value={newOffer.offerName}
                  onChange={(e) => setNewOffer((p) => ({ ...p, offerName: e.target.value }))}
                  required
                />
                <Input
                  placeholder="Cena opisowo (np. 120zł/mc)"
                  value={newOffer.priceText}
                  onChange={(e) => setNewOffer((p) => ({ ...p, priceText: e.target.value }))}
                />
                <Input
                  type="number"
                  placeholder="Cena (PLN)"
                  value={newOffer.price}
                  onChange={(e) => setNewOffer((p) => ({ ...p, price: e.target.value }))}
                  required
                  step="0.01"
                />
                <Input
                  type="number"
                  placeholder="Czas trwania (dni)"
                  value={newOffer.durationDays}
                  onChange={(e) => setNewOffer((p) => ({ ...p, durationDays: e.target.value }))}
                  required
                />
                <textarea
                  placeholder="Opis oferty"
                  value={newOffer.offerDescription}
                  onChange={(e) => setNewOffer((p) => ({ ...p, offerDescription: e.target.value }))}
                  rows={2}
                  className="sm:col-span-2 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
                />
                <div className="sm:col-span-2 flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={newOffer.isPermanent}
                      onChange={(e) => setNewOffer((p) => ({ ...p, isPermanent: e.target.checked }))}
                      className="w-4 h-4 rounded accent-primary"
                    />
                    Oferta stała
                  </label>
                  <Button type="submit" className="ml-auto">
                    Dodaj ofertę
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Lista ofert</CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border">
              {offers.map((o) => (
                <div key={o.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div>
                    <div className="font-medium">
                      {o.offerName}{' '}
                      {!o.isActive && <span className="text-xs text-destructive">(Nieaktywna)</span>}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {o.priceText || `${o.price} zł`} | {o.durationDays} dni
                    </div>
                  </div>
                  <Button size="icon-sm" variant="ghost" onClick={() => handleDeleteOffer(o.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Classes */}
      {tab === 'classes' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" /> Nowe zajęcia
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateClass} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <select
                  value={newClass.offerId}
                  onChange={(e) => setNewClass((p) => ({ ...p, offerId: e.target.value }))}
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
                >
                  <option value="">Wybierz ofertę...</option>
                  {offers
                    .filter((o) => o.isActive)
                    .map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.offerName}
                      </option>
                    ))}
                </select>
                <Input
                  type="number"
                  placeholder="Maks. uczestników"
                  value={newClass.capacity}
                  onChange={(e) => setNewClass((p) => ({ ...p, capacity: e.target.value }))}
                  required
                />
                <div className="space-y-1">
                  <label className="block text-xs text-muted-foreground">Początek</label>
                  <Input
                    type="datetime-local"
                    value={newClass.startTime}
                    onChange={(e) => setNewClass((p) => ({ ...p, startTime: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs text-muted-foreground">Koniec</label>
                  <Input
                    type="datetime-local"
                    value={newClass.endTime}
                    onChange={(e) => setNewClass((p) => ({ ...p, endTime: e.target.value }))}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button type="submit">Dodaj zajęcia</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-base">Lista zajęć</CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border">
              {classes.map((c) => (
                <div key={c.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                  <div>
                    <div className="font-medium">{c.offerName || 'Zajęcia'}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(c.startTime).toLocaleString('pl-PL')} —{' '}
                      {new Date(c.endTime).toLocaleTimeString('pl-PL', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      | {c.registeredCount}/{c.capacity} uczestników
                    </div>
                    {c.instructorName && (
                      <div className="text-xs text-muted-foreground/60">Prowadzący: {c.instructorName}</div>
                    )}
                  </div>
                  <Button size="icon-sm" variant="ghost" onClick={() => handleDeleteClass(c.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gym Info */}
      {tab === 'gyminfo' && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Informacje o siłowni</CardTitle>
          </CardHeader>
          <CardContent>
            {gymMsg && (
              <div className="bg-accent/10 text-accent-foreground dark:text-accent px-4 py-3 rounded-lg mb-4 text-sm">
                {gymMsg}
              </div>
            )}
            <form onSubmit={handleSaveGymInfo} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Opis siłowni</label>
                <textarea
                  value={gymInfo.gymDesc || ''}
                  onChange={(e) => setGymInfo((p) => ({ ...p, gymDesc: e.target.value }))}
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Godziny otwarcia</label>
                <textarea
                  value={gymInfo.openingHours || ''}
                  onChange={(e) => setGymInfo((p) => ({ ...p, openingHours: e.target.value }))}
                  rows={3}
                  placeholder={'Pon-Pt: 6:00-22:00\nSob: 8:00-20:00\nNd: 9:00-18:00'}
                  className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefon 1</label>
                  <Input
                    value={gymInfo.firstPhoneNumber || ''}
                    onChange={(e) => setGymInfo((p) => ({ ...p, firstPhoneNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefon 2</label>
                  <Input
                    value={gymInfo.secondPhoneNumber || ''}
                    onChange={(e) => setGymInfo((p) => ({ ...p, secondPhoneNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email 1</label>
                  <Input
                    type="email"
                    value={gymInfo.firstEmail || ''}
                    onChange={(e) => setGymInfo((p) => ({ ...p, firstEmail: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email 2</label>
                  <Input
                    type="email"
                    value={gymInfo.secondEmail || ''}
                    onChange={(e) => setGymInfo((p) => ({ ...p, secondEmail: e.target.value }))}
                  />
                </div>
              </div>
              <Button type="submit" className="gap-2">
                <Save className="w-5 h-5" /> Zapisz zmiany
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
