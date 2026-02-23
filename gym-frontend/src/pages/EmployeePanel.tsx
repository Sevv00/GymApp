import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Announcement, Offer, ClassInfo, GymInfo } from '../types';
import { Megaphone, Tag, Calendar, Info, Plus, Trash2, Edit2, Save, X } from 'lucide-react';

const EmployeePanel: React.FC = () => {
  const { isEmployee, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'announcements' | 'offers' | 'classes' | 'gyminfo'>('announcements');

  // Announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newAnn, setNewAnn] = useState({ title: '', content: '' });
  const [editAnnId, setEditAnnId] = useState<number | null>(null);
  const [editAnn, setEditAnn] = useState({ title: '', content: '' });

  // Offers
  const [offers, setOffers] = useState<Offer[]>([]);
  const [newOffer, setNewOffer] = useState({ offerName: '', offerDescription: '', priceText: '', price: '', durationDays: '', isPermanent: true });

  // Classes
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [newClass, setNewClass] = useState({ offerId: '', startTime: '', endTime: '', capacity: '' });

  // Gym Info
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

  // Announcement handlers
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

  // Offer handlers
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

  // Class handlers
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

  // GymInfo handler
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-[#030027] mb-8">Panel Pracownika</h1>

      {msg && (
        <div className="bg-[#B0F2B4]/20 border border-green-300 text-green-800 px-4 py-3 rounded-xl mb-6 text-sm flex justify-between items-center">
          {msg}
          <button onClick={() => setMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { key: 'announcements' as const, label: 'Ogłoszenia', icon: <Megaphone className="w-4 h-4" /> },
          { key: 'offers' as const, label: 'Oferty', icon: <Tag className="w-4 h-4" /> },
          { key: 'classes' as const, label: 'Zajęcia', icon: <Calendar className="w-4 h-4" /> },
          { key: 'gyminfo' as const, label: 'Info o siłowni', icon: <Info className="w-4 h-4" /> },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
              tab === t.key ? 'bg-[#9B7EDE] text-white shadow-md' : 'bg-white text-[#030027] border border-gray-200 hover:bg-[#BCD2EE]/20'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Announcements */}
      {tab === 'announcements' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-[#030027] mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-[#9B7EDE]" /> Nowe ogłoszenie</h3>
            <form onSubmit={handleCreateAnn} className="space-y-3">
              <input type="text" placeholder="Tytuł" value={newAnn.title} onChange={e => setNewAnn(p => ({ ...p, title: e.target.value }))} required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE]" />
              <textarea placeholder="Treść" value={newAnn.content} onChange={e => setNewAnn(p => ({ ...p, content: e.target.value }))} required rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE]" />
              <button type="submit" className="bg-[#9B7EDE] hover:bg-[#8568c9] text-white px-6 py-2.5 rounded-xl font-semibold transition-colors">Dodaj</button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 font-semibold text-[#030027] text-sm">Lista ogłoszeń</div>
            <div className="divide-y">
              {announcements.map(a => (
                <div key={a.id} className="p-4">
                  {editAnnId === a.id ? (
                    <div className="space-y-2">
                      <input type="text" value={editAnn.title} onChange={e => setEditAnn(p => ({ ...p, title: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-lg" />
                      <textarea value={editAnn.content} onChange={e => setEditAnn(p => ({ ...p, content: e.target.value }))} rows={2}
                        className="w-full px-3 py-2 border rounded-lg" />
                      <div className="flex gap-2">
                        <button onClick={() => handleUpdateAnn(a.id)} className="text-green-600 hover:text-green-800"><Save className="w-5 h-5" /></button>
                        <button onClick={() => setEditAnnId(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium text-[#030027]">{a.title} {!a.isActive && <span className="text-xs text-red-500">(Nieaktywne)</span>}</div>
                        <div className="text-sm text-gray-600 mt-1">{a.content}</div>
                        <div className="text-xs text-gray-400 mt-1">{a.authorName} | {a.createdAt ? new Date(a.createdAt).toLocaleDateString('pl-PL') : ''}</div>
                      </div>
                      <div className="flex gap-1 shrink-0 ml-4">
                        <button onClick={() => { setEditAnnId(a.id); setEditAnn({ title: a.title, content: a.content }); }}
                          className="text-[#9B7EDE] hover:text-[#8568c9] p-1"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteAnn(a.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Offers */}
      {tab === 'offers' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-[#030027] mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-[#9B7EDE]" /> Nowa oferta</h3>
            <form onSubmit={handleCreateOffer} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="text" placeholder="Nazwa oferty" value={newOffer.offerName}
                onChange={e => setNewOffer(p => ({ ...p, offerName: e.target.value }))} required
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE]" />
              <input type="text" placeholder="Cena opisowo (np. 120zł/mc)" value={newOffer.priceText}
                onChange={e => setNewOffer(p => ({ ...p, priceText: e.target.value }))}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE]" />
              <input type="number" placeholder="Cena (PLN)" value={newOffer.price}
                onChange={e => setNewOffer(p => ({ ...p, price: e.target.value }))} required step="0.01"
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE]" />
              <input type="number" placeholder="Czas trwania (dni)" value={newOffer.durationDays}
                onChange={e => setNewOffer(p => ({ ...p, durationDays: e.target.value }))} required
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE]" />
              <textarea placeholder="Opis oferty" value={newOffer.offerDescription}
                onChange={e => setNewOffer(p => ({ ...p, offerDescription: e.target.value }))} rows={2}
                className="sm:col-span-2 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE]" />
              <div className="sm:col-span-2 flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={newOffer.isPermanent}
                    onChange={e => setNewOffer(p => ({ ...p, isPermanent: e.target.checked }))}
                    className="w-4 h-4 text-[#9B7EDE] rounded" />
                  Oferta stała
                </label>
                <button type="submit" className="bg-[#9B7EDE] hover:bg-[#8568c9] text-white px-6 py-2.5 rounded-xl font-semibold transition-colors ml-auto">
                  Dodaj ofertę
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 font-semibold text-[#030027] text-sm">Lista ofert</div>
            <div className="divide-y">
              {offers.map(o => (
                <div key={o.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="font-medium text-[#030027]">
                      {o.offerName} {!o.isActive && <span className="text-xs text-red-500">(Nieaktywna)</span>}
                    </div>
                    <div className="text-sm text-gray-500">{o.priceText || `${o.price} zł`} | {o.durationDays} dni</div>
                  </div>
                  <button onClick={() => handleDeleteOffer(o.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Classes */}
      {tab === 'classes' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-[#030027] mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-[#9B7EDE]" /> Nowe zajęcia</h3>
            <form onSubmit={handleCreateClass} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select value={newClass.offerId} onChange={e => setNewClass(p => ({ ...p, offerId: e.target.value }))} required
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE] bg-white">
                <option value="">Wybierz ofertę...</option>
                {offers.filter(o => o.isActive).map(o => (
                  <option key={o.id} value={o.id}>{o.offerName}</option>
                ))}
              </select>
              <input type="number" placeholder="Maks. uczestników" value={newClass.capacity}
                onChange={e => setNewClass(p => ({ ...p, capacity: e.target.value }))} required
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE]" />
              <div>
                <label className="block text-xs text-gray-500 mb-1">Początek</label>
                <input type="datetime-local" value={newClass.startTime}
                  onChange={e => setNewClass(p => ({ ...p, startTime: e.target.value }))} required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE]" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Koniec</label>
                <input type="datetime-local" value={newClass.endTime}
                  onChange={e => setNewClass(p => ({ ...p, endTime: e.target.value }))} required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE]" />
              </div>
              <div className="sm:col-span-2">
                <button type="submit" className="bg-[#9B7EDE] hover:bg-[#8568c9] text-white px-6 py-2.5 rounded-xl font-semibold transition-colors">
                  Dodaj zajęcia
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 font-semibold text-[#030027] text-sm">Lista zajęć</div>
            <div className="divide-y">
              {classes.map(c => (
                <div key={c.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="font-medium text-[#030027]">{c.offerName || 'Zajęcia'}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(c.startTime).toLocaleString('pl-PL')} — {new Date(c.endTime).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                      {' | '} {c.registeredCount}/{c.capacity} uczestników
                    </div>
                    {c.instructorName && <div className="text-xs text-gray-400">Prowadzący: {c.instructorName}</div>}
                  </div>
                  <button onClick={() => handleDeleteClass(c.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gym Info */}
      {tab === 'gyminfo' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 max-w-2xl">
          <h3 className="font-bold text-[#030027] mb-4">Informacje o siłowni</h3>
          {gymMsg && (
            <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">{gymMsg}</div>
          )}
          <form onSubmit={handleSaveGymInfo} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#030027] mb-1">Opis siłowni</label>
              <textarea value={gymInfo.gymDesc || ''} onChange={e => setGymInfo(p => ({ ...p, gymDesc: e.target.value }))} rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#030027] mb-1">Godziny otwarcia</label>
              <textarea value={gymInfo.openingHours || ''} onChange={e => setGymInfo(p => ({ ...p, openingHours: e.target.value }))} rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE]"
                placeholder="Pon-Pt: 6:00-22:00&#10;Sob: 8:00-20:00&#10;Nd: 9:00-18:00" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#030027] mb-1">Telefon 1</label>
                <input type="text" value={gymInfo.firstPhoneNumber || ''} onChange={e => setGymInfo(p => ({ ...p, firstPhoneNumber: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#030027] mb-1">Telefon 2</label>
                <input type="text" value={gymInfo.secondPhoneNumber || ''} onChange={e => setGymInfo(p => ({ ...p, secondPhoneNumber: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#030027] mb-1">Email 1</label>
                <input type="email" value={gymInfo.firstEmail || ''} onChange={e => setGymInfo(p => ({ ...p, firstEmail: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#030027] mb-1">Email 2</label>
                <input type="email" value={gymInfo.secondEmail || ''} onChange={e => setGymInfo(p => ({ ...p, secondEmail: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE]" />
              </div>
            </div>
            <button type="submit" className="flex items-center gap-2 bg-[#9B7EDE] hover:bg-[#8568c9] text-white px-6 py-3 rounded-xl font-semibold transition-colors">
              <Save className="w-5 h-5" /> Zapisz zmiany
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default EmployeePanel;
