package com.mofeed.alkhazun.pro;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // الحصول على الـ WebView الخاص بـ Capacitor
        WebView webView = getBridge().getWebView();
        
        // ضبط الإعدادات لضمان حفظ البيانات
        WebSettings settings = webView.getSettings();
        settings.setDomStorageEnabled(true); // هذا هو الأهم لحفظ الـ localStorage
        settings.setDatabaseEnabled(true);
        settings.setJavaScriptEnabled(true);
        
        // إعدادات إضافية لضمان استمرارية الجلسة
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
    }
}