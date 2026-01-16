/**
 * ===========================================
 * EMMA ANALYTICS - Google Apps Script
 * ===========================================
 *
 * הוראות התקנה:
 * 1. צרי Google Sheet חדש
 * 2. לכי ל Extensions > Apps Script
 * 3. העתיקי את כל הקוד הזה
 * 4. שמרי והריצי את הפונקציה setupSheets() פעם אחת
 * 5. הגדירי Trigger יומי לפונקציה dailyUpdate()
 * 6. פרסמי כ-Web App (Deploy > New Deployment > Web App)
 *
 * ===========================================
 */

// ============ הגדרות ============
const CONFIG = {
  // הגדירי כאן את היוצרים שרוצים לעקוב אחריהם
  CREATORS: [
    { name: 'עדי עייש', handle: 'adi_ayash', platform: 'instagram', category: 'לייפסטייל' },
    { name: 'נדיר אליהו', handle: 'nadir_eliahu', platform: 'instagram', category: 'בידור' },
    { name: 'ליאל אלי', handle: 'liel.eli', platform: 'instagram', category: 'אופנה' },
    { name: 'מאיה ורטהיימר', handle: 'mayawertheimer', platform: 'instagram', category: 'יופי' },
    { name: 'קובי אדרי', handle: 'kobi_adri', platform: 'tiktok', category: 'קומדיה' },
    { name: 'דניאל עמית', handle: 'danielamit', platform: 'instagram', category: 'לייפסטייל' },
    { name: 'רותם סלע', handle: 'rikiinnewyork', platform: 'instagram', category: 'אופנה' },
    // הוסיפי עוד יוצרים כאן...
  ],

  // שמות הגליונות
  SHEETS: {
    CREATORS: 'Creators',
    DAILY_STATS: 'DailyStats',
    POSTS: 'Posts',
    LOGS: 'Logs'
  }
};

// ============ הגדרת הגליונות ============

/**
 * יוצר את כל הגליונות והכותרות - להריץ פעם אחת!
 */
function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Creators Sheet
  let creatorsSheet = ss.getSheetByName(CONFIG.SHEETS.CREATORS);
  if (!creatorsSheet) {
    creatorsSheet = ss.insertSheet(CONFIG.SHEETS.CREATORS);
  }
  creatorsSheet.getRange('A1:F1').setValues([['id', 'name', 'handle', 'platform', 'category', 'isActive']]);
  creatorsSheet.getRange('A1:F1').setFontWeight('bold').setBackground('#8B5CF6').setFontColor('white');

  // הכנסת היוצרים מההגדרות
  CONFIG.CREATORS.forEach((creator, index) => {
    const row = index + 2;
    creatorsSheet.getRange(row, 1, 1, 6).setValues([[
      'creator_' + (index + 1),
      creator.name,
      creator.handle,
      creator.platform,
      creator.category,
      true
    ]]);
  });

  // DailyStats Sheet
  let statsSheet = ss.getSheetByName(CONFIG.SHEETS.DAILY_STATS);
  if (!statsSheet) {
    statsSheet = ss.insertSheet(CONFIG.SHEETS.DAILY_STATS);
  }
  statsSheet.getRange('A1:G1').setValues([['id', 'creatorId', 'date', 'followersCount', 'postsCount', 'viewsToday', 'likesToday']]);
  statsSheet.getRange('A1:G1').setFontWeight('bold').setBackground('#EC4899').setFontColor('white');

  // Posts Sheet
  let postsSheet = ss.getSheetByName(CONFIG.SHEETS.POSTS);
  if (!postsSheet) {
    postsSheet = ss.insertSheet(CONFIG.SHEETS.POSTS);
  }
  postsSheet.getRange('A1:I1').setValues([['id', 'creatorId', 'date', 'platformPostId', 'url', 'caption', 'views', 'likes', 'comments']]);
  postsSheet.getRange('A1:I1').setFontWeight('bold').setBackground('#10B981').setFontColor('white');

  // Logs Sheet
  let logsSheet = ss.getSheetByName(CONFIG.SHEETS.LOGS);
  if (!logsSheet) {
    logsSheet = ss.insertSheet(CONFIG.SHEETS.LOGS);
  }
  logsSheet.getRange('A1:C1').setValues([['timestamp', 'action', 'details']]);
  logsSheet.getRange('A1:C1').setFontWeight('bold').setBackground('#F59E0B').setFontColor('white');

  // מחיקת Sheet1 אם קיים
  const sheet1 = ss.getSheetByName('Sheet1');
  if (sheet1) {
    ss.deleteSheet(sheet1);
  }

  log('setupSheets', 'הגליונות נוצרו בהצלחה');
  SpreadsheetApp.getUi().alert('המערכת הוגדרה בהצלחה! ✅');
}

// ============ פונקציות עזר ============

function log(action, details) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const logsSheet = ss.getSheetByName(CONFIG.SHEETS.LOGS);
  if (logsSheet) {
    logsSheet.appendRow([new Date().toISOString(), action, details]);
  }
}

function generateId() {
  return Utilities.getUuid().substring(0, 8);
}

function getTodayDate() {
  return Utilities.formatDate(new Date(), 'Asia/Jerusalem', 'yyyy-MM-dd');
}

// ============ איסוף נתונים מאינסטגרם ============

/**
 * מושך נתונים מפרופיל אינסטגרם ציבורי
 * שימוש: getInstagramData('username')
 */
function getInstagramData(username) {
  try {
    // שיטה 1: דרך ה-web profile (עובד לפרופילים ציבוריים)
    const url = `https://www.instagram.com/${username}/?__a=1&__d=dis`;

    const options = {
      'method': 'get',
      'headers': {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      'muteHttpExceptions': true
    };

    const response = UrlFetchApp.fetch(url, options);
    const statusCode = response.getResponseCode();

    if (statusCode === 200) {
      const content = response.getContentText();

      // ניסיון לפרסר JSON
      try {
        const data = JSON.parse(content);
        if (data.graphql && data.graphql.user) {
          const user = data.graphql.user;
          return {
            success: true,
            username: user.username,
            fullName: user.full_name,
            followers: user.edge_followed_by.count,
            following: user.edge_follow.count,
            posts: user.edge_owner_to_timeline_media.count,
            isPrivate: user.is_private,
            bio: user.biography
          };
        }
      } catch (e) {
        // אם JSON לא עובד, ננסה regex על ה-HTML
        return parseInstagramHTML(content, username);
      }
    }

    // שיטה 2: דרך HTML parsing
    const htmlUrl = `https://www.instagram.com/${username}/`;
    const htmlResponse = UrlFetchApp.fetch(htmlUrl, options);

    if (htmlResponse.getResponseCode() === 200) {
      return parseInstagramHTML(htmlResponse.getContentText(), username);
    }

    return { success: false, error: 'Could not fetch data', statusCode: statusCode };

  } catch (error) {
    log('getInstagramData', `Error for ${username}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * מפרסר HTML של אינסטגרם לחילוץ נתונים
 */
function parseInstagramHTML(html, username) {
  try {
    // חיפוש הנתונים ב-meta tags או בסקריפטים

    // חיפוש followers במטא
    const followersMatch = html.match(/\"edge_followed_by\":\{\"count\":(\d+)\}/);
    const postsMatch = html.match(/\"edge_owner_to_timeline_media\":\{\"count\":(\d+)/);
    const followingMatch = html.match(/\"edge_follow\":\{\"count\":(\d+)\}/);

    // חיפוש במטא description
    const metaMatch = html.match(/<meta[^>]*content="([^"]*Followers[^"]*)"[^>]*>/i);

    if (followersMatch || metaMatch) {
      let followers = 0;
      let posts = 0;

      if (followersMatch) {
        followers = parseInt(followersMatch[1]);
      } else if (metaMatch) {
        // פרסור מהמטא: "1.5M Followers, 500 Following, 200 Posts"
        const metaText = metaMatch[1];
        const followersPart = metaText.match(/([\d,.]+[KMB]?)\s*Followers/i);
        if (followersPart) {
          followers = parseMetricNumber(followersPart[1]);
        }
      }

      if (postsMatch) {
        posts = parseInt(postsMatch[1]);
      }

      return {
        success: true,
        username: username,
        followers: followers,
        posts: posts,
        following: followingMatch ? parseInt(followingMatch[1]) : 0,
        source: 'html_parse'
      };
    }

    return { success: false, error: 'Could not parse HTML' };

  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * ממיר מספרים כמו 1.5K, 2.3M למספרים רגילים
 */
function parseMetricNumber(str) {
  if (!str) return 0;
  str = str.replace(/,/g, '');

  const multipliers = {
    'K': 1000,
    'M': 1000000,
    'B': 1000000000
  };

  const match = str.match(/([\d.]+)([KMB])?/i);
  if (match) {
    let num = parseFloat(match[1]);
    if (match[2]) {
      num *= multipliers[match[2].toUpperCase()];
    }
    return Math.round(num);
  }

  return parseInt(str) || 0;
}

// ============ איסוף נתונים מטיקטוק ============

/**
 * מושך נתונים מפרופיל טיקטוק ציבורי
 */
function getTikTokData(username) {
  try {
    const url = `https://www.tiktok.com/@${username}`;

    const options = {
      'method': 'get',
      'headers': {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      'muteHttpExceptions': true
    };

    const response = UrlFetchApp.fetch(url, options);
    const html = response.getContentText();

    // חיפוש נתונים ב-JSON שמוטמע בעמוד
    const jsonMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([^<]+)<\/script>/);

    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[1]);
        const userInfo = data?.['__DEFAULT_SCOPE__']?.['webapp.user-detail']?.userInfo;

        if (userInfo) {
          return {
            success: true,
            username: userInfo.user.uniqueId,
            nickname: userInfo.user.nickname,
            followers: userInfo.stats.followerCount,
            following: userInfo.stats.followingCount,
            likes: userInfo.stats.heart,
            videos: userInfo.stats.videoCount
          };
        }
      } catch (e) {
        // ננסה regex
      }
    }

    // Fallback: regex
    const followersMatch = html.match(/"followerCount":(\d+)/);
    const likesMatch = html.match(/"heartCount":(\d+)/);
    const videoMatch = html.match(/"videoCount":(\d+)/);

    if (followersMatch) {
      return {
        success: true,
        username: username,
        followers: parseInt(followersMatch[1]),
        likes: likesMatch ? parseInt(likesMatch[1]) : 0,
        videos: videoMatch ? parseInt(videoMatch[1]) : 0,
        source: 'regex'
      };
    }

    return { success: false, error: 'Could not parse TikTok data' };

  } catch (error) {
    log('getTikTokData', `Error for ${username}: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// ============ עדכון יומי ============

/**
 * הפונקציה הראשית - להפעיל כל יום!
 * הגדירי Trigger: Edit > Current project's triggers > Add Trigger
 * בחרי: dailyUpdate, Time-driven, Day timer, בחרי שעה
 */
function dailyUpdate() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const creatorsSheet = ss.getSheetByName(CONFIG.SHEETS.CREATORS);
  const statsSheet = ss.getSheetByName(CONFIG.SHEETS.DAILY_STATS);

  if (!creatorsSheet || !statsSheet) {
    log('dailyUpdate', 'Error: Sheets not found. Run setupSheets() first.');
    return;
  }

  const creators = getCreatorsFromSheet();
  const today = getTodayDate();
  let successCount = 0;
  let errorCount = 0;

  creators.forEach(creator => {
    if (!creator.isActive) return;

    // השהיה בין בקשות למניעת חסימה
    Utilities.sleep(2000 + Math.random() * 3000);

    let data;
    if (creator.platform === 'instagram') {
      data = getInstagramData(creator.handle);
    } else if (creator.platform === 'tiktok') {
      data = getTikTokData(creator.handle);
    }

    if (data && data.success) {
      // הוספת שורה לסטטיסטיקות
      statsSheet.appendRow([
        generateId(),
        creator.id,
        today,
        data.followers || 0,
        data.posts || data.videos || 0,
        0, // viewsToday - לא זמין ב-scraping בסיסי
        data.likes || 0
      ]);
      successCount++;
      log('dailyUpdate', `Success: ${creator.name} - ${data.followers} followers`);
    } else {
      errorCount++;
      log('dailyUpdate', `Failed: ${creator.name} - ${data?.error || 'Unknown error'}`);
    }
  });

  log('dailyUpdate', `Completed: ${successCount} success, ${errorCount} errors`);
}

/**
 * קורא את רשימת היוצרים מהגליון
 */
function getCreatorsFromSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.CREATORS);
  const data = sheet.getDataRange().getValues();

  // דילוג על שורת הכותרות
  const creators = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) { // יש ID
      creators.push({
        id: data[i][0],
        name: data[i][1],
        handle: data[i][2],
        platform: data[i][3],
        category: data[i][4],
        isActive: data[i][5] === true || data[i][5] === 'TRUE'
      });
    }
  }

  return creators;
}

// ============ API לדשבורד ============

/**
 * Web App endpoint - מחזיר JSON לדשבורד
 * אחרי Deploy as Web App, תקבלי URL כזה:
 * https://script.google.com/macros/s/xxx/exec
 */
function doGet(e) {
  const action = e?.parameter?.action || 'all';

  let result;

  switch (action) {
    case 'creators':
      result = getCreatorsData();
      break;
    case 'stats':
      result = getStatsData();
      break;
    case 'posts':
      result = getPostsData();
      break;
    case 'all':
    default:
      result = {
        creators: getCreatorsData(),
        dailyStats: getStatsData(),
        posts: getPostsData(),
        lastUpdate: new Date().toISOString()
      };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getCreatorsData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.CREATORS);
  const data = sheet.getDataRange().getValues();

  const creators = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      creators.push({
        id: data[i][0],
        name: data[i][1],
        handle: data[i][2],
        platform: data[i][3],
        category: data[i][4],
        isActive: data[i][5] === true || data[i][5] === 'TRUE'
      });
    }
  }

  return creators;
}

function getStatsData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.DAILY_STATS);
  const data = sheet.getDataRange().getValues();

  const stats = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      stats.push({
        id: data[i][0],
        creatorId: data[i][1],
        date: data[i][2],
        followersCount: data[i][3],
        postsCount: data[i][4],
        viewsToday: data[i][5],
        likesToday: data[i][6]
      });
    }
  }

  return stats;
}

function getPostsData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.POSTS);
  const data = sheet.getDataRange().getValues();

  const posts = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) {
      posts.push({
        id: data[i][0],
        creatorId: data[i][1],
        date: data[i][2],
        platformPostId: data[i][3],
        url: data[i][4],
        caption: data[i][5],
        views: data[i][6],
        likes: data[i][7],
        comments: data[i][8]
      });
    }
  }

  return posts;
}

// ============ פונקציות עזר נוספות ============

/**
 * הוספת יוצר חדש
 */
function addCreator(name, handle, platform, category) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.CREATORS);

  sheet.appendRow([
    'creator_' + generateId(),
    name,
    handle,
    platform,
    category || '',
    true
  ]);

  log('addCreator', `Added: ${name} (${handle})`);
}

/**
 * הוספת פוסט ידנית
 */
function addPost(creatorId, url, caption, views, likes, comments) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.POSTS);

  sheet.appendRow([
    generateId(),
    creatorId,
    getTodayDate(),
    '', // platformPostId
    url,
    caption,
    views || 0,
    likes || 0,
    comments || 0
  ]);

  log('addPost', `Added post for ${creatorId}`);
}

/**
 * בדיקה ידנית של יוצר
 * שימוש: testCreator('username', 'instagram')
 */
function testCreator(handle, platform) {
  let data;
  if (platform === 'instagram') {
    data = getInstagramData(handle);
  } else if (platform === 'tiktok') {
    data = getTikTokData(handle);
  }

  Logger.log(JSON.stringify(data, null, 2));
  return data;
}

// ============ תפריט מותאם ============

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🤖 Emma Analytics')
    .addItem('⚙️ הגדרה ראשונית', 'setupSheets')
    .addItem('🔄 עדכון יומי עכשיו', 'dailyUpdate')
    .addSeparator()
    .addItem('🧪 בדיקת חיבור', 'testConnection')
    .addItem('📊 צפה בלוגים', 'showLogs')
    .addToUi();
}

function testConnection() {
  const data = getInstagramData('instagram');
  if (data.success) {
    SpreadsheetApp.getUi().alert('✅ החיבור תקין!\n\nInstagram official account:\n' + data.followers + ' followers');
  } else {
    SpreadsheetApp.getUi().alert('❌ בעיה בחיבור\n\n' + data.error);
  }
}

function showLogs() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const logsSheet = ss.getSheetByName(CONFIG.SHEETS.LOGS);
  ss.setActiveSheet(logsSheet);
}
