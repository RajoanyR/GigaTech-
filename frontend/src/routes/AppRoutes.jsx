import { Navigate, Route, Routes } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';

import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import Dashboard from '../pages/Dashboard';
import Products from '../pages/Products';
import Categories from '../pages/Categories';
import Brands from '../pages/Brands';
import Suppliers from '../pages/Suppliers';
import Clients from '../pages/Clients';
import Employees from '../pages/Employees';
import Users from '../pages/Users';
import Stock from '../pages/Stock';
import Sales from '../pages/Sales';
import NewSale from '../pages/NewSale';
import Purchases from '../pages/Purchases';
import Payments from '../pages/Payments';
import Reports from '../pages/Reports';
import Settings from '../pages/Settings';
import Profile from '../pages/Profile';
import { Forbidden, NotFound, ServerError } from '../pages/ErrorPages';

/** Table de routage complete de l'application. */
export default function AppRoutes() {
  return (
    <Routes>
      {/* Routes publiques */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/mot-de-passe-oublie" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Routes protegees */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="/produits" element={<Products />} />
        <Route path="/categories" element={<ProtectedRoute roles={['administrateur', 'gestionnaire', 'magasinier']}><Categories /></ProtectedRoute>} />
        <Route path="/marques" element={<ProtectedRoute roles={['administrateur', 'gestionnaire', 'magasinier']}><Brands /></ProtectedRoute>} />
        <Route path="/fournisseurs" element={<ProtectedRoute roles={['administrateur', 'gestionnaire', 'magasinier']}><Suppliers /></ProtectedRoute>} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/employes" element={<ProtectedRoute roles={['administrateur', 'gestionnaire']}><Employees /></ProtectedRoute>} />
        <Route path="/utilisateurs" element={<ProtectedRoute roles={['administrateur']}><Users /></ProtectedRoute>} />
        <Route path="/stock" element={<ProtectedRoute roles={['administrateur', 'gestionnaire', 'magasinier']}><Stock /></ProtectedRoute>} />
        <Route path="/ventes" element={<Sales />} />
        <Route path="/ventes/nouvelle" element={<ProtectedRoute roles={['administrateur', 'gestionnaire', 'caissier']}><NewSale /></ProtectedRoute>} />
        <Route path="/achats" element={<ProtectedRoute roles={['administrateur', 'gestionnaire', 'magasinier']}><Purchases /></ProtectedRoute>} />
        <Route path="/paiements" element={<ProtectedRoute roles={['administrateur', 'gestionnaire', 'caissier']}><Payments /></ProtectedRoute>} />
        <Route path="/rapports" element={<ProtectedRoute roles={['administrateur', 'gestionnaire']}><Reports /></ProtectedRoute>} />
        <Route path="/parametres" element={<ProtectedRoute roles={['administrateur']}><Settings /></ProtectedRoute>} />
        <Route path="/profil" element={<Profile />} />
      </Route>

      <Route path="/403" element={<Forbidden />} />
      <Route path="/500" element={<ServerError />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
