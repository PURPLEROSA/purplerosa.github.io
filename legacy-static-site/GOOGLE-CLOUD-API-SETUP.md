# 🔑 מדריך הפעלת Google Cloud APIs

## מה את רואה עכשיו?
את נמצאת ב-Google Cloud Console, בפרויקט "AISHELLY".

## 📋 שלבים מדויקים ליצירת API Keys:

### שלב 1: הפעלת APIs הנדרשים

1. **בתפריט הצד השמאלי** (≡), חפש "APIs & Services"
2. לחץ על **"Library"** (ספריית APIs)
3. חפש והפעל את ה-APIs הבאים:

   **עבור Street View:**
   - ✅ **Maps JavaScript API** - לתצוגת המפות
   - ✅ **Street View Static API** - לתמונות רחוב
   - ✅ **Geocoding API** - לחיפוש כתובות

   **עבור Gemini AI:**
   - ✅ **Generative Language API** - לעבודה עם Gemini
   - ✅ **Vertex AI API** - למודלים מתקדמים

4. **לחץ על כל API** ואז לחץ על כפתור **"ENABLE"** (הפעל)

### שלב 2: יצירת API Keys

1. חזור ל-**"APIs & Services"**
2. לחץ על **"Credentials"** (פרטי התחברות)
3. למעלה, לחץ על **"+ CREATE CREDENTIALS"**
4. בחר **"API Key"**
5. ה-API Key ייווצר - **העתק אותו מיד!**

### שלב 3: אבטחת ה-API Key (חשוב!)

1. לחץ על **"Edit API key"** (עריכת מפתח)
2. תחת **"API restrictions"**:
   - בחר **"Restrict key"**
   - סמן את כל ה-APIs שהפעלת למעלה
3. תחת **"Application restrictions"**:
   - בחר **"HTTP referrers"**
   - הוסף: `https://purplerosa.github.io/*`
   - הוסף: `http://localhost:*` (לפיתוח מקומי)
4. לחץ על **"Save"**

---

## 🤖 Gemini API Key (נפרד!)

Gemini API מנוהל דרך **Google AI Studio**, לא Cloud Console:

### איך לקבל Gemini API Key:

1. היכנס ל-[Google AI Studio](https://makersuite.google.com/app/apikey)
2. לחץ על **"Get API Key"**
3. בחר את הפרויקט שלך (AISHELLY) או צור חדש
4. לחץ על **"Create API Key in new project"**
5. העתק את המפתח

**חשוב:** שמור את שני המפתחות (Google Maps + Gemini) בנפרד!

---

## 💳 עלויות וגבולות

### Google Maps API:
- **$200 חינם** בחודש הראשון
- אחרי זה: ~$2-7 לכל 1000 בקשות
- **המלצה:** הגדר גבול הוצאות ב-Billing

### Gemini API:
- **60 בקשות בדקה חינם** בתכנית החינמית
- גרסה PRO: תשלום לפי שימוש

### איך להגדיר Billing Limits:

1. לך ל-**"Billing"** בתפריט
2. לחץ על **"Budgets & alerts"**
3. צור **"Budget"** עם סכום מקסימלי (למשל $10)
4. הפעל **"Email alerts"** ב-50%, 90%, 100%

---

## ✅ בדיקה שהכל עובד

אחרי שיצרת את המפתחות:

1. **בדוק Maps API:**
   ```
   https://maps.googleapis.com/maps/api/geocode/json?address=Paris&key=YOUR_API_KEY
   ```

2. **בדוק Gemini API:**
   ```bash
   curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY"
   ```

אם קיבלת תשובה - הכל עובד! ✅

---

## 🔐 אבטחה חשובה!

⚠️ **לעולם אל תשתף את ה-API Keys שלך!**
⚠️ **אל תעלה אותם ל-GitHub או קבצים ציבוריים!**
⚠️ **השתמש ב-Environment Variables או הגדרות מקומיות בלבד!**

---

## 🆘 פתרון בעיות

### "This API key is not valid"
→ וודא שהפעלת את ה-API הספציפי שאתה משתמש בו

### "API key not authorized"
→ בדוק ש-HTTP referrer כולל את הדומיין שלך

### "Quota exceeded"
→ הגעת למכסה היומית, חכה 24 שעות או שדרג לחשבון בתשלום

### "Billing not enabled"
→ צריך להפעיל Billing גם עם התכנית החינמית!

---

## 📞 עזרה נוספת

- [Google Maps Documentation](https://developers.google.com/maps/documentation)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Pricing Calculator](https://cloud.google.com/products/calculator)

---

**💡 טיפ:** שמור את ה-API Keys שלך ב-Password Manager בטוח!
