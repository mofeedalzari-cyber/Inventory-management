import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth, User } from '../../contexts/AuthContext';
import { Plus, Trash2, Edit2, Shield, User as UserIcon } from 'lucide-react';

export default function UsersScreen() {
  const { t } = useTranslation();
  const { users, addUser, updateUser, deleteUser, user: currentUser } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee' as 'admin' | 'employee'
  });

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingId(user.id);
      setFormData({
        name: user.name,
        email: user.email,
        password: user.password || '',
        role: user.role
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'employee'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      if (editingId) {
        updateUser(editingId, formData);
      } else {
        addUser(formData);
      }
      setIsModalOpen(false);
    }
  };

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <Shield size={48} className="mb-4 text-gray-400" />
        <p>عذراً، هذه الصفحة مخصصة للمدراء فقط</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">المستخدمين والصلاحيات</h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white p-2 rounded-xl shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-3">
        {users.map(u => (
          <div key={u.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
              <div className={`p-2 rounded-full ${u.role === 'admin' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                {u.role === 'admin' ? <Shield size={20} /> : <UserIcon size={20} />}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{u.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
              </div>
            </div>
            <div className="flex space-x-2 rtl:space-x-reverse">
              <button onClick={() => handleOpenModal(u)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                <Edit2 size={18} />
              </button>
              {u.id !== currentUser.id && (
                <button onClick={() => deleteUser(u.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingId ? 'تعديل مستخدم' : 'إضافة مستخدم'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الاسم</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">البريد الإلكتروني / اسم المستخدم</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">كلمة المرور</label>
                <input
                  type="text"
                  required={!editingId}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الصلاحية</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as 'admin' | 'employee'})}
                >
                  <option value="employee">موظف</option>
                  <option value="admin">مدير</option>
                </select>
              </div>
              <div className="flex space-x-3 rtl:space-x-reverse mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium shadow-sm hover:bg-blue-700 transition-colors"
                >
                  {t('save')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
