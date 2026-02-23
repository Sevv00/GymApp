import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User } from '../types';
import { Shield, UserPlus, Edit2, Trash2, Save, X, Search, Users } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: '', lastName: '', phoneNumber: '', userRole: '', discount: '', isActive: true, password: '',
  });
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: '', password: '', firstName: '', lastName: '', phoneNumber: '', discount: 'NONE',
  });
  const [createRole, setCreateRole] = useState('CLIENT');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
      return;
    }
    loadUsers();
  }, [isAuthenticated, isAdmin]);

  const loadUsers = async () => {
    try {
      const res = await api.get('/api/admin/users');
      setUsers(res.data);
    } catch {
      setMsg('Nie udało się pobrać użytkowników');
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phoneNumber: user.phoneNumber || '',
      userRole: user.userRole,
      discount: user.discount || 'NONE',
      isActive: user.isActive ?? true,
      password: '',
    });
  };

  const handleSaveEdit = async (id: number) => {
    try {
      const data: any = { ...editForm };
      if (!data.password) delete data.password;
      await api.put(`/api/admin/users/${id}`, data);
      setEditingId(null);
      setMsg('Użytkownik zaktualizowany');
      loadUsers();
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Błąd');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Dezaktywować użytkownika?')) return;
    try {
      await api.delete(`/api/admin/users/${id}`);
      setMsg('Użytkownik dezaktywowany');
      loadUsers();
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Błąd');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/api/admin/users?role=${createRole}`, createForm);
      setShowCreate(false);
      setCreateForm({ email: '', password: '', firstName: '', lastName: '', phoneNumber: '', discount: 'NONE' });
      setMsg('Użytkownik utworzony');
      loadUsers();
    } catch (err: any) {
      setMsg(err.response?.data?.error || 'Błąd');
    }
  };

  const filteredUsers = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const roleLabel = (r: string) => {
    switch (r) {
      case 'ADMIN': return 'Administrator';
      case 'EMPLOYEE': return 'Pracownik';
      case 'CLIENT': return 'Klient';
      default: return r;
    }
  };

  const roleBadge = (r: string) => {
    switch (r) {
      case 'ADMIN': return 'bg-red-100 text-red-700';
      case 'EMPLOYEE': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-[#030027] flex items-center gap-3">
          <Shield className="w-8 h-8 text-[#9B7EDE]" /> Panel Administratora
        </h1>
        <button onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 bg-[#9B7EDE] hover:bg-[#8568c9] text-white px-5 py-2.5 rounded-xl font-semibold transition-colors">
          <UserPlus className="w-5 h-5" /> Dodaj użytkownika
        </button>
      </div>

      {msg && (
        <div className="bg-[#B0F2B4]/20 border border-green-300 text-green-800 px-4 py-3 rounded-xl mb-6 text-sm flex justify-between items-center">
          {msg}
          <button onClick={() => setMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-bold text-[#030027] mb-4">Nowy użytkownik</h3>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <input type="email" placeholder="Email *" value={createForm.email}
              onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))} required
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE]" />
            <input type="password" placeholder="Hasło *" value={createForm.password}
              onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))} required
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE]" />
            <select value={createRole} onChange={e => setCreateRole(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE] bg-white">
              <option value="CLIENT">Klient</option>
              <option value="EMPLOYEE">Pracownik</option>
              <option value="ADMIN">Administrator</option>
            </select>
            <input type="text" placeholder="Imię" value={createForm.firstName}
              onChange={e => setCreateForm(p => ({ ...p, firstName: e.target.value }))}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE]" />
            <input type="text" placeholder="Nazwisko" value={createForm.lastName}
              onChange={e => setCreateForm(p => ({ ...p, lastName: e.target.value }))}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE]" />
            <input type="text" placeholder="Telefon" value={createForm.phoneNumber}
              onChange={e => setCreateForm(p => ({ ...p, phoneNumber: e.target.value }))}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE]" />
            <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
              <button type="submit" className="bg-[#B0F2B4] hover:bg-[#9de0a1] text-[#030027] px-6 py-2.5 rounded-xl font-semibold transition-colors">Utwórz</button>
              <button type="button" onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-gray-700 px-4">Anuluj</button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input type="text" placeholder="Szukaj użytkowników..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE] bg-white" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
          <div className="text-2xl font-bold text-[#030027]">{users.length}</div>
          <div className="text-xs text-gray-500">Łącznie</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
          <div className="text-2xl font-bold text-[#9B7EDE]">{users.filter(u => u.userRole === 'CLIENT').length}</div>
          <div className="text-xs text-gray-500">Klienci</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
          <div className="text-2xl font-bold text-blue-600">{users.filter(u => u.userRole === 'EMPLOYEE').length}</div>
          <div className="text-xs text-gray-500">Pracownicy</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
          <div className="text-2xl font-bold text-red-600">{users.filter(u => u.userRole === 'ADMIN').length}</div>
          <div className="text-xs text-gray-500">Administratorzy</div>
        </div>
      </div>

      {/* Users table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 bg-gray-50 font-semibold text-[#030027] text-sm flex items-center gap-2">
          <Users className="w-4 h-4" /> Użytkownicy ({filteredUsers.length})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b">
              <tr>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Imię i nazwisko</th>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Rola</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Zniżka</th>
                <th className="text-right p-3">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  {editingId === u.id ? (
                    <>
                      <td className="p-3 text-gray-500">{u.id}</td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <input type="text" value={editForm.firstName} onChange={e => setEditForm(p => ({ ...p, firstName: e.target.value }))}
                            className="w-20 px-2 py-1 border rounded text-xs" placeholder="Imię" />
                          <input type="text" value={editForm.lastName} onChange={e => setEditForm(p => ({ ...p, lastName: e.target.value }))}
                            className="w-24 px-2 py-1 border rounded text-xs" placeholder="Nazwisko" />
                        </div>
                      </td>
                      <td className="p-3 text-gray-600">{u.email}</td>
                      <td className="p-3">
                        <select value={editForm.userRole} onChange={e => setEditForm(p => ({ ...p, userRole: e.target.value }))}
                          className="px-2 py-1 border rounded text-xs bg-white">
                          <option value="CLIENT">Klient</option>
                          <option value="EMPLOYEE">Pracownik</option>
                          <option value="ADMIN">Administrator</option>
                        </select>
                      </td>
                      <td className="p-3">
                        <label className="flex items-center gap-1 text-xs">
                          <input type="checkbox" checked={editForm.isActive}
                            onChange={e => setEditForm(p => ({ ...p, isActive: e.target.checked }))} className="w-3 h-3" />
                          Aktywny
                        </label>
                      </td>
                      <td className="p-3">
                        <select value={editForm.discount} onChange={e => setEditForm(p => ({ ...p, discount: e.target.value }))}
                          className="px-2 py-1 border rounded text-xs bg-white">
                          <option value="NONE">Brak</option>
                          <option value="STUDENT">Student</option>
                          <option value="MULTISPORT">Multisport</option>
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleSaveEdit(u.id)} className="text-green-600 hover:text-green-800 p-1"><Save className="w-4 h-4" /></button>
                          <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="p-3 text-gray-500">{u.id}</td>
                      <td className="p-3 font-medium text-[#030027]">{u.firstName} {u.lastName}</td>
                      <td className="p-3 text-gray-600">{u.email}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleBadge(u.userRole)}`}>
                          {roleLabel(u.userRole)}
                        </span>
                      </td>
                      <td className="p-3">
                        {u.isActive ? (
                          <span className="text-green-600 text-xs font-medium">Aktywny</span>
                        ) : (
                          <span className="text-red-500 text-xs font-medium">Nieaktywny</span>
                        )}
                      </td>
                      <td className="p-3 text-gray-500 text-xs">{u.discount === 'NONE' ? '-' : u.discount}</td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => handleEdit(u)} className="text-[#9B7EDE] hover:text-[#8568c9] p-1"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(u.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
