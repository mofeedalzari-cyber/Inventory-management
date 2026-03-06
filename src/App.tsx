import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider } from './contexts/AppContext';
import { DataProvider } from './contexts/DataContext';

// Screens
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import DashboardScreen from './screens/dashboard/DashboardScreen';
import ProductsScreen from './screens/products/ProductsScreen';
import CategoriesScreen from './screens/categories/CategoriesScreen';
import StoresScreen from './screens/stores/StoresScreen';
import MovementsScreen from './screens/movements/MovementsScreen';
import ReportsScreen from './screens/reports/ReportsScreen';
import SettingsScreen from './screens/settings/SettingsScreen';
import SyncSettingsScreen from './screens/settings/SyncSettingsScreen';
import AboutScreen from './screens/settings/AboutScreen';
import EntitiesScreen from './screens/entities/EntitiesScreen';
import UsersScreen from './screens/users/UsersScreen';
import Layout from './components/Layout';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<DashboardScreen />} />
        <Route path="products" element={<ProductsScreen />} />
        <Route path="categories" element={<CategoriesScreen />} />
        <Route path="stores" element={<StoresScreen />} />
        <Route path="movements" element={<MovementsScreen />} />
        <Route path="reports" element={<ReportsScreen />} />
        <Route path="settings" element={<SettingsScreen />} />
        <Route path="settings/sync" element={<SyncSettingsScreen />} />
        <Route path="settings/about" element={<AboutScreen />} />
        <Route path="entities" element={<EntitiesScreen />} />
        <Route path="users" element={<UsersScreen />} />
      </Route>
    </Routes>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <DataProvider>
          <Router>
            <AppRoutes />
          </Router>
        </DataProvider>
      </AuthProvider>
    </AppProvider>
  );
}
