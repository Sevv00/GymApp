import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Eye, EyeOff } from 'lucide-react';

const RegisterPage: React.FC = () => {
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
    setForm(prev => ({
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
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-br from-[#BCD2EE]/20 to-[#9B7EDE]/10 px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#9B7EDE] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#030027]">Utwórz konto</h1>
          <p className="text-gray-500 mt-1">Dołącz do naszej siłowni!</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#030027] mb-1">Imię</label>
              <input type="text" name="firstName" value={form.firstName} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE] transition"
                placeholder="Jan" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#030027] mb-1">Nazwisko</label>
              <input type="text" name="lastName" value={form.lastName} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE] transition"
                placeholder="Kowalski" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#030027] mb-1">Email *</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE] transition"
              placeholder="twoj@email.pl" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#030027] mb-1">Numer telefonu</label>
            <input type="tel" name="phoneNumber" value={form.phoneNumber} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE] transition"
              placeholder="+48 123 456 789" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#030027] mb-1">Hasło *</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE] transition pr-12"
                placeholder="Min. 6 znaków" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#030027] mb-1">Powtórz hasło *</label>
            <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE] transition"
              placeholder="Powtórz hasło" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#030027] mb-1">Zniżka</label>
            <select name="discount" value={form.discount} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9B7EDE] transition bg-white">
              <option value="NONE">Brak</option>
              <option value="STUDENT">Studencka</option>
              <option value="MULTISPORT">Multisport</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" name="adAgreement" checked={form.adAgreement} onChange={handleChange}
              className="w-4 h-4 text-[#9B7EDE] rounded" id="adAgreement" />
            <label htmlFor="adAgreement" className="text-sm text-gray-600">
              Wyrażam zgodę na otrzymywanie informacji marketingowych
            </label>
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-[#9B7EDE] hover:bg-[#8568c9] text-white py-3 rounded-xl font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2">
            {loading ? 'Rejestracja...' : 'Zarejestruj się'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-500 text-sm">
          Masz już konto?{' '}
          <Link to="/login" className="text-[#9B7EDE] font-semibold hover:underline">Zaloguj się</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
