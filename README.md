# EVIL FIREBASE

مشروع مستقل مكوّن من واجهتين:
- `admin/` لوحة المخزن
- `store/` صفحة المحل
- `firebase.js` إعداد الاتصال بنفس Firebase

## التشغيل
1. في Firebase فعّل **Cloud Firestore**.
2. ضع قواعد مؤقتة للاختبار تسمح بالقراءة والكتابة، ثم نؤمّنها لاحقًا بحسابات الإدارة.
3. ارفع المجلد على استضافة تدعم HTTPS (Firebase Hosting أو GitHub Pages).
4. افتح `admin/index.html` لإدارة المنتجات.
5. افتح `store/index.html` لصفحة العملاء.

## ملاحظة الصور
النسخة الحالية تستخدم **رابط صورة**. في الخطوة التالية يمكن إضافة رفع الصور مباشرة إلى Firebase Storage.

## الأمان
لا نضع Service Account أو private keys داخل الواجهة. إعداد Web `firebaseConfig` الموجود هنا هو إعداد تطبيق الويب.
