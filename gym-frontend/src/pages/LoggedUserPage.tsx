import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Purchase, GymAdmission } from '../types';
import { UserCircle, ShoppingBag, Clock, CalendarDays, Save, Trash2, Edit2 } from 'lucide-react';

const LoggedUserPage: React.FC = () => {
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
    setEditForm(prev => ({
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

  const activePurchases = purchases.filter(p => p.validUntil && new Date(p.validUntil) > new Date());

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#151E3F] to-[#030027] rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#9B7EDE] rounded-2xl flex items-center justify-center">
            <UserCircle className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Witaj, {user?.firstName || 'Użytkowniku'}!</h1>
            <p className="text-[#BCD2EE]">{user?.email}</p>
            <span className="inline-block bg-[#9B7EDE]/30 text-[#B0F2B4] px-3 py-1 rounded-full text-xs mt-1 font-semibold">
              {user?.userRole === 'ADMIN' ? 'Administrator' : user?.userRole === 'EMPLOYEE' ? 'Pracownik' : 'Klient'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { key: 'overview' as const, label: 'Przegląd', icon: <UserCircle className="w-4 h-4" /> },
          { key: 'purchases' as const, label: 'Zakupy', icon: <ShoppingBag className="w-4 h-4" /> },
          { key: 'admissions' as const, label: 'Wejścia', icon: <CalendarDays className="w-4 h-4" /> },
          { key: 'edit' as const, label: 'Edytuj dane', icon: <Edit2 className="w-4 h-4" /> },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
              tab === t.key ? 'bg-[#9B7EDE] text-white shadow-md' : 'bg-white text-[#030027] border border-gray-200 hover:bg-[#BCD2EE]/20'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="text-sm text-gray-500 mb-1">Aktywne karnety</div>
            <div className="text-3xl font-bold text-[#9B7EDE]">{activePurchases.length}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="text-sm text-gray-500 mb-1">Łączne zakupy</div>
            <div className="text-3xl font-bold text-[#030027]">{purchases.length}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="text-sm text-gray-500 mb-1">Wejścia na siłownię</div>
            <div className="text-3xl font-bold text-[#B0F2B4]">{admissions.length}</div>
          </div>

          {activePurchases.length > 0 && (
            <div className="md:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-[#030027] mb-4">Aktywne karnety</h3>
              <div className="space-y-3">
                {activePurchases.map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-[#B0F2B4]/10 rounded-xl p-4">
                    <div>
                      <div className="font-semibold text-[#030027]">{p.offerName}</div>
                      <div className="text-sm text-gray-500">
                        Zakupiono: {new Date(p.purchaseDate).toLocaleDateString('pl-PL')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Ważny do:</div>
                      <div className="font-semibold text-green-700">
                        {p.validUntil ? new Date(p.validUntil).toLocaleDateString('pl-PL') : '-'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Purchases */}
      {tab === 'purchases' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-[#030027] text-lg">Historia zakupów</h3>
          </div>
          {loading ? (
            <div className="p-6 text-gray-500">Ładowanie...</div>
          ) : purchases.length === 0 ? (
            <div className="p-6 text-gray-500">Brak zakupów</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {purchases.map(p => (
                <div key={p.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#9B7EDE]/10 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-[#9B7EDE]" />
                    </div>
                    <div>
                      <div className="font-medium text-[#030027]">{p.offerName}</div>
                      <div className="text-xs text-gray-500">{new Date(p.purchaseDate).toLocaleDateString('pl-PL')}</div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    {p.validUntil && new Date(p.validUntil) > new Date() ? (
                      <span className="text-green-600 font-medium">Aktywny</span>
                    ) : (
                      <span className="text-gray-400">Wygasł</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Admissions */}
      {tab === 'admissions' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-[#030027] text-lg">Historia wejść</h3>
          </div>
          {loading ? (
            <div className="p-6 text-gray-500">Ładowanie...</div>
          ) : admissions.length === 0 ? (
            <div className="p-6 text-gray-500">Brak wejść</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {admissions.map(a => (
                <div key={a.id} className="p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-[#B0F2B4]/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <div className="font-medium text-[#030027]">
                      {new Date(a.startTime).toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(a.startTime).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                      {' - '}
                      {new Date(a.endTime).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit */}
      {tab === 'edit' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 max-w-2xl">
          <h3 className="font-bold text-[#030027] text-lg mb-6">Edytuj dane profilu</h3>

          {editMsg && (
            <div className={`px-4 py-3 rounded-xl mb-6 text-sm ${editMsg.includes('błąd') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {editMsg}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#030027] mb-1">Imię</label>
                <input type="text" name="firstName" value={editForm.firstName} onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE] transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#030027] mb-1">Nazwisko</label>
                <input type="text" name="lastName" value={editForm.lastName} onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE] transition" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#030027] mb-1">Telefon</label>
              <input type="tel" name="phoneNumber" value={editForm.phoneNumber} onChange={handleEditChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE] transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#030027] mb-1">Zniżka</label>
              <select name="discount" value={editForm.discount} onChange={handleEditChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE] transition bg-white">
                <option value="NONE">Brak</option>
                <option value="STUDENT">Studencka</option>
                <option value="MULTISPORT">Multisport</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#030027] mb-1">Nowe hasło (opcjonalnie)</label>
              <input type="password" name="password" value={editForm.password} onChange={handleEditChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE] transition"
                placeholder="Pozostaw puste, aby nie zmieniać" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" name="adAgreement" checked={editForm.adAgreement} onChange={handleEditChange}
                className="w-4 h-4 text-[#9B7EDE] rounded" id="editAd" />
              <label htmlFor="editAd" className="text-sm text-gray-600">Zgoda na marketing</label>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button type="submit"
                className="flex items-center justify-center gap-2 bg-[#9B7EDE] hover:bg-[#8568c9] text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                <Save className="w-5 h-5" /> Zapisz zmiany
              </button>
              <button type="button" onClick={handleDeactivate}
                className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                <Trash2 className="w-5 h-5" /> Dezaktywuj konto
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default LoggedUserPage;
