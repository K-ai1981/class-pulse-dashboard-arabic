# لوحة نبض الصف — Class Pulse Dashboard

> أداة تفاعلية تساعد المعلمين على جمع تقييم سريع من الطلاب بعد الحصة، مع عرض ملخص فوري وتوصية تعليمية ذكية.

---

## 📌 وصف المشروع

**لوحة نبض الصف** موقع تفاعلي يتيح للطالب تعبئة نموذج قصير في نهاية الدرس يشمل:
- مستوى فهمه للدرس
- أهم شيء تعلمه
- أي سؤال ما زال لديه

يعرض الموقع للمعلم في الحال: إحصائيات المشاركة، وملخص حالات الفهم، وتوصية تعليمية مبنية على الإجابات.

---

## 🎯 الهدف التعليمي

يهدف هذا المشروع إلى تعليم الطلاب والمعلمين:

- ✅ استخدام الذكاء الاصطناعي (Claude / Gemini) في بناء مشروع رقمي حقيقي
- ✅ فهم أساسيات HTML وCSS وJavaScript
- ✅ حفظ المشروع في GitHub وفهم معنى Version Control
- ✅ نشر الموقع باستخدام GitHub Pages
- ✅ ربط الموقع بـ Backend لحفظ البيانات (Google Sheets أو Firebase)
- ✅ التفكير في الخصوصية والمسؤولية الرقمية عند التعامل مع بيانات الطلاب

---

## 🛠️ الأدوات المستخدمة

| الأداة | الاستخدام |
|---|---|
| Claude | كتابة الكود وشرحه وتحسين التصميم |
| Gemini | توليد أفكار وتحسين النصوص العربية |
| HTML | هيكل الموقع |
| CSS | التصميم والألوان |
| JavaScript | التفاعل والمنطق البرمجي |
| GitHub | حفظ المشروع وإدارة الإصدارات |
| GitHub Pages | نشر الموقع مجاناً |
| Google Sheets | حفظ بيانات الطلاب (الخيار الأول) |
| Firebase | حفظ البيانات بشكل متقدم (الخيار الثاني) |

---

## ▶️ طريقة التشغيل المحلي

1. نزّل ملفات المشروع الثلاثة:
   - `index.html`
   - `style.css`
   - `script.js`
2. ضعها في مجلد واحد
3. افتح `index.html` مباشرة في المتصفح (Chrome أو Edge)
4. الموقع يعمل فوراً بدون أي إعداد إضافي
5. البيانات تُحفظ مؤقتاً في `localStorage` داخل المتصفح

---

## 🔗 ربط Backend

### الخيار الأول: Google Sheets

1. افتح Google Sheets وأنشئ ورقة جديدة
2. أضف هذه الأعمدة في الصف الأول:
   ```
   الاسم | الصف | حالة الفهم | أهم شيء تعلمه | السؤال المتبقي | التاريخ
   ```
3. من القائمة: **Extensions → Apps Script**
4. الصق الكود التالي:

```javascript
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data  = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.studentName,
    data.className,
    data.understanding,
    data.mainLearning,
    data.remainingQuestion || '—',
    new Date().toLocaleString('ar-SA'),
  ]);
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

5. احفظ ← **Deploy → New deployment → Web App**
6. اختر: **Execute as: Me** و **Who has access: Anyone**
7. انسخ رابط الـ Web App
8. في ملف `script.js`، ضع الرابط في المتغير:
   ```javascript
   const BACKEND_URL = 'https://script.google.com/macros/s/YOUR_ID/exec';
   ```

---

### الخيار الثاني: Firebase (متقدم)

Firebase هي منصة من Google تتيح حفظ البيانات في قاعدة بيانات سحابية في الوقت الفعلي.

**متى تختار Firebase؟**
- عندما تريد مشاركة النتائج مع المعلم مباشرة أثناء الحصة
- عندما تريد بناء تطبيق أكثر احترافية مستقبلاً
- عندما يكون لديك وقت إضافي لتعلم الإعداد

**الخطوات الأساسية:**
1. أنشئ حساباً على firebase.google.com
2. أنشئ مشروعاً جديداً
3. أضف Firestore Database
4. اربط SDK في ملف `index.html`
5. استبدل دالة `sendToBackend` بكود Firebase

---

## 🚀 نشر الموقع — GitHub Pages

```
AI Tools → Website Code → GitHub → GitHub Pages → Backend Data
```

### الخطوات:

1. أنشئ حساباً على [github.com](https://github.com)
2. أنشئ Repository جديداً باسم: `class-pulse-dashboard-arabic`
3. ارفع الملفات الثلاثة + هذا الملف `README.md`
4. اكتب رسالة Commit: `إضافة النسخة الأولى من موقع لوحة نبض الصف`
5. في Repository → **Settings → Pages**
6. اختر: **Source: Deploy from a branch → main → / (root)**
7. احفظ — سيظهر رابط الموقع خلال دقيقة

---

## 🔒 الخصوصية والأمان

- لا تجمع بيانات حساسة — يمكن للطلاب استخدام أسماء مستعارة
- احصل على موافقة المدرسة قبل نشر أي مشروع يتعامل مع بيانات الطلاب
- لا تجعل نتائج الطلاب مرئية للعموم بدون إذن
- استخدم صلاحيات Google Sheets أو Firebase بشكل مقيّد
- هذا المشروع نموذج تعليمي، وليس نظاماً رسمياً لإدارة بيانات الطلاب

---

## 💡 اقتراحات للتطوير المستقبلي

- [ ] إضافة تسجيل دخول للمعلم بكلمة مرور
- [ ] عرض نتائج كل حصة بشكل منفصل
- [ ] إضافة رسوم بيانية (Charts) للإحصائيات
- [ ] إرسال ملخص تلقائي للمعلم بالبريد الإلكتروني
- [ ] دعم تعدد الفصول والمواد الدراسية
- [ ] تصدير النتائج كملف PDF
- [ ] ترجمة الموقع للإنجليزية

---

## 📄 الرخصة

مشروع مفتوح المصدر للاستخدام التعليمي — يُرجى الإشارة إلى المصدر عند مشاركته.
