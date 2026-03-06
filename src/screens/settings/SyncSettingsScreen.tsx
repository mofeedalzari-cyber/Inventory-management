import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { 
  Mail, 
  RefreshCw, 
  Save, 
  Database, 
  Users, 
  Server, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2
} from 'lucide-react';

export default function SyncSettingsScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { syncWithServer } = useData();
  const [email, setEmail] = useState(user?.email || '');
  const [serverUrl, setServerUrl] = useState('');
  const [autoSync, setAutoSync] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    // Load settings from local storage
    const savedEmail = localStorage.getItem('sync_email');
    const savedServerUrl = localStorage.getItem('server_url') || 'https://smart-inventory-tow7.onrender.com';
    const savedAutoSync = localStorage.getItem('auto_sync') === 'true';
    const savedLastSync = localStorage.getItem('last_sync_time');

    if (savedEmail) setEmail(savedEmail);
    setServerUrl(savedServerUrl);
    setAutoSync(savedAutoSync);
    setLastSync(savedLastSync);
  }, []);

  const handleSaveSettings = () => {
    localStorage.setItem('sync_email', email);
    localStorage.setItem('server_url', serverUrl);
    localStorage.setItem('auto_sync', String(autoSync));
    alert('تم حفظ الإعدادات بنجاح');
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      await syncWithServer();
      
      // Update last sync time
      const now = new Date().toLocaleString('ar-EG');
      setLastSync(now);
      localStorage.setItem('last_sync_time', now);
      
      alert('تمت المزامنة بنجاح');
    } catch (error) {
      console.error(error);
      alert('فشل الاتصال بالخادم');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">الإعدادات والمزامنة</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-6">
        <button className="flex flex-col items-center justify-center p-3 rounded-lg text-gray-500 hover:bg-white dark:hover:bg-gray-700 transition-all">
          <Server className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">اتصال الخادم</span>
        </button>
        <button className="flex flex-col items-center justify-center p-3 rounded-lg bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm transition-all">
          <RefreshCw className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">المزامنة والبريد</span>
        </button>
        <button 
          onClick={() => navigate('/users')}
          className="flex flex-col items-center justify-center p-3 rounded-lg text-gray-500 hover:bg-white dark:hover:bg-gray-700 transition-all"
        >
          <Users className="w-5 h-5 mb-1" />
          <span className="text-xs font-medium">إدارة المستخدمين</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-8">
        
        {/* Server URL Section */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">عنوان الخادم</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                رابط الخادم الذي يتم مزامنة البيانات معه
              </p>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
              <Server className="w-6 h-6" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              رابط الخادم (API URL)
            </label>
            <input
              type="url"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
              className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-center font-medium"
              placeholder="https://example.com"
              dir="ltr"
            />
          </div>
        </div>

        {/* Email Section */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">ربط البريد الإلكتروني</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                استخدم البريد لمزامنة البيانات وتلقي التقارير
              </p>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
              <Mail className="w-6 h-6" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              البريد الإلكتروني للمزامنة
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-center font-medium"
              placeholder="example@email.com"
              dir="ltr"
            />
          </div>
        </div>

        {/* Auto Sync Section */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">مزامنة تلقائية</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">مزامنة البيانات عند كل عملية تغيير</p>
            </div>
          </div>
          <button 
            onClick={() => setAutoSync(!autoSync)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              autoSync ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <span
              className={`${
                autoSync ? 'translate-x-1' : 'translate-x-6'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="flex items-center justify-center gap-2 p-4 bg-white border-2 border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>مزامنة الآن</span>
          </button>
          
          <button
            onClick={handleSaveSettings}
            className="flex items-center justify-center gap-2 p-4 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-colors shadow-lg shadow-slate-200 dark:shadow-none"
          >
            <Save className="w-5 h-5" />
            <span>حفظ الإعدادات</span>
          </button>
        </div>

        {/* Last Sync Status */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-blue-900 dark:text-blue-100">آخر مزامنة ناجحة</span>
          </div>
          <span className="text-sm font-medium text-blue-700 dark:text-blue-300" dir="ltr">
            {lastSync || 'لم تتم المزامنة بعد'}
          </span>
        </div>

      </div>
    </div>
  );
}
