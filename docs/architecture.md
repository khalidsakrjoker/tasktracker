# المعمارية البرمجية لنظام TaskTracker

```mermaid
flowchart TD
    Client[React + Tailwind SPA] -->|REST API & Auth Cookie| Server[Express Server + Pino]
    Server -->|Prisma Client| DB[(SQLite WAL Database)]
    Server -->|Telegram Bot API| TG[Telegram Alerts & Backups]
```

## القرارات المعمارية الرئيسية
1. **قاعدة البيانات:** استخدام SQLite مع تفعيل نمط WAL لضمان سرعة فائقة في العمل الشخصي وعدم استهلاك أي رامات إضافية على السيرفر.
2. **عزل الحظر الأمني:** يتم التحقق من الـ IP قبل الدخول لأي مسار من مسارات الـ API لردع أي هجمات تخمين.
3. **خدمة الحاوية الموحدة:** السيرفر يقوم بتقديم الـ API وخدمة الواجهة المبنية على بورت واحد لتسهيل النشر على السيرفر.
