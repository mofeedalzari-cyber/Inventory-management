import React from 'react';
import { Facebook, MessageCircle, Video } from 'lucide-react';

export default function DeveloperFooter() {
  return (
    <div className="mt-8 text-center space-y-3 pb-6 border-t border-gray-100 dark:border-gray-800 pt-6">
      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
        تم تطوير وبرمجة مفيد الزري
      </p>
      <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
        <a 
          href="https://www.facebook.com/share/1H6kiRKGXT/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-blue-600 transition-colors bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <Facebook size={14} />
          <span>فيسبوك</span>
        </a>
        <a 
          href="https://www.tiktok.com/@mufeed_saleh_ali_alzree?is_from_webapp=1&sender_device=pc" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-pink-600 transition-colors bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <Video size={14} />
          <span>تيك توك</span>
        </a>
        <a 
          href="https://wa.me/967778492884" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 hover:text-green-600 transition-colors bg-white dark:bg-gray-800 px-3 py-1.5 rounded-full shadow-sm border border-gray-100 dark:border-gray-700"
        >
          <MessageCircle size={14} />
          <span dir="ltr">+967 778 492 884</span>
        </a>
      </div>
    </div>
  );
}
