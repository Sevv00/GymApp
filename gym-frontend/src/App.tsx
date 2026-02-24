import { Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import MainPage from './pages/MainPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OffersPage from './pages/OffersPage';
import OffersTransaction from './pages/OffersTransaction';
import LoggedUserPage from './pages/LoggedUserPage';
import EmployeePanel from './pages/EmployeePanel';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/offers/:offerId/buy" element={<OffersTransaction />} />
        <Route path="/dashboard" element={<LoggedUserPage />} />
        <Route path="/employee" element={<EmployeePanel />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Route>
    </Routes>
  );
}

export default App;
