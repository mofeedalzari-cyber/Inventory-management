import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ar: {
    translation: {
      "login": "تسجيل الدخول",
      "register": "إنشاء حساب",
      "email": "البريد الإلكتروني",
      "password": "كلمة المرور",
      "forgot_password": "نسيت كلمة المرور؟",
      "dashboard": "لوحة التحكم",
      "products": "المنتجات",
      "categories": "الأصناف",
      "stores": "المخازن",
      "movements": "حركة المخزون",
      "reports": "التقارير",
      "settings": "الإعدادات",
      "suppliers": "الموردين",
      "destinations": "جهات الصرف",
      "add_product": "إضافة منتج",
      "search": "بحث...",
      "total_products": "إجمالي المنتجات",
      "out_of_stock": "أصناف نافدة",
      "in_out_operations": "عمليات وارد/صادر",
      "low_stock_alerts": "تنبيهات انخفاض المخزون",
      "language": "اللغة",
      "dark_mode": "الوضع الليلي",
      "logout": "تسجيل الخروج",
      "save": "حفظ",
      "cancel": "إلغاء",
      "name": "الاسم",
      "category": "الصنف",
      "price": "السعر",
      "quantity": "الكمية",
      "barcode": "الباركود",
      "scan_barcode": "مسح الباركود",
      "in": "وارد",
      "out": "صادر",
      "transfer": "نقل",
      "from_store": "من مخزن",
      "to_store": "إلى مخزن",
      "date": "التاريخ",
      "export_pdf": "تصدير PDF",
      "export_excel": "تصدير Excel",
      "welcome": "مرحباً بك",
      "sign_in_google": "تسجيل الدخول باستخدام Google",
      "no_account": "ليس لديك حساب؟",
      "have_account": "لديك حساب بالفعل؟"
    }
  },
  en: {
    translation: {
      "login": "Login",
      "register": "Register",
      "email": "Email",
      "password": "Password",
      "forgot_password": "Forgot Password?",
      "dashboard": "Dashboard",
      "products": "Products",
      "categories": "Categories",
      "stores": "Stores",
      "movements": "Movements",
      "reports": "Reports",
      "settings": "Settings",
      "suppliers": "Suppliers",
      "destinations": "Destinations",
      "add_product": "Add Product",
      "search": "Search...",
      "total_products": "Total Products",
      "out_of_stock": "Out of Stock",
      "in_out_operations": "In/Out Operations",
      "low_stock_alerts": "Low Stock Alerts",
      "language": "Language",
      "dark_mode": "Dark Mode",
      "logout": "Logout",
      "save": "Save",
      "cancel": "Cancel",
      "name": "Name",
      "category": "Category",
      "price": "Price",
      "quantity": "Quantity",
      "barcode": "Barcode",
      "scan_barcode": "Scan Barcode",
      "in": "In",
      "out": "Out",
      "transfer": "Transfer",
      "from_store": "From Store",
      "to_store": "To Store",
      "date": "Date",
      "export_pdf": "Export PDF",
      "export_excel": "Export Excel",
      "welcome": "Welcome",
      "sign_in_google": "Sign in with Google",
      "no_account": "Don't have an account?",
      "have_account": "Already have an account?"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "ar", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
