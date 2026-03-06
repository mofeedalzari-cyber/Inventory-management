import React from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Printer, Download, TrendingUp, Package, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function ReportsScreen() {
  const { t } = useTranslation();
  const { products, movements, stores, entities } = useData();
  const { user } = useAuth();

  const printReport = (title: string, subtitle: string, headers: string[], content: any[][] | { title: string; rows: any[][] }[], responsibleManagerName?: string) => {
    try {
      const date = format(new Date(), 'yyyy/MM/dd HH:mm');
      const printWindow = window.open('', '_blank');
      
      if (!printWindow) {
        alert('تم حظر النافذة المنبثقة. الرجاء السماح بالنوافذ المنبثقة لهذا الموقع للتمكن من الطباعة.');
        return;
      }

      const isMultiSection = content.length > 0 && !Array.isArray(content[0]);

      let tablesHtml = '';
      if (isMultiSection) {
        (content as { title: string; rows: any[][] }[]).forEach(section => {
          tablesHtml += `
            <div style="page-break-inside: avoid;">
              <h3 style="margin-top: 30px; margin-bottom: 15px; text-align: right; font-size: 18px; border-bottom: 1px solid #eee; padding-bottom: 5px;">${section.title}</h3>
              <table>
                <thead>
                  <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
                </thead>
                <tbody>
                  ${section.rows.map(row => `<tr>${row.map((cell: any) => `<td>${cell}</td>`).join('')}</tr>`).join('')}
                </tbody>
              </table>
            </div>
          `;
        });
      } else {
        tablesHtml = `
          <table>
            <thead>
              <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
              ${(content as any[][]).map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        `;
      }

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
                font-size: 16px;
                margin-bottom: 5px;
                color: #333;
              }
              .meta {
                color: #666;
                font-size: 14px;
                margin-top: 10px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 10px;
                font-size: 12px;
              }
              th, td {
                border: 1px solid #333;
                padding: 8px;
                text-align: center;
              }
              th {
                background-color: #f3f4f6;
                font-weight: bold;
              }
              .footer {
                margin-top: 50px;
                display: flex;
                justify-content: space-between;
                padding: 0 50px;
                page-break-inside: avoid;
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
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="title">${title}</div>
              <div class="subtitle">${subtitle}</div>
              <div class="meta">تاريخ الطباعة: ${date}</div>
            </div>

            ${tablesHtml}

            <div class="footer">
              <div class="signature-section">
                <div class="signature-title">أمين المخزن</div>
                <div class="signature-name"></div>
                <div class="signature-line"></div>
              </div>
              <div class="signature-section">
                <div class="signature-title">مدير المخزن</div>
                <div class="signature-name"></div>
                <div class="signature-line"></div>
              </div>
              <div class="signature-section">
                <div class="signature-title">المدير المسؤول</div>
                <div class="signature-name">${responsibleManagerName || ''}</div>
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
    } catch (error) {
      console.error('Print error:', error);
      alert('حدث خطأ أثناء محاولة الطباعة. الرجاء المحاولة مرة أخرى.');
    }
  };

  // 1. Inventory Report
  const exportInventoryPDF = () => {
    const tableData = products.map(p => {
      const totalStock = Object.values(p.stockByStore).reduce((a, b) => a + b, 0);
      return [p.name || '-', p.barcode || '-', p.unit || 'قطعة', totalStock];
    });

    printReport('تقرير المخزون الحالي', 'بيان أرصدة جميع المخازن', ['اسم المنتج', 'الباركود', 'الوحدة', 'إجمالي المخزون'], tableData, user?.name);
  };

  const exportInventoryExcel = () => {
    const data = products.map(p => {
      const totalStock = Object.values(p.stockByStore).reduce((a, b) => a + b, 0);
      return {
        'اسم المنتج': p.name,
        'الباركود': p.barcode,
        'السعر': p.price || 0,
        'إجمالي المخزون': totalStock,
        'الحد الأدنى': p.minStock
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "المخزون");
    XLSX.writeFile(wb, "inventory-report.xlsx");
  };

  // 2. Incoming Report
  const exportIncomingPDF = () => {
    const incomingMovements = movements
      .filter(m => m.type === 'in')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (incomingMovements.length === 0) {
      alert('لا توجد حركات واردة للطباعة');
      return;
    }

    const firstDate = incomingMovements.length > 0 ? new Date(incomingMovements[incomingMovements.length - 1].date) : new Date();
    const dateRange = `من تاريخ ${format(firstDate, 'yyyy/MM/dd')} إلى تاريخ ${format(new Date(), 'yyyy/MM/dd')}`;

    // Group by Store
    const movementsByStore: Record<string, typeof incomingMovements> = {};
    incomingMovements.forEach(m => {
      const storeId = m.toStoreId || 'unknown';
      if (!movementsByStore[storeId]) {
        movementsByStore[storeId] = [];
      }
      movementsByStore[storeId].push(m);
    });

    const sections = Object.keys(movementsByStore).map(storeId => {
      const store = stores.find(s => s.id === storeId);
      const storeName = store ? store.name : 'مخزن غير معروف';
      
      const rows = movementsByStore[storeId].map(m => {
        const product = products.find(p => p.id === m.productId);
        const entity = entities.find(e => e.id === m.entityId);
        
        return [
          product?.name || 'غير معروف', 
          entity?.name || '-',
          m.quantity, 
          format(new Date(m.date), 'yyyy/MM/dd HH:mm')
        ];
      });

      return {
        title: `تم التوريد إلى المخازن: ${storeName}`,
        rows: rows
      };
    });

    printReport('تقرير الوارد', dateRange, ['المنتج', 'المورد', 'الكمية', 'التاريخ'], sections, user?.name);
  };

  const exportIncomingExcel = () => {
    const incomingMovements = movements
      .filter(m => m.type === 'in')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const data = incomingMovements.map(m => {
      const product = products.find(p => p.id === m.productId);
      const toStore = stores.find(s => s.id === m.toStoreId);
      const entity = entities.find(e => e.id === m.entityId);
      
      return {
        'المنتج': product?.name || 'غير معروف',
        'المورد': entity?.name || '-',
        'الكمية': m.quantity,
        'إلى مخزن': toStore?.name || '-',
        'التاريخ': format(new Date(m.date), 'yyyy/MM/dd HH:mm')
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الوارد");
    XLSX.writeFile(wb, "incoming-report.xlsx");
  };

  // 3. Outgoing Report
  const exportOutgoingPDF = () => {
    const outgoingMovements = movements
      .filter(m => m.type === 'out')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (outgoingMovements.length === 0) {
      alert('لا توجد حركات صادرة للطباعة');
      return;
    }

    const firstDate = outgoingMovements.length > 0 ? new Date(outgoingMovements[outgoingMovements.length - 1].date) : new Date();
    const dateRange = `من تاريخ ${format(firstDate, 'yyyy/MM/dd')} إلى تاريخ ${format(new Date(), 'yyyy/MM/dd')}`;

    // Group by Store
    const movementsByStore: Record<string, typeof outgoingMovements> = {};
    outgoingMovements.forEach(m => {
      const storeId = m.fromStoreId || 'unknown';
      if (!movementsByStore[storeId]) {
        movementsByStore[storeId] = [];
      }
      movementsByStore[storeId].push(m);
    });

    const sections = Object.keys(movementsByStore).map(storeId => {
      const store = stores.find(s => s.id === storeId);
      const storeName = store ? store.name : 'مخزن غير معروف';
      const managerName = store ? store.managerName : '-';
      
      const rows = movementsByStore[storeId].map(m => {
        const product = products.find(p => p.id === m.productId);
        const entity = entities.find(e => e.id === m.entityId);
        
        return [
          product?.name || 'غير معروف', 
          entity?.name || '-',
          m.quantity, 
          managerName || '-',
          format(new Date(m.date), 'yyyy/MM/dd HH:mm')
        ];
      });

      return {
        title: `تم الصرف من المخازن: ${storeName}`,
        rows: rows
      };
    });

    printReport('تقرير الصادر', dateRange, ['المنتج', 'جهة الصرف', 'الكمية', 'مدير المخزن', 'التاريخ'], sections, user?.name);
  };

  const exportOutgoingExcel = () => {
    const outgoingMovements = movements
      .filter(m => m.type === 'out')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const data = outgoingMovements.map(m => {
      const product = products.find(p => p.id === m.productId);
      const fromStore = stores.find(s => s.id === m.fromStoreId);
      const entity = entities.find(e => e.id === m.entityId);
      
      return {
        'المنتج': product?.name || 'غير معروف',
        'جهة الصرف': entity?.name || '-',
        'الكمية': m.quantity,
        'من مخزن': fromStore?.name || '-',
        'مدير المخزن': fromStore?.managerName || '-',
        'التاريخ': format(new Date(m.date), 'yyyy/MM/dd HH:mm')
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الصادر");
    XLSX.writeFile(wb, "outgoing-report.xlsx");
  };

  // 3. Low Stock Report
  const exportLowStockPDF = () => {
    const lowStockProducts = products.filter(p => {
      const totalStock = Object.values(p.stockByStore).reduce((a, b) => a + b, 0);
      return totalStock <= p.minStock;
    });

    const tableData = lowStockProducts.map(p => {
      const totalStock = Object.values(p.stockByStore).reduce((a, b) => a + b, 0);
      return [p.name || '-', p.barcode || '-', totalStock, p.minStock];
    });

    printReport('تقرير النواقص', 'بيان المنتجات التي وصلت للحد الأدنى', ['المنتج', 'الباركود', 'المخزون الحالي', 'الحد الأدنى'], tableData, user?.name);
  };

  const exportLowStockExcel = () => {
    const lowStockProducts = products.filter(p => {
      const totalStock = Object.values(p.stockByStore).reduce((a, b) => a + b, 0);
      return totalStock <= p.minStock;
    });

    const data = lowStockProducts.map(p => {
      const totalStock = Object.values(p.stockByStore).reduce((a, b) => a + b, 0);
      return {
        'اسم المنتج': p.name,
        'الباركود': p.barcode,
        'المخزون الحالي': totalStock,
        'الحد الأدنى': p.minStock
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "النواقص");
    XLSX.writeFile(wb, "low-stock-report.xlsx");
  };

  const ReportCard = ({ title, description, icon: Icon, onExportPDF, onExportExcel }: any) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
      <div className="flex items-start space-x-4 rtl:space-x-reverse mb-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400 shrink-0">
          <Icon size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        </div>
      </div>
      <div className="flex space-x-2 rtl:space-x-reverse">
        <button 
          onClick={onExportPDF}
          className="flex-1 flex items-center justify-center space-x-2 rtl:space-x-reverse py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Printer size={16} className="text-blue-500" />
          <span>طباعة / PDF</span>
        </button>
        <button 
          onClick={onExportExcel}
          className="flex-1 flex items-center justify-center space-x-2 rtl:space-x-reverse py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Download size={16} className="text-green-500" />
          <span>{t('export_excel')}</span>
        </button>
      </div>
    </div>
  );

  const sortedMovements = [...movements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ReportCard 
          title="تقرير المخزون الحالي"
          description="عرض كميات جميع المنتجات في جميع المخازن مع تفاصيل الأسعار."
          icon={Package}
          onExportPDF={exportInventoryPDF}
          onExportExcel={exportInventoryExcel}
        />
        
        <ReportCard 
          title="تقرير الوارد"
          description="سجل بجميع حركات الإضافة والتوريد إلى المخازن."
          icon={TrendingUp}
          onExportPDF={exportIncomingPDF}
          onExportExcel={exportIncomingExcel}
        />

        <ReportCard 
          title="تقرير الصادر"
          description="سجل بجميع حركات الصرف من المخازن."
          icon={TrendingUp}
          onExportPDF={exportOutgoingPDF}
          onExportExcel={exportOutgoingExcel}
        />

        <ReportCard 
          title="تقرير النواقص"
          description="قائمة بالمنتجات التي نفدت أو قاربت على النفاذ (أقل من الحد الأدنى)."
          icon={AlertTriangle}
          onExportPDF={exportLowStockPDF}
          onExportExcel={exportLowStockExcel}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-bold text-gray-900 dark:text-white">جدول الصادر والوارد (مرتب بالأحدث)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-700/50 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">م</th>
                <th className="px-4 py-3">المورد / الجهة</th>
                <th className="px-4 py-3">نوع الحركة</th>
                <th className="px-4 py-3">المنتج</th>
                <th className="px-4 py-3">الكمية</th>
                <th className="px-4 py-3">المتبقي الحالي</th>
                <th className="px-4 py-3">التاريخ</th>
                <th className="px-4 py-3">ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              {sortedMovements.map((m, index) => {
                const product = products.find(p => p.id === m.productId);
                const fromStore = stores.find(s => s.id === m.fromStoreId);
                const toStore = stores.find(s => s.id === m.toStoreId);
                const entity = entities.find(e => e.id === m.entityId);
                const totalStock = product ? Object.values(product.stockByStore).reduce((a, b) => a + b, 0) : 0;
                
                return (
                  <tr key={m.id} className="border-b border-gray-50 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{index + 1}</td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {entity?.name || '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                        m.type === 'in' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        m.type === 'out' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {m.type === 'in' ? 'وارد' : m.type === 'out' ? 'صادر' : 'نقل'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{product?.name || '-'}</td>
                    <td className="px-4 py-3 font-bold" dir="ltr">
                      {m.type === 'out' ? '-' : '+'}{m.quantity}
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-700 dark:text-gray-300" dir="ltr">
                      {totalStock}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400" dir="ltr">{format(new Date(m.date), 'yyyy/MM/dd HH:mm')}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {m.type === 'in' && toStore && `إلى: ${toStore.name}`}
                      {m.type === 'out' && fromStore && `من: ${fromStore.name}`}
                      {m.type === 'transfer' && fromStore && toStore && `من ${fromStore.name} إلى ${toStore.name}`}
                    </td>
                  </tr>
                );
              })}
              {sortedMovements.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    لا توجد حركات مسجلة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
