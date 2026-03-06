import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '../../contexts/DataContext';
import { Plus, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, Search, Edit2, Trash2, Printer } from 'lucide-react';
import { format } from 'date-fns';

import { useAuth } from '../../contexts/AuthContext';

export default function MovementsScreen() {
  const { t } = useTranslation();
  const { movements, products, stores, entities, addMovement, updateMovement, deleteMovement } = useData();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    productId: '',
    type: 'in' as 'in' | 'out' | 'transfer',
    quantity: 1,
    fromStoreId: '',
    toStoreId: '',
    entityId: ''
  });

  const [error, setError] = useState('');

  const filteredMovements = movements.filter(m => {
    const product = products.find(p => p.id === m.productId);
    return product?.name.toLowerCase().includes(search.toLowerCase());
  });

  const handleOpenModal = (movement?: any) => {
    if (movement) {
      setEditingId(movement.id);
      setFormData({
        productId: movement.productId,
        type: movement.type,
        quantity: movement.quantity,
        fromStoreId: movement.fromStoreId || '',
        toStoreId: movement.toStoreId || '',
        entityId: movement.entityId || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        productId: '',
        type: 'in',
        quantity: 1,
        fromStoreId: '',
        toStoreId: '',
        entityId: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMovement(deleteId);
      setDeleteId(null);
    }
  };

  const sendWhatsAppMessage = (movementData: any) => {
    const entity = entities.find(e => e.id === movementData.entityId);
    if (!entity || !entity.phone) return;

    const product = products.find(p => p.id === movementData.productId);
    const store = stores.find(s => s.id === (movementData.type === 'in' ? movementData.toStoreId : movementData.fromStoreId));
    
    const message = `
*إشعار حركة مخزنية*
------------------
*النوع:* ${movementData.type === 'in' ? 'توريد' : 'صرف'}
*المنتج:* ${product?.name}
*الكمية:* ${movementData.quantity} ${product?.unit || 'قطعة'}
*المخزن:* ${store?.name}
*المندوب:* ${user?.name || 'غير معروف'}
------------------
يرجى الاطلاع على المرفق للتفاصيل.
    `.trim();

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${entity.phone}?text=${encodedMessage}`;
    
    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
  };

  const printReceipt = (movementData: any) => {
    const product = products.find(p => p.id === movementData.productId);
    const fromStore = stores.find(s => s.id === movementData.fromStoreId);
    const toStore = stores.find(s => s.id === movementData.toStoreId);
    const entity = entities.find(e => e.id === movementData.entityId);
    
    const isOut = movementData.type === 'out';
    const isIn = movementData.type === 'in';
    const isTransfer = movementData.type === 'transfer';

    const title = isOut ? 'إذن صرف مخزني' : isIn ? 'إذن توريد مخزني' : 'إذن نقل مخزني';
    const headerText = isIn 
      ? `تم التوريد من: ${entity?.name || '-'} إلى: ${toStore?.name || '-'}`
      : isOut 
        ? `تم الصرف من: ${fromStore?.name || '-'} إلى: ${entity?.name || '-'}`
        : `نقل من: ${fromStore?.name || '-'} إلى: ${toStore?.name || '-'}`;

    const date = format(new Date(), 'yyyy/MM/dd HH:mm');
    const delegateName = user?.name || 'غير معروف';
    const storeManager = isIn ? toStore?.managerName : isOut ? fromStore?.managerName : '';
    
    let storeName = '-';
    if (isIn) storeName = toStore?.name || '-';
    if (isOut) storeName = fromStore?.name || '-';
    if (isTransfer) storeName = `من ${fromStore?.name} إلى ${toStore?.name}`;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html dir="rtl" lang="ar">
        <head>
          <title>${title}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              padding: 20px; 
              color: #000;
              max-width: 210mm;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .title { 
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .subtitle {
              font-size: 18px;
              margin-bottom: 5px;
            }
            .meta {
              color: #666;
              font-size: 14px;
              margin-top: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th, td {
              border: 1px solid #333;
              padding: 10px;
              text-align: center;
              font-size: 14px;
            }
            th {
              background-color: #f3f4f6;
              font-weight: bold;
            }
            .footer {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
              padding: 0 20px;
            }
            .signature-section {
              text-align: center;
              flex: 1;
            }
            .signature-title {
              font-weight: bold;
              margin-bottom: 5px;
            }
            .signature-name {
              font-size: 12px;
              color: #666;
              min-height: 18px;
            }
            .signature-line {
              margin-top: 30px;
              border-top: 1px solid #000;
              width: 80%;
              margin-left: auto;
              margin-right: auto;
            }
            @media print {
              @page { margin: 10mm; }
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">${title}</div>
            <div class="subtitle">${headerText}</div>
            <div class="meta">تاريخ الطباعة: ${date}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>م</th>
                <th>المخزن</th>
                <th>اسم المنتج</th>
                <th>الكمية</th>
                <th>${isIn ? 'المورد' : isOut ? 'جهة الصرف' : 'الجهة'}</th>
                <th>المندوب</th>
                <th>ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>${storeName}</td>
                <td>${product?.name || 'غير معروف'}</td>
                <td style="font-weight: bold; direction: ltr;">${movementData.quantity} ${product?.unit || 'قطعة'}</td>
                <td>${entity?.name || '-'}</td>
                <td>${delegateName}</td>
                <td>${isTransfer ? 'نقل مخزني' : '-'}</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <div class="signature-section">
              <div class="signature-title">أمين المخزن</div>
              <div class="signature-name"></div>
              <div class="signature-line"></div>
            </div>
            <div class="signature-section">
              <div class="signature-title">مدير المخزن</div>
              <div class="signature-name">${storeManager || ''}</div>
              <div class="signature-line"></div>
            </div>
            <div class="signature-section">
              <div class="signature-title">${isIn ? 'المورد' : 'المستلم'}</div>
              <div class="signature-name">${entity?.name || ''}</div>
              <div class="signature-line"></div>
            </div>
          </div>

          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!formData.productId) {
      setError('الرجاء اختيار المنتج');
      return;
    }
    if (!formData.quantity || formData.quantity <= 0) {
      setError('الرجاء إدخال كمية صحيحة');
      return;
    }

    if (formData.type === 'in') {
      if (!formData.toStoreId) {
        setError('الرجاء اختيار المخزن المستلم');
        return;
      }
      if (!formData.entityId) {
        setError('الرجاء اختيار المورد');
        return;
      }
    } else if (formData.type === 'out') {
      if (!formData.fromStoreId) {
        setError('الرجاء اختيار المخزن المنصرف منه');
        return;
      }
      if (!formData.entityId) {
        setError('الرجاء اختيار جهة الصرف');
        return;
      }
    } else if (formData.type === 'transfer') {
      if (!formData.fromStoreId) {
        setError('الرجاء اختيار المخزن المحول منه');
        return;
      }
      if (!formData.toStoreId) {
        setError('الرجاء اختيار المخزن المحول إليه');
        return;
      }
      if (formData.fromStoreId === formData.toStoreId) {
        setError('لا يمكن التحويل لنفس المخزن');
        return;
      }
    }

    // Validate stock for out and transfer movements
    if (formData.type === 'out' || formData.type === 'transfer') {
      const product = products.find(p => p.id === formData.productId);
      if (product && formData.fromStoreId) {
        const currentStock = product.stockByStore[formData.fromStoreId] || 0;
        if (currentStock < formData.quantity) {
          setError(`الكمية غير كافية في المخزن المحدد. المتاح: ${currentStock}`);
          return;
        }
      }
    }

    if (editingId) {
      updateMovement(editingId, formData);
    } else {
      addMovement(formData);
    }
    
    // Check if we need to send WhatsApp message
    if (formData.entityId && !editingId) { // Only send WhatsApp on new movements
      const entity = entities.find(e => e.id === formData.entityId);
      if (entity && entity.phone) {
        // Ask user if they want to send WhatsApp
        if (window.confirm(`هل تريد إرسال إشعار واتساب إلى ${entity.name}؟`)) {
          sendWhatsAppMessage(formData);
        }
      }
    }
    
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      productId: '',
      type: 'in',
      quantity: 1,
      fromStoreId: '',
      toStoreId: '',
      entityId: ''
    });
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'in': return <ArrowDownToLine className="text-green-500" size={20} />;
      case 'out': return <ArrowUpFromLine className="text-orange-500" size={20} />;
      case 'transfer': return <ArrowLeftRight className="text-blue-500" size={20} />;
      default: return null;
    }
  };

  const getTypeName = (type: string) => {
    switch(type) {
      case 'in': return t('in');
      case 'out': return t('out');
      case 'transfer': return t('transfer');
      default: return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 rtl:space-x-reverse">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none rtl:left-auto rtl:right-0 rtl:pr-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 rtl:pl-3 rtl:pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500 shadow-sm"
            placeholder={t('search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white p-3 rounded-xl shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="space-y-3">
        {filteredMovements.map(movement => {
          const product = products.find(p => p.id === movement.productId);
          const fromStore = stores.find(s => s.id === movement.fromStoreId);
          const toStore = stores.find(s => s.id === movement.toStoreId);
          const entity = entities.find(e => e.id === movement.entityId);
          
          return (
            <div key={movement.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4 rtl:space-x-reverse">
              <div className={`p-3 rounded-xl shrink-0 ${
                movement.type === 'in' ? 'bg-green-100 dark:bg-green-900/30' :
                movement.type === 'out' ? 'bg-orange-100 dark:bg-orange-900/30' :
                'bg-blue-100 dark:bg-blue-900/30'
              }`}>
                {getIcon(movement.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white truncate">{product?.name}</h4>
                  <span className={`text-sm font-bold ${
                    movement.type === 'in' ? 'text-green-600 dark:text-green-400' :
                    movement.type === 'out' ? 'text-orange-600 dark:text-orange-400' :
                    'text-blue-600 dark:text-blue-400'
                  }`}>
                    {movement.type === 'out' ? '-' : '+'}{movement.quantity}
                  </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex flex-col space-y-1">
                  <div className="flex items-center space-x-1 rtl:space-x-reverse">
                    <span className="font-medium">{getTypeName(movement.type)}</span>
                    <span>•</span>
                    <span>{format(new Date(movement.date), 'yyyy/MM/dd HH:mm')}</span>
                  </div>
                  {movement.type === 'in' && toStore && (
                    <span>إلى: {toStore.name}</span>
                  )}
                  {movement.type === 'in' && entity && (
                    <span>المورد: {entity.name}</span>
                  )}
                  {movement.type === 'out' && fromStore && (
                    <span>من: {fromStore.name}</span>
                  )}
                  {movement.type === 'out' && entity && (
                    <span>جهة الصرف: {entity.name}</span>
                  )}
                  {movement.type === 'transfer' && fromStore && toStore && (
                    <span>من {fromStore.name} إلى {toStore.name}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <button
                  onClick={() => printReceipt(movement)}
                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  title="طباعة إيصال"
                >
                  <Printer size={18} />
                </button>
                <button
                  onClick={() => handleOpenModal(movement)}
                  className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                  title="تعديل"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDeleteClick(movement.id)}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  title="حذف"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
        {filteredMovements.length === 0 && (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            لا توجد حركات مطابقة
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">تأكيد الحذف</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">هل أنت متأكد من حذف هذه الحركة؟ سيتم التراجع عن تأثيرها على المخزون.</p>
            <div className="flex space-x-3 rtl:space-x-reverse">
              <button
                onClick={confirmDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded-xl font-medium hover:bg-red-700 transition-colors"
              >
                حذف
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-2xl sm:rounded-2xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingId ? 'تعديل حركة' : 'تسجيل حركة'}
            </h3>
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">نوع الحركة</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({...formData, type: 'in'});
                      setError('');
                    }}
                    className={`py-2 px-3 rounded-xl text-sm font-medium border flex justify-center items-center space-x-1 rtl:space-x-reverse ${
                      formData.type === 'in' 
                        ? 'bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400' 
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <ArrowDownToLine size={16} />
                    <span>{t('in')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({...formData, type: 'out'});
                      setError('');
                    }}
                    className={`py-2 px-3 rounded-xl text-sm font-medium border flex justify-center items-center space-x-1 rtl:space-x-reverse ${
                      formData.type === 'out' 
                        ? 'bg-orange-50 dark:bg-orange-900/30 border-orange-500 text-orange-700 dark:text-orange-400' 
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <ArrowUpFromLine size={16} />
                    <span>{t('out')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({...formData, type: 'transfer'});
                      setError('');
                    }}
                    className={`py-2 px-3 rounded-xl text-sm font-medium border flex justify-center items-center space-x-1 rtl:space-x-reverse ${
                      formData.type === 'transfer' 
                        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400' 
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <ArrowLeftRight size={16} />
                    <span>{t('transfer')}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المنتج</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.productId}
                  onChange={e => {
                    setFormData({...formData, productId: e.target.value});
                    setError('');
                  }}
                >
                  <option value="" disabled>اختر المنتج</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('quantity')}</label>
                <input
                  type="number"
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  value={formData.quantity}
                  onChange={e => {
                    setFormData({...formData, quantity: parseInt(e.target.value)});
                    setError('');
                  }}
                />
              </div>

              {(formData.type === 'out' || formData.type === 'transfer') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('from_store')}</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.fromStoreId}
                    onChange={e => {
                      setFormData({...formData, fromStoreId: e.target.value});
                      setError('');
                    }}
                  >
                    <option value="" disabled>اختر المخزن</option>
                    {stores.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {(formData.type === 'in' || formData.type === 'transfer') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('to_store')}</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.toStoreId}
                    onChange={e => setFormData({...formData, toStoreId: e.target.value})}
                  >
                    <option value="" disabled>اختر المخزن</option>
                    {stores.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.type === 'in' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">المورد</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.entityId}
                    onChange={e => {
                      setFormData({...formData, entityId: e.target.value});
                      setError('');
                    }}
                  >
                    <option value="" disabled>اختر المورد</option>
                    {entities.filter(e => e.type === 'supplier').map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {formData.type === 'out' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">جهة الصرف</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={formData.entityId}
                    onChange={e => {
                      setFormData({...formData, entityId: e.target.value});
                      setError('');
                    }}
                  >
                    <option value="" disabled>اختر جهة الصرف</option>
                    {entities.filter(e => e.type === 'destination').map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex space-x-3 rtl:space-x-reverse mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-medium shadow-sm hover:bg-blue-700 transition-colors"
                >
                  {editingId ? 'تعديل' : t('save')}
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
