import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { Purchase, GymAdmission } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserCircle, ShoppingBag, Clock, CalendarDays, Save, Trash2, Edit2 } from 'lucide-react';

export default function LoggedUserPage() {
  const { user, isAuthenticated, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [admissions, setAdmissions] = useState<GymAdmission[]>([]);
  const [tab, setTab] = useState<'overview' | 'purchases' | 'admissions' | 'edit'>('overview');
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    discount: 'NONE',
    adAgreement: false,
    password: '',
  });
  const [editMsg, setEditMsg] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    Promise.all([
      api.get('/api/purchases/my').catch(() => ({ data: [] })),
      api.get('/api/purchases/admissions').catch(() => ({ data: [] })),
    ]).then(([pRes, aRes]) => {
      setPurchases(pRes.data || []);
      setAdmissions(aRes.data || []);
      setLoading(false);
    });
  }, [isAuthenticated]);

  useEffect(() => {
    if (user) {
      setEditForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phoneNumber: user.phoneNumber || '',
        discount: user.discount || 'NONE',
        adAgreement: user.adAgreement || false,
        password: '',
      });
    }
  }, [user]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditMsg('');
    try {
      const data: any = { ...editForm };
      if (!data.password) delete data.password;
      await api.put('/api/users/me', data);
      await refreshUser();
      setEditMsg('Dane zostały zaktualizowane!');
    } catch (err: any) {
      setEditMsg(err.response?.data?.error || 'Wystąpił błąd');
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('Czy na pewno chcesz dezaktywować konto? Ta operacja jest nieodwracalna.')) return;
    try {
      await api.delete('/api/users/me');
      logout();
      navigate('/');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Wystąpił błąd');
    }
  };

  if (!isAuthenticated) return null;

  const activePurchases = purchases.filter((p) => p.validUntil && new Date(p.validUntil) > new Date());

  const tabs = [
    { key: 'overview' as const, label: 'Przegląd', icon: <UserCircle className="w-4 h-4" /> },
    { key: 'purchases' as const, label: 'Zakupy', icon: <ShoppingBag className="w-4 h-4" /> },
    { key: 'admissions' as const, label: 'Wejścia', icon: <CalendarDays className="w-4 h-4" /> },
    { key: 'edit' as const, label: 'Edytuj dane', icon: <Edit2 className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <Card className="mb-8 overflow-hidden">
        <div className="bg-gradient-to-r from-secondary to-card p-8 border-b">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center">
              <UserCircle className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Witaj, {user?.firstName || 'Użytkowniku'}!</h1>
              <p className="text-muted-foreground">{user?.email}</p>
              <span className="inline-block bg-primary/20 text-primary px-3 py-1 rounded-full text-xs mt-1 font-semibold">
                {user?.userRole === 'ADMIN'
                  ? 'Administrator'
                  : user?.userRole === 'EMPLOYEE'
                    ? 'Pracownik'
                    : 'Klient'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tabs.map((t) => (
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

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">Aktywne karnety</div>
              <div className="text-3xl font-bold text-primary">{activePurchases.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">Łączne zakupy</div>
              <div className="text-3xl font-bold">{purchases.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">Wejścia na siłownię</div>
              <div className="text-3xl font-bold text-accent">{admissions.length}</div>
            </CardContent>
          </Card>

          {activePurchases.length > 0 && (
            <div className="md:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Aktywne karnety</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activePurchases.map((p) => (
                    <div key={p.id} className="flex items-center justify-between bg-accent/10 rounded-lg p-4">
                      <div>
                        <div className="font-semibold">{p.offerName}</div>
                        <div className="text-sm text-muted-foreground">
                          Zakupiono: {new Date(p.purchaseDate).toLocaleDateString('pl-PL')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Ważny do:</div>
                        <div className="font-semibold text-accent">
                          {p.validUntil ? new Date(p.validUntil).toLocaleDateString('pl-PL') : '-'}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Purchases */}
      {tab === 'purchases' && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Historia zakupów</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-muted-foreground">Ładowanie...</div>
            ) : purchases.length === 0 ? (
              <div className="p-6 text-muted-foreground">Brak zakupów</div>
            ) : (
              <div className="divide-y divide-border">
                {purchases.map((p) => (
                  <div key={p.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <ShoppingBag className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{p.offerName}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(p.purchaseDate).toLocaleDateString('pl-PL')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      {p.validUntil && new Date(p.validUntil) > new Date() ? (
                        <span className="text-accent font-medium">Aktywny</span>
                      ) : (
                        <span className="text-muted-foreground">Wygasł</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Admissions */}
      {tab === 'admissions' && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Historia wejść</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 text-muted-foreground">Ładowanie...</div>
            ) : admissions.length === 0 ? (
              <div className="p-6 text-muted-foreground">Brak wejść</div>
            ) : (
              <div className="divide-y divide-border">
                {admissions.map((a) => (
                  <div key={a.id} className="p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {new Date(a.startTime).toLocaleDateString('pl-PL', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(a.startTime).toLocaleTimeString('pl-PL', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {' - '}
                        {new Date(a.endTime).toLocaleTimeString('pl-PL', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit */}
      {tab === 'edit' && (
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Edytuj dane profilu</CardTitle>
          </CardHeader>
          <CardContent>
            {editMsg && (
              <div
                className={`px-4 py-3 rounded-lg mb-6 text-sm ${
                  editMsg.includes('błąd')
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-accent/10 text-accent-foreground dark:text-accent'
                }`}
              >
                {editMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Imię</label>
                  <Input
                    type="text"
                    name="firstName"
                    value={editForm.firstName}
                    onChange={handleEditChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nazwisko</label>
                  <Input
                    type="text"
                    name="lastName"
                    value={editForm.lastName}
                    onChange={handleEditChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Telefon</label>
                <Input
                  type="tel"
                  name="phoneNumber"
                  value={editForm.phoneNumber}
                  onChange={handleEditChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Zniżka</label>
                <select
                  name="discount"
                  value={editForm.discount}
                  onChange={handleEditChange}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
                >
                  <option value="NONE">Brak</option>
                  <option value="STUDENT">Studencka</option>
                  <option value="MULTISPORT">Multisport</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nowe hasło (opcjonalnie)</label>
                <Input
                  type="password"
                  name="password"
                  value={editForm.password}
                  onChange={handleEditChange}
                  placeholder="Pozostaw puste, aby nie zmieniać"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="adAgreement"
                  checked={editForm.adAgreement}
                  onChange={handleEditChange}
                  className="w-4 h-4 rounded accent-primary"
                  id="editAd"
                />
                <label htmlFor="editAd" className="text-sm text-muted-foreground">
                  Zgoda na marketing
                </label>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="submit" className="gap-2">
                  <Save className="w-5 h-5" /> Zapisz zmiany
                </Button>
                <Button type="button" variant="destructive" onClick={handleDeactivate} className="gap-2">
                  <Trash2 className="w-5 h-5" /> Dezaktywuj konto
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
