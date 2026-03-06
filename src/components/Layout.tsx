import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Package, List, ArrowLeftRight, FileText, Settings, Menu, Bell } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const BottomNav = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: Home, label: t('dashboard') },
    { path: '/products', icon: Package, label: t('products') },
    { path: '/movements', icon: ArrowLeftRight, label: t('movements') },
    { path: '/reports', icon: FileText, label: t('reports') },
    { path: '/settings', icon: Settings, label: t('settings') },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-16 px-2 z-50 shadow-lg">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
              isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <Icon size={24} className={isActive ? 'fill-current opacity-20' : ''} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

const Header = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme } = useAppContext();

  const getTitle = () => {
    switch (location.pathname) {
      case '/': return t('dashboard');
      case '/products': return t('products');
      case '/categories': return t('categories');
      case '/stores': return t('stores');
      case '/movements': return t('movements');
      case '/reports': return t('reports');
      case '/settings': return t('settings');
      default: return 'App';
    }
  };

  const handleMenuClick = () => {
    if (location.pathname === '/settings') {
      navigate(-1); // Go back to the previous screen
    } else {
      navigate('/settings');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-blue-600 text-white flex items-center justify-between px-4 z-50 shadow-md">
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <button onClick={handleMenuClick} className="p-2 -ml-2 rounded-full hover:bg-blue-700 transition-colors">
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold tracking-tight">{getTitle()}</h1>
      </div>
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <button className="p-2 rounded-full hover:bg-blue-700 transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </header>
  );
};

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans pb-16 pt-16">
      <Header />
      <main className="p-4 max-w-md mx-auto w-full h-full overflow-y-auto">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
