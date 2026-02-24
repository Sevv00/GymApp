import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, UserPlus, Edit2, Trash2, Save, X, Search, Users } from 'lucide-react';

export default function AdminPanel() {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    userRole: '',
    discount: '',
    isActive: true,
    password: '',
  });
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    discount: 'NONE',
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

  const filteredUsers = users.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase()),
  );

  const roleLabel = (r: string) => {
    switch (r) {
      case 'ADMIN':
        return 'Administrator';
      case 'EMPLOYEE':
        return 'Pracownik';
      case 'CLIENT':
        return 'Klient';
      default:
        return r;
    }
  };

  const roleBadge = (r: string) => {
    switch (r) {
      case 'ADMIN':
        return 'bg-destructive/10 text-destructive';
      case 'EMPLOYEE':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" /> Panel Administratora
        </h1>
        <Button onClick={() => setShowCreate(!showCreate)} className="gap-2">
          <UserPlus className="w-5 h-5" /> Dodaj użytkownika
        </Button>
      </div>

      {msg && (
        <div className="bg-accent/10 border border-accent/30 text-accent-foreground dark:text-accent px-4 py-3 rounded-lg mb-6 text-sm flex justify-between items-center">
          {msg}
          <button onClick={() => setMsg('')}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Nowy użytkownik</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Input
                type="email"
                placeholder="Email *"
                value={createForm.email}
                onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
              <Input
                type="password"
                placeholder="Hasło *"
                value={createForm.password}
                onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                required
              />
              <select
                value={createRole}
                onChange={(e) => setCreateRole(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
              >
                <option value="CLIENT">Klient</option>
                <option value="EMPLOYEE">Pracownik</option>
                <option value="ADMIN">Administrator</option>
              </select>
              <Input
                placeholder="Imię"
                value={createForm.firstName}
                onChange={(e) => setCreateForm((p) => ({ ...p, firstName: e.target.value }))}
              />
              <Input
                placeholder="Nazwisko"
                value={createForm.lastName}
                onChange={(e) => setCreateForm((p) => ({ ...p, lastName: e.target.value }))}
              />
              <Input
                placeholder="Telefon"
                value={createForm.phoneNumber}
                onChange={(e) => setCreateForm((p) => ({ ...p, phoneNumber: e.target.value }))}
              />
              <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
                <Button type="submit">Utwórz</Button>
                <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>
                  Anuluj
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          placeholder="Szukaj użytkowników..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold">{users.length}</div>
            <div className="text-xs text-muted-foreground">Łącznie</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {users.filter((u) => u.userRole === 'CLIENT').length}
            </div>
            <div className="text-xs text-muted-foreground">Klienci</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold text-accent">
              {users.filter((u) => u.userRole === 'EMPLOYEE').length}
            </div>
            <div className="text-xs text-muted-foreground">Pracownicy</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <div className="text-2xl font-bold text-destructive">
              {users.filter((u) => u.userRole === 'ADMIN').length}
            </div>
            <div className="text-xs text-muted-foreground">Administratorzy</div>
          </CardContent>
        </Card>
      </div>

      {/* Users table */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" /> Użytkownicy ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground border-b">
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
              <tbody className="divide-y divide-border">
                {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30 even:bg-muted/20 transition-colors">
                    {editingId === u.id ? (
                      <>
                        <td className="p-3 text-muted-foreground">{u.id}</td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={editForm.firstName}
                              onChange={(e) => setEditForm((p) => ({ ...p, firstName: e.target.value }))}
                              className="w-20 px-2 py-1 border border-input rounded text-xs bg-transparent"
                              placeholder="Imię"
                            />
                            <input
                              type="text"
                              value={editForm.lastName}
                              onChange={(e) => setEditForm((p) => ({ ...p, lastName: e.target.value }))}
                              className="w-24 px-2 py-1 border border-input rounded text-xs bg-transparent"
                              placeholder="Nazwisko"
                            />
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">{u.email}</td>
                        <td className="p-3">
                          <select
                            value={editForm.userRole}
                            onChange={(e) => setEditForm((p) => ({ ...p, userRole: e.target.value }))}
                            className="px-2 py-1 border border-input rounded text-xs bg-transparent"
                          >
                            <option value="CLIENT">Klient</option>
                            <option value="EMPLOYEE">Pracownik</option>
                            <option value="ADMIN">Administrator</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <label className="flex items-center gap-1 text-xs">
                            <input
                              type="checkbox"
                              checked={editForm.isActive}
                              onChange={(e) => setEditForm((p) => ({ ...p, isActive: e.target.checked }))}
                              className="w-3 h-3"
                            />
                            Aktywny
                          </label>
                        </td>
                        <td className="p-3">
                          <select
                            value={editForm.discount}
                            onChange={(e) => setEditForm((p) => ({ ...p, discount: e.target.value }))}
                            className="px-2 py-1 border border-input rounded text-xs bg-transparent"
                          >
                            <option value="NONE">Brak</option>
                            <option value="STUDENT">Student</option>
                            <option value="MULTISPORT">Multisport</option>
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="icon-sm" variant="ghost" onClick={() => handleSaveEdit(u.id)}>
                              <Save className="w-4 h-4 text-accent" />
                            </Button>
                            <Button size="icon-sm" variant="ghost" onClick={() => setEditingId(null)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-3 text-muted-foreground">{u.id}</td>
                        <td className="p-3 font-medium">
                          {u.firstName} {u.lastName}
                        </td>
                        <td className="p-3 text-muted-foreground">{u.email}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleBadge(u.userRole)}`}>
                            {roleLabel(u.userRole)}
                          </span>
                        </td>
                        <td className="p-3">
                          {u.isActive ? (
                            <span className="text-accent text-xs font-medium">Aktywny</span>
                          ) : (
                            <span className="text-destructive text-xs font-medium">Nieaktywny</span>
                          )}
                        </td>
                        <td className="p-3 text-muted-foreground text-xs">
                          {u.discount === 'NONE' ? '-' : u.discount}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1">
                            <Button size="icon-sm" variant="ghost" onClick={() => handleEdit(u)}>
                              <Edit2 className="w-4 h-4 text-primary" />
                            </Button>
                            <Button size="icon-sm" variant="ghost" onClick={() => handleDelete(u.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
