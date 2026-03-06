import React from 'react';
import { useTranslation } from 'react-i18next';
import { useData } from '../../contexts/DataContext';
import { Package, AlertTriangle, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const { products, movements } = useData();

  const totalProducts = products.length;
  const outOfStock = products.filter(p => {
    const totalStock = Object.values(p.stockByStore).reduce((a, b) => a + b, 0);
    return totalStock === 0;
  }).length;
  
  const lowStock = products.filter(p => {
    const totalStock = Object.values(p.stockByStore).reduce((a, b) => a + b, 0);
    return totalStock > 0 && totalStock <= p.minStock;
  }).length;

  const inOperations = movements.filter(m => m.type === 'in').length;
  const outOperations = movements.filter(m => m.type === 'out').length;

  const chartData = [
    { name: t('in'), value: inOperations },
    { name: t('out'), value: outOperations },
  ];

  const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center space-x-4 rtl:space-x-reverse">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          title={t('total_products')} 
          value={totalProducts} 
          icon={Package} 
          colorClass="bg-blue-500" 
        />
        <StatCard 
          title={t('out_of_stock')} 
          value={outOfStock} 
          icon={AlertTriangle} 
          colorClass="bg-red-500" 
        />
        <StatCard 
          title={t('in')} 
          value={inOperations} 
          icon={ArrowDownToLine} 
          colorClass="bg-green-500" 
        />
        <StatCard 
          title={t('out')} 
          value={outOperations} 
          icon={ArrowUpFromLine} 
          colorClass="bg-orange-500" 
        />
      </div>

      {lowStock > 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 p-4 rounded-xl flex items-start space-x-3 rtl:space-x-reverse">
          <AlertTriangle className="text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-yellow-800 dark:text-yellow-400">
              {t('low_stock_alerts')}
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
              يوجد {lowStock} منتجات قاربت على النفاذ.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {t('in_out_operations')}
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px'}} />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
