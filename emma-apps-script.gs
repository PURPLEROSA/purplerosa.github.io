// ===========================================
// EMMA ANALYTICS - Google Apps Script
// ===========================================
//
// הוראות התקנה:
// 1. צרי Google Sheet חדש
// 2. לכי ל Extensions > Apps Script
// 3. העתיקי את כל הקוד הזה
// 4. שמרי והריצי את הפונקציה setupSheets() פעם אחת
// 5. הגדירי Trigger יומי לפונקציה dailyUpdate()
// 6. פרסמי כ-Web App (Deploy > New Deployment > Web App)
//
// ===========================================

// ============ הגדרות ============
var CONFIG = {
  // הגדירי כאן את היוצרים שרוצים לעקוב אחריהם
  CREATORS: [
    { name: 'עדי עייש', handle: 'adi_ayash', platform: 'instagram', category: 'לייפסטייל' },
    { name: 'נדיר אליהו', handle: 'nadir_eliahu', platform: 'instagram', category: 'בידור' },
    { name: 'ליאל אלי', handle: 'liel.eli', platform: 'instagram', category: 'אופנה' },
    { name: 'מאיה ורטהיימר', handle: 'mayawertheimer', platform: 'instagram', category: 'יופי' },
    { name: 'קובי אדרי', handle: 'kobi_adri', platform: 'tiktok', category: 'קומדיה' },
    { name: 'דניאל עמית', handle: 'danielamit', platform: 'instagram', category: 'לייפסטייל' },
    { name: 'רותם סלע', handle: 'rikiinnewyork', platform: 'instagram', category: 'אופנה' }
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

// יוצר את כל הגליונות והכותרות - להריץ פעם אחת!
function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Creators Sheet
  var creatorsSheet = ss.getSheetByName(CONFIG.SHEETS.CREATORS);
  if (!creatorsSheet) {
    creatorsSheet = ss.insertSheet(CONFIG.SHEETS.CREATORS);
  }
  creatorsSheet.getRange('A1:F1').setValues([['id', 'name', 'handle', 'platform', 'category', 'isActive']]);
  creatorsSheet.getRange('A1:F1').setFontWeight('bold').setBackground('#8B5CF6').setFontColor('white');

  // הכנסת היוצרים מההגדרות
  for (var i = 0; i < CONFIG.CREATORS.length; i++) {
    var creator = CONFIG.CREATORS[i];
    var row = i + 2;
    creatorsSheet.getRange(row, 1, 1, 6).setValues([[
      'creator_' + (i + 1),
      creator.name,
      creator.handle,
      creator.platform,
      creator.category,
      true
    ]]);
  }

  // DailyStats Sheet
  var statsSheet = ss.getSheetByName(CONFIG.SHEETS.DAILY_STATS);
  if (!statsSheet) {
    statsSheet = ss.insertSheet(CONFIG.SHEETS.DAILY_STATS);
  }
  statsSheet.getRange('A1:G1').setValues([['id', 'creatorId', 'date', 'followersCount', 'postsCount', 'viewsToday', 'likesToday']]);
  statsSheet.getRange('A1:G1').setFontWeight('bold').setBackground('#EC4899').setFontColor('white');

  // Posts Sheet
  var postsSheet = ss.getSheetByName(CONFIG.SHEETS.POSTS);
  if (!postsSheet) {
    postsSheet = ss.insertSheet(CONFIG.SHEETS.POSTS);
  }
  postsSheet.getRange('A1:I1').setValues([['id', 'creatorId', 'date', 'platformPostId', 'url', 'caption', 'views', 'likes', 'comments']]);
  postsSheet.getRange('A1:I1').setFontWeight('bold').setBackground('#10B981').setFontColor('white');

  // Logs Sheet
  var logsSheet = ss.getSheetByName(CONFIG.SHEETS.LOGS);
  if (!logsSheet) {
    logsSheet = ss.insertSheet(CONFIG.SHEETS.LOGS);
  }
  logsSheet.getRange('A1:C1').setValues([['timestamp', 'action', 'details']]);
  logsSheet.getRange('A1:C1').setFontWeight('bold').setBackground('#F59E0B').setFontColor('white');

  // מחיקת Sheet1 אם קיים
  var sheet1 = ss.getSheetByName('Sheet1');
  if (sheet1) {
    ss.deleteSheet(sheet1);
  }

  log('setupSheets', 'הגליונות נוצרו בהצלחה');
  SpreadsheetApp.getUi().alert('המערכת הוגדרה בהצלחה!');
}

// ============ פונקציות עזר ============

function log(action, details) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var logsSheet = ss.getSheetByName(CONFIG.SHEETS.LOGS);
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

function getInstagramData(username) {
  try {
    var url = 'https://www.instagram.com/' + username + '/?__a=1&__d=dis';

    var options = {
      'method': 'get',
      'headers': {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      'muteHttpExceptions': true
    };

    var response = UrlFetchApp.fetch(url, options);
    var statusCode = response.getResponseCode();

    if (statusCode === 200) {
      var content = response.getContentText();
      return parseInstagramHTML(content, username);
    }

    // שיטה 2: דרך HTML
    var htmlUrl = 'https://www.instagram.com/' + username + '/';
    var htmlResponse = UrlFetchApp.fetch(htmlUrl, options);

    if (htmlResponse.getResponseCode() === 200) {
      return parseInstagramHTML(htmlResponse.getContentText(), username);
    }

    return { success: false, error: 'Could not fetch data', statusCode: statusCode };

  } catch (error) {
    log('getInstagramData', 'Error for ' + username + ': ' + error.message);
    return { success: false, error: error.message };
  }
}

function parseInstagramHTML(html, username) {
  try {
    // חיפוש הנתונים ב-meta tags או בסקריפטים
    var followersMatch = html.match(/"edge_followed_by":\{"count":(\d+)\}/);
    var postsMatch = html.match(/"edge_owner_to_timeline_media":\{"count":(\d+)/);
    var followingMatch = html.match(/"edge_follow":\{"count":(\d+)\}/);

    // חיפוש במטא description
    var metaMatch = html.match(/<meta[^>]*content="([^"]*Followers[^"]*)"[^>]*>/i);

    if (followersMatch || metaMatch) {
      var followers = 0;
      var posts = 0;

      if (followersMatch) {
        followers = parseInt(followersMatch[1]);
      } else if (metaMatch) {
        var metaText = metaMatch[1];
        var followersPart = metaText.match(/([\d,.]+[KMB]?)\s*Followers/i);
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

function parseMetricNumber(str) {
  if (!str) return 0;
  str = str.replace(/,/g, '');

  var multipliers = {
    'K': 1000,
    'M': 1000000,
    'B': 1000000000
  };

  var match = str.match(/([\d.]+)([KMB])?/i);
  if (match) {
    var num = parseFloat(match[1]);
    if (match[2]) {
      num *= multipliers[match[2].toUpperCase()];
    }
    return Math.round(num);
  }

  return parseInt(str) || 0;
}

// ============ איסוף נתונים מטיקטוק ============

function getTikTokData(username) {
  try {
    var url = 'https://www.tiktok.com/@' + username;

    var options = {
      'method': 'get',
      'headers': {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      'muteHttpExceptions': true
    };

    var response = UrlFetchApp.fetch(url, options);
    var html = response.getContentText();

    // Fallback: regex
    var followersMatch = html.match(/"followerCount":(\d+)/);
    var likesMatch = html.match(/"heartCount":(\d+)/);
    var videoMatch = html.match(/"videoCount":(\d+)/);

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
    log('getTikTokData', 'Error for ' + username + ': ' + error.message);
    return { success: false, error: error.message };
  }
}

// ============ עדכון יומי ============

// הפונקציה הראשית - להפעיל כל יום!
function dailyUpdate() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var creatorsSheet = ss.getSheetByName(CONFIG.SHEETS.CREATORS);
  var statsSheet = ss.getSheetByName(CONFIG.SHEETS.DAILY_STATS);

  if (!creatorsSheet || !statsSheet) {
    log('dailyUpdate', 'Error: Sheets not found. Run setupSheets() first.');
    return;
  }

  var creators = getCreatorsFromSheet();
  var today = getTodayDate();
  var successCount = 0;
  var errorCount = 0;

  for (var i = 0; i < creators.length; i++) {
    var creator = creators[i];
    if (!creator.isActive) continue;

    // השהיה בין בקשות למניעת חסימה
    Utilities.sleep(2000 + Math.random() * 3000);

    var data;
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
        0,
        data.likes || 0
      ]);
      successCount++;
      log('dailyUpdate', 'Success: ' + creator.name + ' - ' + data.followers + ' followers');
    } else {
      errorCount++;
      log('dailyUpdate', 'Failed: ' + creator.name + ' - ' + (data ? data.error : 'Unknown error'));
    }
  }

  log('dailyUpdate', 'Completed: ' + successCount + ' success, ' + errorCount + ' errors');
}

function getCreatorsFromSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEETS.CREATORS);
  var data = sheet.getDataRange().getValues();

  var creators = [];
  for (var i = 1; i < data.length; i++) {
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

// ============ API לדשבורד ============

// Web App endpoint - מחזיר JSON לדשבורד
function doGet(e) {
  var action = e && e.parameter && e.parameter.action ? e.parameter.action : 'all';

  var result;

  if (action === 'creators') {
    result = getCreatorsData();
  } else if (action === 'stats') {
    result = getStatsData();
  } else if (action === 'posts') {
    result = getPostsData();
  } else {
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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEETS.CREATORS);
  var data = sheet.getDataRange().getValues();

  var creators = [];
  for (var i = 1; i < data.length; i++) {
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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEETS.DAILY_STATS);
  var data = sheet.getDataRange().getValues();

  var stats = [];
  for (var i = 1; i < data.length; i++) {
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
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEETS.POSTS);
  var data = sheet.getDataRange().getValues();

  var posts = [];
  for (var i = 1; i < data.length; i++) {
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

function addCreator(name, handle, platform, category) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEETS.CREATORS);

  sheet.appendRow([
    'creator_' + generateId(),
    name,
    handle,
    platform,
    category || '',
    true
  ]);

  log('addCreator', 'Added: ' + name + ' (' + handle + ')');
}

function addPost(creatorId, url, caption, views, likes, comments) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.SHEETS.POSTS);

  sheet.appendRow([
    generateId(),
    creatorId,
    getTodayDate(),
    '',
    url,
    caption,
    views || 0,
    likes || 0,
    comments || 0
  ]);

  log('addPost', 'Added post for ' + creatorId);
}

function testCreator(handle, platform) {
  var data;
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
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Emma Analytics')
    .addItem('הגדרה ראשונית', 'setupSheets')
    .addItem('עדכון יומי עכשיו', 'dailyUpdate')
    .addSeparator()
    .addItem('בדיקת חיבור', 'testConnection')
    .addItem('צפה בלוגים', 'showLogs')
    .addToUi();
}

function testConnection() {
  var data = getInstagramData('instagram');
  if (data.success) {
    SpreadsheetApp.getUi().alert('החיבור תקין!\n\nInstagram official account:\n' + data.followers + ' followers');
  } else {
    SpreadsheetApp.getUi().alert('בעיה בחיבור\n\n' + data.error);
  }
}

function showLogs() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var logsSheet = ss.getSheetByName(CONFIG.SHEETS.LOGS);
  ss.setActiveSheet(logsSheet);
}
