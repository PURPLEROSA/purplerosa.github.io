# AI.GOS Opportunity OS

**Your ruthless-but-useful personal opportunity manager.**

מנהלת ההזדמנויות האישית שלך. קשוחה, חכמה, ולא נותנת לכסף להירקב בג׳ימייל.

זו לא מערכת CRM כבדה. זו מערכת אישית שמנהלת עבורך הזדמנויות עסקיות, פניות,
לקוחות, הרצאות, סדנאות, שיתופי פעולה, הצעות מחיר, תזכורות ופולואפים — ומדברת
אלייך כמו מנהלת אישית חדה וישירה.

---

## הרצה מהירה (במחשב שלך)

צריך שיהיה מותקן [Node.js](https://nodejs.org) (גרסה 18 ומעלה).

1. פותחים חלון טרמינל בתיקייה הזו (`aigos-opportunity-os`).
2. מתקינים את הרכיבים — פעם אחת בלבד:

   ```bash
   npm install
   ```

3. מריצים את האפליקציה:

   ```bash
   npm run dev
   ```

4. פותחים בדפדפן את הכתובת: **http://localhost:3000**

זהו. המערכת עולה ישר במצב דמו — כל המסכים, הכפתורים וההיגיון עובדים, בלי
צורך להתחבר לשום דבר.

---

## מצב דמו (Demo Mode)

המערכת מגיעה עם מצב דמו **פעיל כברירת מחדל**. במצב הזה:

- כל הנתונים הם נתוני דוגמה ששמורים בתיקייה `data/`.
- שום מידע לא יוצא מהמחשב שלך.
- אפשר להוסיף פולואפים, לרשום מחירים, לדחות, לסמן כחם — והכל עובד
  (השינויים נשמרים לזמן הגלישה הנוכחית בלבד).
- אף מייל לא נשלח, אף אירוע יומן לא נוצר.

מצב הדמו נשלט על ידי המשתנה `NEXT_PUBLIC_DEMO_MODE` בקובץ `.env.local`.
כל עוד הוא לא כבוי במפורש — המערכת לא תיגע ב-Google.

---

## חיבור ל-Google Workspace (שלב 2)

כשמוכנים לחבר חשבון אמיתי:

1. מעתיקים את הקובץ `.env.example` לקובץ חדש בשם `.env.local`.
2. נכנסים ל-[Google Cloud Console](https://console.cloud.google.com),
   יוצרים פרויקט, ומפעילים את ה-APIs: Gmail, Google Sheets, Google Calendar.
3. תחת **APIs & Services → Credentials** יוצרים **OAuth Client ID**
   מסוג *Web application*, ומגדירים Redirect URI:
   `http://localhost:3000/api/auth/google/callback`
4. מעתיקים את ה-Client ID וה-Client Secret לתוך `.env.local`.
5. יוצרים Google Sheet ריק, ומעתיקים את ה-ID שלו (החלק הארוך מתוך כתובת
   הגיליון) לתוך `GOOGLE_SHEETS_SPREADSHEET_ID`.
6. משנים בקובץ `.env.local` את השורה ל-`NEXT_PUBLIC_DEMO_MODE=false`.
7. מפעילים מחדש את המערכת ונכנסים למסך **חיבור Google**.

מסמכים רשמיים:

- OAuth לאפליקציות שרת: https://developers.google.com/identity/protocols/oauth2/web-server
- מסך הסכמה והרשאות: https://developers.google.com/workspace/guides/configure-oauth-consent
- Gmail API: https://developers.google.com/workspace/gmail/api/guides
- יצירת טיוטה ב-Gmail: https://developers.google.com/workspace/gmail/api/reference/rest/v1/users.drafts/create
- Google Calendar API: https://developers.google.com/workspace/calendar/api/guides/overview
- Google Sheets API: https://developers.google.com/workspace/sheets/api/guides/concepts

### ההרשאות (Scopes) שהמערכת מבקשת

המערכת מבקשת את ההרשאות **המצומצמות ביותר** שמאפשרות לה לעבוד:

| Scope | למה |
|---|---|
| `gmail.readonly` | קריאת מיילים כדי לזהות פניות והזדמנויות. קריאה בלבד. |
| `gmail.compose` | יצירת **טיוטות** מייל בלבד. המערכת לא יכולה לשלוח. |
| `spreadsheets` | שמירה וקריאה של הנתונים ב-Google Sheets. |
| `calendar.events` | יצירת תזכורות פולואפ ביומן — רק אחרי אישור. |
| `userinfo.email` | זיהוי החשבון המחובר. |

> חשוב: לפני יישום אמיתי כדאי לוודא מול התיעוד הרשמי שאלה ה-scopes
> העדכניים והמצומצמים ביותר לצורך.

---

## מה כבר מיושם (שלב 1 — MVP)

- ✅ אפליקציית Next.js מלאה עם 8 מסכים: דשבורד, תיבת הזדמנויות, פרופיל
  איש קשר, ראדאר פולואפים, זיכרון מחירים, מחולל הזדמנויות, הגדרות, וחיבור Google.
- ✅ מצב דמו מלא עם נתוני דוגמה (מיילים, הזדמנויות, אנשי קשר, מחירים,
  פולואפים, תובנות AI).
- ✅ שכבת AI (`lib/aiService.ts`) — סיווג מיילים, הצעות יזומות, טיוטות
  מייל, ואזהרות תמחור. כל פלט מפריד בין **עובדות / הנחות / פעולה מוצעת**.
- ✅ פעולות אינטראקטיביות: הוספת פולואפ, רישום מחיר, סימון כחם, דחייה,
  סגירה — עם זיכרון לאורך הגלישה.
- ✅ כל פעולה רגישה (טיוטה, אירוע יומן) עוברת דרך חלון אישור. אין שליחה
  אוטומטית. אין יצירת אירועים אוטומטית.
- ✅ קובצי שירות מוכנים ל-Gmail, Sheets ו-Calendar (`lib/*Service.ts`).
- ✅ מחולל סכמת Google Sheets — 6 טאבים (`lib/sheetsSchema.ts`).
- ✅ מבנה OAuth ו-API routes מוכנים.
- ✅ עיצוב כהה-פרימיום, רספונסיבי, בעברית (RTL).

## מה נשאר לשלב 2

- חיבור OAuth אמיתי וקריאת שרשורי Gmail אמיתיים.
- שמירה אמיתית של ההזדמנויות והמחירים ל-Google Sheets.
- יצירת טיוטות Gmail אמיתיות (אחרי אישור).
- יצירת תזכורות Calendar אמיתיות (אחרי אישור).
- חיבור מנוע AI אמיתי (Gemini / Claude) במקום הסיווג מבוסס-הכללים.

---

## מבנה הפרויקט

```
app/            המסכים ונתיבי ה-API
components/     רכיבי הממשק
lib/            הלוגיקה: טיפוסים, שירותי Google, שכבת AI, נתוני דמו
data/           נתוני הדמו (JSON)
```

הנתונים נשמרים ב-Google Sheets (בשלב 2). בשלב 1 הם נטענים מתוך `data/`.
אפשר בעתיד להחליף ל-PostgreSQL / Supabase — אבל לא נדרש כרגע.

---

## פקודות

| פקודה | מה היא עושה |
|---|---|
| `npm run dev` | הרצת המערכת לפיתוח (http://localhost:3000) |
| `npm run build` | בניית גרסה לפרודקשן |
| `npm run start` | הרצת הגרסה שנבנתה |

---

Made with care for **Shelly Or Gisser** · AI.GOS
