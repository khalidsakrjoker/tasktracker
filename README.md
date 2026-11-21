# TaskTracker Studio

[![Vibe Coding](https://img.shields.io/badge/Vibe_Coding-100%25-8B5CF6?style=flat-square&logo=sparkles&logoColor=white)](https://github.com/khalidsakrjoker/tasktracker)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Release](https://img.shields.io/badge/Release-v1.0.0-emerald.svg)](https://github.com/khalidsakrjoker/tasktracker)

نظام إدارة المشروعات البرمجية والمهام اليومية المطور للمهندسين المستقلين لإدارة أكثر من مشروع وعميل في وقت واحد بدون تشتت أو نسيان. (تم تطويره بالكامل بنمط الـ Vibe Coding بتوجيه وإشراف المطور).

## المكونات الرئيسية
1. **مصفوفة التركيز اليومي (Daily Focus Matrix):**
   - 🚨 P1: الطوارئ والمهام الحرجة للعملاء.
   - ⚡ P2: بناء الميزات وتطوير المشروعات للأمام.
   - 🛠️ P3: تحسينات سريعة ودعم فني أقل من نصف ساعة.
2. **صندوق الاقتناص الخاطف (Quick Task Drawer):**
   - زر سريع واختصار كيبورد لتسجيل أي مهمة أو فكرة في 5 ثوانٍ وربطها بالعميل والمشروع.
3. **دليل العملاء (Clients CRM):**
   - متابعة عملاء كاش إكس، وسجدة POS، وقاعات الأفراح، وتوثيق طلبات كل عميل.
4. **منظومة الأمان:**
   - قفل بـ PIN مكون من 6 أرقام.
   - 3 محاولات خاطئة كحد أقصى متبوعة بحظر دائم لـ IP المتسلل.
   - إشعار فوري على جروب تليجرام وأمر لفك الحظر: `/unblock <IP>`.
5. **نسخ احتياطي مؤتمت:**
   - إرسال ملف قاعدة البيانات `workmanager.db` مباشرة إلى تليجرام.

## دليل بوت تيليجرام والأوامر
لمراجعة جميع أوامر البوت وطرق التحكم والتنبيهات الأمنية:
👉 [دليل بوت تيليجرام الكامل (TELEGRAM_BOT_GUIDE.md)](./docs/TELEGRAM_BOT_GUIDE.md)

## بنية التشغيل المحلية
```bash
# تثبيت الاعتماديات
npm install
cd client && npm install && cd ..

# تشغيل الاختبارات
npm test

# البناء والتشغيل
npm run build
npm start
```
