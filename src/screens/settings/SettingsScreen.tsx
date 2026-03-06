import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppContext } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Moon, Sun, Globe, LogOut, Database, Shield, ChevronLeft, ChevronRight, Users, Building2, Tags, Store, UserCog, UploadCloud, DownloadCloud, Code, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { theme, toggleTheme, language, toggleLanguage } = useAppContext();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleBackup = () => {
    const data = localStorage.getItem('appData');
    if (data) {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('تم تحميل النسخة الاحتياطية بنجاح');
    } else {
      alert('لا توجد بيانات للنسخ الاحتياطي');
    }
  };

  const handleRestore = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = event.target?.result as string;
            // Validate JSON structure before saving
            const parsed = JSON.parse(data);
            if (parsed.products && parsed.categories && parsed.stores) {
              localStorage.setItem('appData', data);
              alert('تم استعادة النسخة الاحتياطية بنجاح. سيتم إعادة تحميل التطبيق.');
              window.location.reload();
            } else {
              alert('ملف النسخة الاحتياطية غير صالح');
            }
          } catch (error) {
            alert('حدث خطأ أثناء قراءة الملف');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleSync = () => {
    navigate('/settings/sync');
  };

  const handleDownloadSource = () => {
    window.location.href = '/api/download-source';
  };

  const SettingItem = ({ icon: Icon, label, value, onClick, isDanger = false }: any) => (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
        isDanger ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
      }`}
    >
      <div className="flex items-center space-x-3 rtl:space-x-reverse">
        <Icon size={20} className={isDanger ? 'text-red-500' : 'text-gray-400'} />
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex items-center space-x-2 rtl:space-x-reverse text-gray-500 dark:text-gray-400">
        {value && <span className="text-sm">{value}</span>}
        {language === 'ar' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </div>
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4 rtl:space-x-reverse">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl font-bold shrink-0">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <SettingItem 
          icon={Tags} 
          label={t('categories')} 
          onClick={() => navigate('/categories')} 
        />
        <SettingItem 
          icon={Store} 
          label={t('stores')} 
          onClick={() => navigate('/stores')} 
        />
        <SettingItem 
          icon={Users} 
          label="الموردين وجهات الصرف" 
          onClick={() => navigate('/entities')} 
        />
        {user?.role === 'admin' && (
          <SettingItem 
            icon={UserCog} 
            label="المستخدمين والصلاحيات" 
            onClick={() => navigate('/users')} 
          />
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <SettingItem 
          icon={Globe} 
          label={t('language')} 
          value={language === 'ar' ? 'العربية' : 'English'} 
          onClick={toggleLanguage} 
        />
        <SettingItem 
          icon={theme === 'dark' ? Sun : Moon} 
          label={t('dark_mode')} 
          value={theme === 'dark' ? 'مفعل' : 'معطل'} 
          onClick={toggleTheme} 
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <SettingItem 
          icon={UploadCloud} 
          label="المزامنة السحابية" 
          onClick={handleSync} 
        />
        <SettingItem 
          icon={DownloadCloud} 
          label="حفظ نسخة احتياطية" 
          onClick={handleBackup} 
        />
        <SettingItem 
          icon={Database} 
          label="استعادة نسخة احتياطية" 
          onClick={handleRestore} 
        />
        <SettingItem 
          icon={Code} 
          label="تحميل ملفات المشروع (Source Code)" 
          onClick={handleDownloadSource} 
        />
        <SettingItem 
          icon={Info} 
          label="حول التطبيق" 
          onClick={() => navigate('/settings/about')} 
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <SettingItem 
          icon={LogOut} 
          label={t('logout')} 
          onClick={logout} 
          isDanger={true}
        />
      </div>
    </div>
  );
}
