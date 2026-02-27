import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    discount: 'NONE',
    adAgreement: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Hasła nie są identyczne');
      return;
    }
    if (form.password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków');
      return;
    }
    if (form.phoneNumber && !/^\d{9}$/.test(form.phoneNumber)) {
      setError('Numer telefonu musi składać się z dokładnie 9 cyfr');
      return;
    }

    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phoneNumber,
        discount: form.discount,
        adAgreement: form.adAgreement,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Błąd rejestracji. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mx-auto mb-2">
            <UserPlus className="w-7 h-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Utwórz konto</CardTitle>
          <CardDescription>Dołącz do naszej siłowni!</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Imię</label>
                <Input type="text" name="firstName" value={form.firstName} onChange={handleChange} placeholder="Jan" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nazwisko</label>
                <Input type="text" name="lastName" value={form.lastName} onChange={handleChange} placeholder="Kowalski" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email *</label>
              <Input type="email" name="email" value={form.email} onChange={handleChange} required placeholder="twoj@email.pl" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Numer telefonu</label>
              <Input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="123456789" maxLength={9} pattern="\d{9}" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hasło *</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="Min. 6 znaków"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Powtórz hasło *</label>
              <Input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Powtórz hasło"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Zniżka</label>
              <select
                name="discount"
                value={form.discount}
                onChange={handleChange}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring"
              >
                <option value="NONE">Brak</option>
                <option value="STUDENT">Studencka</option>
                <option value="MULTISPORT">Multisport</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="adAgreement"
                checked={form.adAgreement}
                onChange={handleChange}
                className="w-4 h-4 rounded accent-primary"
                id="adAgreement"
              />
              <label htmlFor="adAgreement" className="text-sm text-muted-foreground">
                Wyrażam zgodę na otrzymywanie informacji marketingowych
              </label>
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Rejestracja...' : 'Zarejestruj się'}
            </Button>
          </form>

          <p className="text-center mt-6 text-muted-foreground text-sm">
            Masz już konto?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Zaloguj się
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
