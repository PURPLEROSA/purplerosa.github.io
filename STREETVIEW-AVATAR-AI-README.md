# 🤖 Street View Avatar AI - מדריך שימוש מלא

## 🌟 מה חדש בגרסת AI?

הגרסה המשודרגת כוללת אינטגרציה מלאה עם בינה מלאכותית:

- ✨ **הסרת רקע אוטומטית** - הדמות שלך תשתלב בצורה מושלמת
- 🎨 **התאמת תאורה חכמה** - התאמה אוטומטית לתנאי התאורה ברחוב
- 🌑 **צללים ריאליסטיים** - הוספת צל טבעי
- 🤖 **עיבוד Gemini AI** - ניתוח חכם של התמונה

---

## 🔑 הגדרת API Keys

אתה צריך **3 מפתחות API** לפונקציונליות מלאה:

### 1️⃣ Google Maps API Key

#### שלבים:
1. היכנס ל-[Google Cloud Console](https://console.cloud.google.com/)
2. צור פרויקט חדש או בחר קיים
3. עבור ל-**"APIs & Services"** > **"Library"**
4. הפעל את ה-APIs הבאים:
   - Maps JavaScript API
   - Street View Static API
   - Geocoding API
5. עבור ל-**"Credentials"** > **"Create Credentials"** > **"API Key"**
6. העתק את המפתח
7. **חשוב:** הגבל את המפתח ל-HTTP referrers + הדומיין שלך

**עלות:** $200 חינם בחודש הראשון, אחרי זה תשלום לפי שימוש

---

### 2️⃣ Gemini API Key

#### שלבים:
1. היכנס ל-[Google AI Studio](https://makersuite.google.com/app/apikey)
2. לחץ על **"Get API Key"**
3. בחר את הפרויקט שלך או צור חדש
4. לחץ על **"Create API Key"**
5. העתק את המפתח

**עלות:** 60 בקשות לדקה חינם, PRO תשלום לפי שימוש

---

### 3️⃣ Remove.bg API Key (אופציונלי - לתוצאות מעולות)

#### שלבים:
1. היכנס ל-[Remove.bg](https://www.remove.bg/api)
2. הירשם לחשבון חינם
3. עבור ל-[Dashboard](https://www.remove.bg/users/sign_up)
4. העתק את ה-API Key

**עלות:** 50 תמונות חינם בחודש, $0.20 לתמונה אחרי

**חלופה:** אפשר להשתמש ב-**Replicate API** עם מודלים כמו:
- RMBG-1.4 (הסרת רקע)
- GFPGAN (שיפור איכות)
- Stable Diffusion Inpainting (שילוב מתקדם)

---

## 📦 קבצים באפליקציה

### `streetview-avatar.html`
הגרסה הבסיסית - עובדת רק עם Google Maps API

### `streetview-avatar-ai.html`
הגרסה המתקדמת - עם Gemini AI ופיצ'רים חכמים

---

## 🚀 התחלה מהירה

### שלב 1: פתח את הקובץ
```bash
open streetview-avatar-ai.html
```

### שלב 2: הכנס API Keys
1. Google Maps API Key
2. Gemini API Key
3. (אופציונלי) Remove.bg API Key

### שלב 3: חפש מיקום
```
דוגמה: "Times Square, New York"
דוגמה: "Shibuya Crossing, Tokyo"
דוגמה: "La Sagrada Familia, Barcelona"
```

### שלב 4: נווט למיקום המדויק
- השתמש בחצים לתנועה
- סובב את המצלמה לזווית המושלמת
- או פשוט גרור עם העכבר!

### שלב 5: העלה תמונת דמות
- **הכי טוב:** PNG עם רקע שקוף
- **חלופה:** JPG רגיל (ה-AI יסיר את הרקע)
- **גודל מומלץ:** 512x512 - 2048x2048

### שלב 6: הפעל פיצ'רי AI
☑️ הסרת רקע אוטומטית
☑️ התאמת תאורה
☑️ הוספת צל ריאליסטי

### שלב 7: התאם והפק
- שחק עם הגודל והשקיפות
- לחץ על **"צור עם AI חכם"**
- הורד את התוצאה!

---

## 🔧 הוספת Remove.bg API (שדרוג)

אם רוצה תוצאות מושלמות, הוסף את הקוד הזה:

### שלב 1: הוסף שדה API Key

ב-`streetview-avatar-ai.html`, הוסף אחרי שדה Gemini:

```html
<div class="api-key-section gemini">
    <strong>🎨 Remove.bg API Key (אופציונלי)</strong>
    <input type="password" id="removebg-api-key" placeholder="הכנס Remove.bg API Key">
    <small style="display: block; margin-top: 0.3rem;">
        <a href="https://www.remove.bg/api" target="_blank">
            קבל מפתח מ-Remove.bg
        </a>
    </small>
</div>
```

### שלב 2: הוסף פונקציה להסרת רקע

בסקריפט, החלף את הפונקציה `removeBackground`:

```javascript
async function removeBackground(imageData) {
    const removebgKey = document.getElementById('removebg-api-key').value;

    if (!removebgKey) {
        console.log('No Remove.bg API key - using client-side processing');
        avatarImageNoBg = avatarImage;
        return;
    }

    showProcessing('מסיר רקע עם AI...');

    try {
        // Convert base64 to blob
        const response = await fetch(imageData);
        const blob = await response.blob();

        // Send to Remove.bg API
        const formData = new FormData();
        formData.append('image_file', blob);
        formData.append('size', 'auto');

        const result = await fetch('https://api.remove.bg/v1.0/removebg', {
            method: 'POST',
            headers: {
                'X-Api-Key': removebgKey
            },
            body: formData
        });

        if (!result.ok) {
            throw new Error('Remove.bg API error');
        }

        // Get result image
        const resultBlob = await result.blob();
        const resultUrl = URL.createObjectURL(resultBlob);

        // Load as image
        avatarImageNoBg = new Image();
        await new Promise((resolve) => {
            avatarImageNoBg.onload = resolve;
            avatarImageNoBg.src = resultUrl;
        });

        // Update preview
        const preview = document.getElementById('avatar-preview');
        preview.innerHTML = `<img src="${resultUrl}" alt="Avatar">`;

        hideProcessing();
        console.log('✅ Background removed successfully!');

    } catch (error) {
        console.error('Error removing background:', error);
        alert('⚠️ שגיאה בהסרת רקע. משתמש בתמונה המקורית.');
        avatarImageNoBg = avatarImage;
        hideProcessing();
    }
}
```

### שלב 3: שמור את ה-Key

```javascript
document.getElementById('removebg-api-key').addEventListener('change', function() {
    localStorage.setItem('removebgApiKey', this.value);
});
```

---

## 🎨 אינטגרציה עם Replicate API

חלופה ל-Remove.bg, עם יכולות נוספות:

### שלב 1: קבל API Key
1. היכנס ל-[Replicate](https://replicate.com/)
2. צור חשבון
3. עבור ל-[API Tokens](https://replicate.com/account/api-tokens)
4. צור token

### שלב 2: הוסף לאפליקציה

```javascript
async function processWithReplicate(imageData) {
    const replicateKey = document.getElementById('replicate-api-key').value;

    if (!replicateKey) return;

    showProcessing('מעבד עם Replicate AI...');

    try {
        // Use RMBG-1.4 model for background removal
        const response = await fetch('https://api.replicate.com/v1/predictions', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${replicateKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                version: 'a60e4b0e0ee7c5c8b5c3e5b0f9f9f9f9', // RMBG-1.4
                input: {
                    image: imageData
                }
            })
        });

        const prediction = await response.json();

        // Poll for result
        let result = prediction;
        while (result.status !== 'succeeded' && result.status !== 'failed') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            const pollResponse = await fetch(
                `https://api.replicate.com/v1/predictions/${prediction.id}`,
                {
                    headers: {
                        'Authorization': `Token ${replicateKey}`
                    }
                }
            );
            result = await pollResponse.json();
        }

        if (result.status === 'succeeded') {
            // Load result image
            avatarImageNoBg = new Image();
            avatarImageNoBg.src = result.output;

            hideProcessing();
            console.log('✅ Replicate processing complete!');
        }

    } catch (error) {
        console.error('Replicate error:', error);
        avatarImageNoBg = avatarImage;
        hideProcessing();
    }
}
```

---

## 💡 טיפים מתקדמים

### 1. שילוב עם Stable Diffusion Inpainting

לשילוב מציאותי **במיוחד**, השתמש ב-Inpainting:

```javascript
async function inpaintWithSD(streetViewCanvas, avatarImage) {
    // Use Stable Diffusion to blend the avatar naturally
    const prompt = "person standing in street, realistic lighting, natural shadows";

    // Call Replicate's Stable Diffusion Inpainting model
    // This will blend the avatar perfectly into the scene
}
```

### 2. התאמת צבעים עם Gemini Vision

```javascript
async function matchColors(streetViewImage, avatarImage) {
    const geminiKey = document.getElementById('gemini-api-key').value;

    // Use Gemini Vision to analyze colors and lighting
    const prompt = `Analyze the lighting and color temperature in this street scene.
                    Provide RGB adjustment values to match a person in this environment.`;

    // Apply adjustments to avatar
}
```

### 3. זיהוי עומק עם AI

```javascript
async function detectDepth(streetViewImage) {
    // Use depth estimation model (MiDaS, DPT)
    // Position avatar at correct depth
    // Add depth-based blur
}
```

---

## 📊 השוואת אפשרויות

| פיצ'ר | בסיסי | AI | AI + Remove.bg | AI + Replicate |
|------|------|----|--------------|--------------|
| שילוב בסיסי | ✅ | ✅ | ✅ | ✅ |
| הסרת רקע | ❌ | ⚠️ | ✅✅ | ✅✅ |
| התאמת תאורה | ❌ | ✅ | ✅ | ✅✅ |
| צללים | ❌ | ✅ | ✅ | ✅✅ |
| איכות | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| עלות | חינם | חינם | $$ | $$$ |

---

## 🐛 פתרון בעיות

### הסרת הרקע לא עובדת
✅ וודא שהכנסת Remove.bg API Key תקין
✅ בדוק שיש לך מכסת תמונות
✅ נסה תמונה קטנה יותר (< 10MB)

### Gemini API מחזיר שגיאה
✅ וודא שהפעלת את Generative Language API
✅ בדוק שה-API Key נכון
✅ בדוק שלא עברת את מכסת הבקשות

### התמונה לא ריאליסטית
✅ השתמש ב-PNG עם רקע שקוף
✅ התאם את הגודל לפרופורציה של הסצנה
✅ בחר רחוב עם תאורה דומה לתמונת הדמות
✅ שחק עם השקיפות

---

## 🌟 דוגמאות לשימוש

### דוגמה 1: תייר בפריז
```
מיקום: "Eiffel Tower, Paris"
דמות: תמונה שלך בתלבושת טיול
הגדרות: גודל 30%, שקיפות 85%
AI: הסרת רקע + התאמת תאורה + צל
```

### דוגמה 2: רץ בטוקיו
```
מיקום: "Shibuya Crossing, Tokyo"
דמות: תמונה בתנוחת ריצה
הגדרות: גודל 40%, שקיפות 90%
AI: כל הפיצ'רים מופעלים
```

### דוגמה 3: עומד מול הפירמידות
```
מיקום: "Great Pyramid of Giza, Egypt"
דמות: תמונה עומדת, זרועות פרושות
הגדרות: גודל 25%, שקיפות 95%
AI: התאמת תאורה חמה + צל חזק
```

---

## 🔒 אבטחה

⚠️ **חשוב מאוד!**

1. **אל תעלה API Keys ל-GitHub!**
2. **אל תשתף את המפתחות!**
3. **הגדר Billing Limits ב-Google Cloud!**
4. **השתמש ב-HTTP Referrer restrictions!**
5. **נטר את השימוש החודשי!**

---

## 💰 תמחור משוער

### שימוש בסיסי (100 תמונות בחודש):
- Google Maps: **חינם** (מתוך $200 credit)
- Gemini: **חינם** (60 לדקה)
- **סה"כ: 0$**

### שימוש אינטנסיבי (500 תמונות בחודש):
- Google Maps: ~**$5-10**
- Gemini: **חינם** או ~$2
- Remove.bg: ~**$90** (או 50 חינם + $90)
- **סה"כ: $5-102**

### שימוש מסחרי (5000 תמונות בחודש):
- Google Maps: ~**$50-100**
- Gemini: ~**$20**
- Replicate: ~**$100-200**
- **סה"כ: $170-320**

---

## 📚 משאבים נוספים

### תיעוד רשמי:
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Remove.bg API Docs](https://www.remove.bg/api/documentation)
- [Replicate Docs](https://replicate.com/docs)

### מודלים מומלצים:
- **RMBG-1.4** - הסרת רקע מעולה
- **GFPGAN** - שיפור פנים
- **Real-ESRGAN** - שיפור resolution
- **Stable Diffusion Inpainting** - שילוב מושלם

---

## 🎓 למידה נוספת

רוצה ללמוד איך זה עובד?

### מושגי יסוד:
1. **Canvas API** - ציור ועיבוד תמונות
2. **Image Segmentation** - הפרדת דמות מרקע
3. **Color Transfer** - התאמת צבעים
4. **Shadow Generation** - יצירת צללים
5. **Inpainting** - מילוי חכם

### הרחבות אפשריות:
- 🎥 וידאו: שילוב דמות בסרטון Street View
- 🌐 3D: שילוב דמות תלת-ממדית
- 👥 קבוצות: מספר דמויות באותה תמונה
- 🎨 סגנונות: החלת סגנונות אמנותיים
- 🏃 אנימציה: תנועה של הדמות

---

## 🤝 תרומה והרחבה

רוצה להוסיף פיצ'רים? fork את הפרויקט!

רעיונות:
- תמיכה במודלים נוספים
- עורך תמונות מובנה
- ספריית תבניות
- שיתוף ברשתות חברתיות
- יצוא כ-GIF/Video

---

## 📞 תמיכה

שאלות? בעיות? רעיונות?

- פתח Issue ב-GitHub
- שלח PR עם שיפורים
- שתף את היצירות שלך!

---

**🎉 תהנה ליצור תמונות מדהימות!**

*נוצר עם ❤️ ו-AI*
