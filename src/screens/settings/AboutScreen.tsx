import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  Facebook, 
  Phone, 
  Video,
  Code2,
  Heart
} from 'lucide-react';

export default function AboutScreen() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">حول التطبيق</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 text-center space-y-8">
        
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Code2 size={48} />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            نظام إدارة المخزون
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            الإصدار 1.0.0
          </p>
        </div>

        <div className="py-6 border-t border-b border-gray-100 dark:border-gray-700">
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            تم تطوير وبرمجة
          </p>
          <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">
            مفيد الزري
          </h3>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            تواصل معنا عبر
          </p>
          
          <div className="grid gap-4">
            <a 
              href="https://www.facebook.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 p-4 rounded-xl bg-[#1877F2] text-white hover:bg-[#1864D9] transition-colors"
            >
              <Facebook size={24} />
              <span className="font-bold">فيسبوك</span>
            </a>

            <a 
              href="https://www.tiktok.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 p-4 rounded-xl bg-black text-white hover:bg-gray-900 transition-colors"
            >
              <Video size={24} />
              <span className="font-bold">تيك توك</span>
            </a>

            <a 
              href="tel:+967778492884" 
              className="flex items-center justify-center gap-3 p-4 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <Phone size={24} />
              <span className="font-bold" dir="ltr">+967 778 492 884</span>
            </a>
          </div>
        </div>

        <div className="pt-6 text-sm text-gray-400 flex items-center justify-center gap-1">
          <span>صنع بـ</span>
          <Heart size={16} className="text-red-500 fill-red-500" />
          <span>في اليمن</span>
        </div>

      </div>
    </div>
  );
}
