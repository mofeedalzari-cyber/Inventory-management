import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '../../contexts/DataContext';
import { Plus, Trash2, Edit2, Users, Building2 } from 'lucide-react';

export default function EntitiesScreen() {
  const { t } = useTranslation();
  const { entities, addEntity, updateEntity, deleteEntity } = useData();
  const [activeTab, setActiveTab] = useState<'supplier' | 'destination'>('supplier');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const filteredEntities = entities.filter(e => e.type === activeTab);

  const handleOpenModal = (entity?: {id: string, name: string, phone?: string}) => {
    if (entity) {
      setEditingId(entity.id);
      setName(entity.name);
      setPhone(entity.phone || '');
    } else {
      setEditingId(null);
      setName('');
      setPhone('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      if (editingId) {
        updateEntity(editingId, name.trim(), phone.trim());
      } else {
        addEntity(name.trim(), activeTab, phone.trim());
      }
      setName('');
      setPhone('');
      setEditingId(null);
      setIsModalOpen(false);
    }
  };

  const handleDelete = (id: string) => {
    try {
      setError('');
      deleteEntity(id);
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('supplier')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse ${
            activeTab === 'supplier' 
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <Building2 size={16} />
          <span>الموردين</span>
        </button>
        <button
          onClick={() => setActiveTab('destination')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse ${
            activeTab === 'destination' 
              ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          <Users size={16} />
          <span>جهات الصرف</span>
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {activeTab === 'supplier' ? 'الموردين' : 'جهات الصرف'}
        </h2>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white p-2 rounded-xl shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-3">
        {filteredEntities.map(entity => (
          <div key={entity.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <span className="font-medium text-gray-900 dark:text-white">{entity.name}</span>
            <div className="flex space-x-2 rtl:space-x-reverse">
              <button onClick={() => handleOpenModal(entity)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                <Edit2 size={18} />
              </button>
              <button onClick={() => handleDelete(entity.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {filteredEntities.length === 0 && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            لا توجد بيانات
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingId ? 'تعديل' : 'إضافة'} {activeTab === 'supplier' ? 'مورد' : 'جهة صرف'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('name')}</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">رقم الواتساب (مع مفتاح الدولة)</label>
                <input
                  type="tel"
                  placeholder="96777xxxxxxx"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  dir="ltr"
                />
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
