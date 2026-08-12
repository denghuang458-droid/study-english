const $ = (id) => document.getElementById(id);
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => arr.slice().sort(() => Math.random() - 0.5);

const learnView = $('learnView');
const learnInput = $('learnInput');
const learnFeedback = $('learnFeedback');
const learnEn = $('learnEn');
const learnPhonetic = $('learnPhonetic');
const learnCn = $('learnCn');
const learnExampleEn = $('learnExampleEn');
const learnExampleCn = $('learnExampleCn');
const modal = $('resultModal');

// ============ 主题切换 ============
function setupTheme() {
  const saved = localStorage.getItem('typing-theme');
  if (saved) document.documentElement.dataset.theme = saved;
  $('themeToggle').addEventListener('click', () => {
    const current = document.documentElement.dataset.theme || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('typing-theme', next);
    $('themeToggle').textContent = next === 'dark' ? '🌙' : '☀️';
  });
  $('themeToggle').textContent = (document.documentElement.dataset.theme === 'light') ? '☀️' : '🌙';
}

// ============ 星座桌宠 ============
// 基础配色：f 肤色 / h 发色 / c 衣服色 / d 裤子 / k 黑 / w 眼白 / W 高光 / p 腮红 / e 泪
const MOCHI_BASE = { f: '#ffe9d6', h: '#f5f0e6', c: '#f5f5f5', d: '#4a3a2a', k: '#2a2a2a', w: '#ffffff', W: '#ffffff', p: '#ffa8c0', e: '#8ecae6' };

// ---- 像素构建工具（32x32）----
const PET_SIZE = 32;
function blankFrame() {
  const f = [];
  for (let y = 0; y < PET_SIZE; y++) {
    const row = [];
    for (let x = 0; x < PET_SIZE; x++) row.push('.');
    f.push(row);
  }
  return f;
}
function stampFrame(f, x, y, pattern) {
  for (let py = 0; py < pattern.length; py++) {
    const row = pattern[py];
    for (let px = 0; px < row.length; px++) {
      const ch = row[px];
      if (ch === '.' || ch === ' ') continue;
      if (y + py >= 0 && y + py < PET_SIZE && x + px >= 0 && x + px < PET_SIZE) {
        f[y + py][x + px] = ch;
      }
    }
  }
  return f;
}
function toRows(f) { return f.map(r => r.join('')); }

// 身体基础（腿 + 鞋），上身和裙子由每星座专属款式提供
function makeMochiBody() {
  const f = blankFrame();
  // 腿（肤色 f）+ 鞋（k）
  stampFrame(f, 10, 27, ['ff', 'ff', 'ff']);
  stampFrame(f, 19, 27, ['ff', 'ff', 'ff']);
  stampFrame(f, 9, 30, ['kkk']);
  stampFrame(f, 19, 30, ['kkk']);
  stampFrame(f, 9, 31, ['kkk']);
  stampFrame(f, 19, 31, ['kkk']);
  return f;
}

// 美少女头基础（只有脸和脖子，发型由每星座专属款式提供）
function chibiBaseFace() {
  const f = blankFrame();
  // 脸（肤色 f）
  stampFrame(f, 8, 5, [
    'ffffffffffffffff',
    'ffffffffffffffff',
    'ffffffffffffffff',
    'ffffffffffffffff',
    'ffffffffffffffff',
    'ffffffffffffffff',
    'ffffffffffffffff',
    'ffffffffffffffff',
    'ffffffffffffffff',
    'ffffffffffffffff'
  ]);
  stampFrame(f, 10, 15, ['ffffffffff']); // 脖子
  return f;
}

// 表情帧：睁眼 / 闭眼 / 开心 / 难过（美少女大眼）
const FACE_OPEN = (() => {
  const f = chibiBaseFace();
  // 眉毛
  stampFrame(f, 11, 8, ['ddd']);
  stampFrame(f, 17, 8, ['ddd']);
  // 豆豆眼（小黑点 + 白高光）
  stampFrame(f, 12, 10, ['kW', 'kk']);
  stampFrame(f, 17, 10, ['kW', 'kk']);
  // 腮红
  stampFrame(f, 8, 11, ['pp']);
  stampFrame(f, 22, 11, ['pp']);
  return toRows(f);
})();

const FACE_CLOSED = (() => {
  const f = chibiBaseFace();
  // 眉毛
  stampFrame(f, 11, 8, ['ddd']);
  stampFrame(f, 17, 8, ['ddd']);
  // 闭眼：弯弯弧线
  stampFrame(f, 12, 11, ['dd', '.d']);
  stampFrame(f, 17, 11, ['dd', '.d']);
  // 腮红
  stampFrame(f, 8, 11, ['pp']);
  stampFrame(f, 22, 11, ['pp']);
  return toRows(f);
})();

const FACE_HAPPY = (() => {
  const f = chibiBaseFace();
  // 弯眉（开心）
  stampFrame(f, 10, 8, ['d', 'dd']);
  stampFrame(f, 17, 8, ['d', 'dd']);
  // 眯眼笑 ^^
  stampFrame(f, 11, 10, ['d..d', '.dd.']);
  stampFrame(f, 16, 10, ['d..d', '.dd.']);
  // 大腮红
  stampFrame(f, 8, 11, ['ppp']);
  stampFrame(f, 21, 11, ['ppp']);
  return toRows(f);
})();

const FACE_SAD = (() => {
  const f = chibiBaseFace();
  // 下垂眉
  stampFrame(f, 11, 8, ['dd', 'd']);
  stampFrame(f, 18, 8, ['dd', 'd']);
  // 泪眼（豆豆）
  stampFrame(f, 12, 10, ['kk', 'kk']);
  stampFrame(f, 17, 10, ['kk', 'kk']);
  // 泪滴
  stampFrame(f, 13, 12, ['e', 'e']);
  stampFrame(f, 18, 12, ['e', 'e']);
  // 腮红
  stampFrame(f, 8, 11, ['pp']);
  stampFrame(f, 22, 11, ['pp']);
  return toRows(f);
})();

const FACE_LOVE = (() => {
  const f = chibiBaseFace();
  // 眉毛
  stampFrame(f, 11, 8, ['ddd']);
  stampFrame(f, 17, 8, ['ddd']);
  // 闪闪大眼（爱心/星星眼，大高光）
  stampFrame(f, 11, 9, ['kWWk', 'kWWk', 'kWWk', 'kkkk']);
  stampFrame(f, 17, 9, ['kWWk', 'kWWk', 'kWWk', 'kkkk']);
  // 腮红（大）
  stampFrame(f, 8, 11, ['ppp']);
  stampFrame(f, 21, 11, ['ppp']);
  return toRows(f);
})();

const FACE_SURPRISED = (() => {
  const f = chibiBaseFace();
  // 挑眉
  stampFrame(f, 10, 7, ['ddd']);
  stampFrame(f, 19, 7, ['ddd']);
  // 圆睁大眼
  stampFrame(f, 11, 9, ['kWWk', 'kWWk', 'kWWk', 'kkkk']);
  stampFrame(f, 17, 9, ['kWWk', 'kWWk', 'kWWk', 'kkkk']);
  // 腮红
  stampFrame(f, 8, 11, ['pp']);
  stampFrame(f, 22, 11, ['pp']);
  return toRows(f);
})();

const FACE_WINK = (() => {
  const f = chibiBaseFace();
  // 眉毛
  stampFrame(f, 11, 8, ['ddd']);
  stampFrame(f, 17, 8, ['ddd']);
  // 左眼眨眼（弧线），右眼豆豆
  stampFrame(f, 12, 10, ['dd', '.d']);
  stampFrame(f, 17, 10, ['kW', 'kk']);
  // 腮红
  stampFrame(f, 8, 11, ['pp']);
  stampFrame(f, 22, 11, ['pp']);
  return toRows(f);
})();

const FACE_TIRED = (() => {
  const f = chibiBaseFace();
  // 下垂眉
  stampFrame(f, 11, 8, ['d.', 'dd']);
  stampFrame(f, 17, 8, ['.d', 'dd']);
  // 半闭眼（困倦）
  stampFrame(f, 12, 10, ['.d', 'dd']);
  stampFrame(f, 17, 10, ['.d', 'dd']);
  // 腮红
  stampFrame(f, 8, 11, ['pp']);
  stampFrame(f, 22, 11, ['pp']);
  return toRows(f);
})();

const FACE_FOCUS = (() => {
  const f = chibiBaseFace();
  // 微微皱起的眉（认真专注）
  stampFrame(f, 11, 8, ['dd']);
  stampFrame(f, 17, 8, ['dd']);
  // 豆豆眼
  stampFrame(f, 12, 10, ['kW', 'kk']);
  stampFrame(f, 17, 10, ['kW', 'kk']);
  // 腮红
  stampFrame(f, 8, 11, ['pp']);
  stampFrame(f, 22, 11, ['pp']);
  return toRows(f);
})();

const FACE_SWEAT = (() => {
  const f = chibiBaseFace();
  // 拧眉
  stampFrame(f, 11, 8, ['dd', 'd']);
  stampFrame(f, 17, 8, ['dd', 'd']);
  // 豆豆眼
  stampFrame(f, 12, 10, ['kk', 'kk']);
  stampFrame(f, 17, 10, ['kk', 'kk']);
  // 汗滴（脸侧）
  stampFrame(f, 7, 10, ['e', 'e']);
  stampFrame(f, 23, 10, ['e', 'e']);
  // 腮红
  stampFrame(f, 8, 11, ['pp']);
  stampFrame(f, 22, 11, ['pp']);
  return toRows(f);
})();

const FACE_STAR = (() => {
  const f = chibiBaseFace();
  // 眉毛
  stampFrame(f, 11, 8, ['ddd']);
  stampFrame(f, 17, 8, ['ddd']);
  // 星星眼（大亮眼）
  stampFrame(f, 11, 9, ['kWk', 'kWk', 'kkk']);
  stampFrame(f, 18, 9, ['kWk', 'kWk', 'kkk']);
  // 大腮红
  stampFrame(f, 8, 11, ['ppp']);
  stampFrame(f, 21, 11, ['ppp']);
  return toRows(f);
})();

const FACE_ANGRY = (() => {
  const f = chibiBaseFace();
  // 拧紧的八字眉
  stampFrame(f, 10, 8, ['dd', 'd.']);
  stampFrame(f, 18, 8, ['.d', 'dd']);
  // 怒目豆豆
  stampFrame(f, 12, 10, ['kk', 'kk']);
  stampFrame(f, 17, 10, ['kk', 'kk']);
  // 腮红
  stampFrame(f, 8, 11, ['pp']);
  stampFrame(f, 22, 11, ['pp']);
  return toRows(f);
})();

const FACE_SHY = (() => {
  const f = chibiBaseFace();
  // 低眉
  stampFrame(f, 11, 9, ['ddd']);
  stampFrame(f, 17, 9, ['ddd']);
  // 躲闪的眼睛（半闭下移）
  stampFrame(f, 12, 11, ['dd', '.d']);
  stampFrame(f, 17, 11, ['dd', '.d']);
  // 大腮红
  stampFrame(f, 8, 11, ['ppp', 'ppp']);
  stampFrame(f, 21, 11, ['ppp', 'ppp']);
  // 汗滴
  stampFrame(f, 7, 9, ['e', 'e']);
  return toRows(f);
})();

const FACE_CRY = (() => {
  const f = chibiBaseFace();
  // 垂眉
  stampFrame(f, 11, 8, ['dd', 'd']);
  stampFrame(f, 18, 8, ['dd', 'd']);
  // 豆豆眼
  stampFrame(f, 12, 10, ['kk', 'kk']);
  stampFrame(f, 17, 10, ['kk', 'kk']);
  // 大泪滴（两侧喷涌）
  stampFrame(f, 11, 12, ['e', 'e', 'e']);
  stampFrame(f, 19, 12, ['e', 'e', 'e']);
  stampFrame(f, 13, 13, ['e', 'e']);
  stampFrame(f, 18, 13, ['e', 'e']);
  // 腮红
  stampFrame(f, 8, 11, ['pp']);
  stampFrame(f, 22, 11, ['pp']);
  return toRows(f);
})();

const FACE_GIGGLE = (() => {
  const f = chibiBaseFace();
  // 弯弯眯眼（偷着乐）
  stampFrame(f, 11, 10, ['d..d', '.dd.']);
  stampFrame(f, 17, 10, ['d..d', '.dd.']);
  // 腮红
  stampFrame(f, 8, 11, ['pp']);
  stampFrame(f, 22, 11, ['pp']);
  return toRows(f);
})();

const FACE_DAZE = (() => {
  const f = chibiBaseFace();
  // 空洞的小眼
  stampFrame(f, 12, 10, ['k.']);
  stampFrame(f, 17, 10, ['k.']);
  // 小腮红
  stampFrame(f, 8, 11, ['pp']);
  stampFrame(f, 22, 11, ['pp']);
  return toRows(f);
})();

const FACE_DIZZY = (() => {
  const f = chibiBaseFace();
  // 蚊香眼
  stampFrame(f, 11, 10, ['kw', 'wk']);
  stampFrame(f, 17, 10, ['kw', 'wk']);
  // 汗滴
  stampFrame(f, 7, 10, ['e', 'e']);
  stampFrame(f, 23, 10, ['e', 'e']);
  // 腮红
  stampFrame(f, 8, 12, ['pp']);
  stampFrame(f, 22, 12, ['pp']);
  return toRows(f);
})();

const FACE_SPARKLE = (() => {
  const f = chibiBaseFace();
  // 眉毛
  stampFrame(f, 11, 8, ['ddd']);
  stampFrame(f, 17, 8, ['ddd']);
  // 闪光大眼
  stampFrame(f, 11, 9, ['kWk', 'kWk', 'kkk']);
  stampFrame(f, 18, 9, ['kWk', 'kWk', 'kkk']);
  // 眼角闪光点
  stampFrame(f, 9, 9, ['W']);
  stampFrame(f, 22, 9, ['W']);
  // 大腮红
  stampFrame(f, 8, 11, ['ppp']);
  stampFrame(f, 21, 11, ['ppp']);
  return toRows(f);
})();

// 每星座专属发型（发色 h）
const HAIR_ARIES = (() => {
  const f = blankFrame();
  // 中分长直发
  stampFrame(f, 7, 0, [
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh'
  ]);
  stampFrame(f, 7, 6, ['hhh............hhh']);
  stampFrame(f, 7, 7, ['hhh............hhh']);
  stampFrame(f, 5, 7, ['hhh', 'hh', 'hh', 'hh', 'hh', 'hh', 'hh']);
  stampFrame(f, 24, 7, ['hhh', 'hh', 'hh', 'hh', 'hh', 'hh', 'hh']);
  return toRows(f);
})();

const HAIR_TAURUS = (() => {
  const f = blankFrame();
  // 齐刘海长直发
  stampFrame(f, 7, 0, [
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh'
  ]);
  stampFrame(f, 5, 7, ['hhh', 'hh', 'hh', 'hh', 'hh', 'hh', 'hh']);
  stampFrame(f, 24, 7, ['hhh', 'hh', 'hh', 'hh', 'hh', 'hh', 'hh']);
  return toRows(f);
})();

const HAIR_GEMINI = (() => {
  const f = blankFrame();
  // 双马尾
  stampFrame(f, 7, 0, [
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh'
  ]);
  stampFrame(f, 7, 6, ['hhh............hhh']);
  stampFrame(f, 7, 7, ['hhh............hhh']);
  stampFrame(f, 4, 3, ['hhh', 'hh', 'hh', 'hh', 'hh', 'hh', 'hh', 'hh', 'hh']);
  stampFrame(f, 25, 3, ['hhh', 'hh', 'hh', 'hh', 'hh', 'hh', 'hh', 'hh', 'hh']);
  return toRows(f);
})();

const HAIR_CANCER = (() => {
  const f = blankFrame();
  // 波波头（齐刘海短发，发梢外翘）
  stampFrame(f, 7, 0, [
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh'
  ]);
  stampFrame(f, 5, 7, ['hh', 'hh', 'hh', 'hh']);
  stampFrame(f, 25, 7, ['hh', 'hh', 'hh', 'hh']);
  stampFrame(f, 4, 11, ['hh']);
  stampFrame(f, 26, 11, ['hh']);
  return toRows(f);
})();

const HAIR_LEO = (() => {
  const f = blankFrame();
  // 大波浪卷发
  stampFrame(f, 7, 0, [
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh'
  ]);
  stampFrame(f, 7, 6, ['hhh............hhh']);
  stampFrame(f, 7, 7, ['hhh............hhh']);
  stampFrame(f, 4, 7, ['hhh', 'hh', 'hhh', 'hh', 'hhh', 'hh', 'hhh']);
  stampFrame(f, 25, 7, ['hhh', 'hh', 'hhh', 'hh', 'hhh', 'hh', 'hhh']);
  return toRows(f);
})();

const HAIR_VIRGO = (() => {
  const f = blankFrame();
  // 单侧麻花辫（右侧）
  stampFrame(f, 7, 0, [
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh'
  ]);
  stampFrame(f, 7, 6, ['hhh............hhh']);
  stampFrame(f, 7, 7, ['hhh............hhh']);
  stampFrame(f, 5, 7, ['hh', 'hh', 'hh', 'hh', 'hh', 'hh']);
  stampFrame(f, 24, 7, ['hh', 'h.', 'hh', 'h.', 'hh', 'h.', 'hh', 'h.', 'hh', 'h.', 'hh', 'h.', 'hh']);
  return toRows(f);
})();

const HAIR_LIBRA = (() => {
  const f = blankFrame();
  // 公主头（半扎发）
  stampFrame(f, 7, 0, [
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh'
  ]);
  stampFrame(f, 7, 6, ['hhh............hhh']);
  stampFrame(f, 7, 7, ['hhh............hhh']);
  stampFrame(f, 4, 4, ['hh', 'hh']);
  stampFrame(f, 26, 4, ['hh', 'hh']);
  stampFrame(f, 5, 8, ['hh', 'hh', 'hh', 'hh', 'hh', 'hh']);
  stampFrame(f, 24, 8, ['hh', 'hh', 'hh', 'hh', 'hh', 'hh']);
  return toRows(f);
})();

const HAIR_SCORPIO = (() => {
  const f = blankFrame();
  // 斜刘海短发（左长右短）
  stampFrame(f, 7, 0, [
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh'
  ]);
  stampFrame(f, 7, 6, ['hhhhhhhhhh......']);
  stampFrame(f, 7, 7, ['hhhhhhhhhhhhhh..']);
  stampFrame(f, 5, 7, ['hh', 'hh', 'hh', 'hh']);
  stampFrame(f, 24, 7, ['hh', 'hh', 'hh', 'hh']);
  return toRows(f);
})();

const HAIR_SAG = (() => {
  const f = blankFrame();
  // 双丸子头
  stampFrame(f, 7, 1, [
    'hhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhh'
  ]);
  stampFrame(f, 7, 6, ['hhh............hhh']);
  stampFrame(f, 7, 7, ['hhh............hhh']);
  stampFrame(f, 8, 0, ['hh', 'hh']);
  stampFrame(f, 21, 0, ['hh', 'hh']);
  stampFrame(f, 5, 7, ['hh', 'hh', 'hh', 'hh', 'hh']);
  stampFrame(f, 24, 7, ['hh', 'hh', 'hh', 'hh', 'hh']);
  return toRows(f);
})();

const HAIR_CAP = (() => {
  const f = blankFrame();
  // 中分超长直发
  stampFrame(f, 7, 0, [
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh'
  ]);
  stampFrame(f, 7, 6, ['hhh............hhh']);
  stampFrame(f, 7, 7, ['hhh............hhh']);
  stampFrame(f, 5, 7, ['hhh', 'hh', 'hh', 'hh', 'hh', 'hh', 'hh', 'hh', 'hh']);
  stampFrame(f, 24, 7, ['hhh', 'hh', 'hh', 'hh', 'hh', 'hh', 'hh', 'hh', 'hh']);
  return toRows(f);
})();

const HAIR_AQUA = (() => {
  const f = blankFrame();
  // 清爽短发
  stampFrame(f, 7, 0, [
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh'
  ]);
  stampFrame(f, 6, 8, ['hh', 'hh', 'hh']);
  stampFrame(f, 24, 8, ['hh', 'hh', 'hh']);
  return toRows(f);
})();

const HAIR_PIS = (() => {
  const f = blankFrame();
  // 长卷发（大波浪）
  stampFrame(f, 7, 0, [
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh',
    'hhhhhhhhhhhhhhhhhh'
  ]);
  stampFrame(f, 7, 6, ['hhh............hhh']);
  stampFrame(f, 7, 7, ['hhh............hhh']);
  stampFrame(f, 4, 7, ['hhh', 'hh', 'hhh', 'hh', 'hhh', 'hh', 'hhh', 'hh', 'hhh', 'hh', 'hhh']);
  stampFrame(f, 25, 7, ['hhh', 'hh', 'hhh', 'hh', 'hhh', 'hh', 'hhh', 'hh', 'hhh', 'hh', 'hhh']);
  return toRows(f);
})();

// 配件帧（十二星座头饰，叠在身体上方）
const HAT_ARIES = (() => {
  const f = blankFrame();
  // 蓬松羊毛卷帽（完整覆盖头顶）+ 两侧大卷角
  stampFrame(f, 7, 0, [
    '...wwwwwwwwwwwww...',
    '..wwwwwwwwwwwwwww..',
    '.wwwwwwwwwwwwwwwww.',
    'wwwwwwwwwwwwwwwwwww',
    '.wwwwwwwwwwwwwwwww.',
    '..wwwwwwwwwwwwwww..'
  ]);
  // 羊毛纹理（阴影小卷）
  stampFrame(f, 9, 1, ['dd', 'd.', 'dd']);
  stampFrame(f, 14, 2, ['dd', 'd.', 'dd']);
  stampFrame(f, 19, 1, ['dd', '.d', 'dd']);
  // 两侧大卷角
  stampFrame(f, 9, 0, ['.w.', 'www', 'ww.', 'w..']);
  stampFrame(f, 21, 0, ['.w.', 'www', '.ww', '..w']);
  return toRows(f);
})();

const HAT_TAURUS = (() => {
  const f = blankFrame();
  // 金色王冠帽体（完整覆盖头顶）+ 中央宝石 + 两侧大弯角
  stampFrame(f, 8, 1, [
    '..yyyyyyyyyyyyyy..',
    '.yyyyyyyyyyyyyyyy.',
    'yyyyyyyyyyyyyyyyyy'
  ]);
  stampFrame(f, 8, 4, ['.yyyyyyyyyyyyyy.']);
  stampFrame(f, 15, 2, ['r']);
  stampFrame(f, 8, 0, ['.y.', 'yyy', '.yy', '..y']);
  stampFrame(f, 22, 0, ['.y.', 'yyy', 'yy.', 'y..']);
  return toRows(f);
})();

const HAT_GEMINI = (() => {
  const f = blankFrame();
  // 双色发带（蓝+粉）+ 饱满双丸子
  stampFrame(f, 8, 2, ['.bbbbbbbbbbbbbb.']);
  stampFrame(f, 8, 3, ['pppppppppppppppp']);
  stampFrame(f, 8, 4, ['.bbbbbbbbbbbbbb.']);
  stampFrame(f, 8, 0, ['ppp', 'pppp', 'ppp']);
  stampFrame(f, 20, 0, ['bbb', 'bbbb', 'bbb']);
  return toRows(f);
})();

const HAT_CANCER = (() => {
  const f = blankFrame();
  // 红色蟹壳 + 侧钳
  stampFrame(f, 7, 0, [
    'rrrrrrrrrrrrrrrrrr',
    'rrrrrrrrrrrrrrrrrr',
    '.rrrrrrrrrrrrrrrr.',
    '..rrrrrrrrrrrrrr..',
    '...rrrrrrrrrrrr...'
  ]);
  stampFrame(f, 13, 3, ['d']);
  stampFrame(f, 18, 3, ['d']);
  stampFrame(f, 3, 4, ['rr', 'r.']);
  stampFrame(f, 27, 4, ['rr', '.r']);
  return toRows(f);
})();

const HAT_LEO = (() => {
  const f = blankFrame();
  // 金色鬃毛环 + 两侧垂鬃
  stampFrame(f, 4, 1, [
    '.yyyyyyyyyyyyyyyyyyyyy.',
    'yyyyyyyyyyyyyyyyyyyyyyy',
    'yyyyyyyyyyyyyyyyyyyyyyy'
  ]);
  stampFrame(f, 4, 4, ['yy.', 'yy.', 'yy.']);
  stampFrame(f, 26, 4, ['.yy', '.yy', '.yy']);
  return toRows(f);
})();

const HAT_VIRGO = (() => {
  const f = blankFrame();
  // 完整花环（一圈小花围住头顶）+ 头顶大花
  stampFrame(f, 6, 1, ['p.p.p.p.p.p.p.p.']);
  stampFrame(f, 20, 1, ['.p.p.p.p.p.p.p.p']);
  stampFrame(f, 6, 2, ['p.p.p.p.p.p.p.p.']);
  stampFrame(f, 20, 2, ['.p.p.p.p.p.p.p.p']);
  stampFrame(f, 13, 0, ['.y.', 'ypy', '.y.']);
  stampFrame(f, 8, 0, ['p']);
  stampFrame(f, 22, 0, ['p']);
  return toRows(f);
})();

const HAT_LIBRA = (() => {
  const f = blankFrame();
  // 天平帽：头顶横杆 + 中央竖杆 + 两侧吊绳托盘
  stampFrame(f, 10, 0, ['yyyyyyyyyyyy']);
  stampFrame(f, 15, 1, ['y']);
  stampFrame(f, 15, 2, ['y']);
  stampFrame(f, 15, 3, ['y']);
  stampFrame(f, 8, 1, ['y']);
  stampFrame(f, 22, 1, ['y']);
  stampFrame(f, 6, 2, ['.y.', 'yyy']);
  stampFrame(f, 24, 2, ['.y.', 'yyy']);
  return toRows(f);
})();

const HAT_SCORPIO = (() => {
  const f = blankFrame();
  // 紫色蝎帽 + 卷尾
  stampFrame(f, 8, 0, [
    'vvvvvvvvvvvvvvvv',
    'vvvvvvvvvvvvvvvv',
    '.vvvvvvvvvvvvvv.'
  ]);
  stampFrame(f, 22, 1, ['v.', 'vv', '.v', '..v', '.v']);
  return toRows(f);
})();

const HAT_SAG = (() => {
  const f = blankFrame();
  // 宽檐游侠帽 + 帽带 + 箭羽
  stampFrame(f, 9, 0, ['.ggggggggggggg.', 'ggggggggggggggg', 'ggggggggggggggg']);
  stampFrame(f, 10, 3, ['.ggggggggggg.']);
  stampFrame(f, 10, 2, ['ggggggggggg']);
  stampFrame(f, 22, 0, ['g', 'g', 'g']);
  stampFrame(f, 23, 1, ['g']);
  stampFrame(f, 24, 2, ['g']);
  return toRows(f);
})();

const HAT_CAP = (() => {
  const f = blankFrame();
  // 深棕山羊帽（完整覆盖头顶）+ 两侧山羊角
  stampFrame(f, 8, 1, [
    '..bbbbbbbbbbbbbb..',
    '.bbbbbbbbbbbbbbbb.',
    'bbbbbbbbbbbbbbbbbb'
  ]);
  stampFrame(f, 8, 4, ['.bbbbbbbbbbbbbb.']);
  stampFrame(f, 9, 0, ['.b.', 'bbb', '.bb', '..b']);
  stampFrame(f, 20, 0, ['.b.', 'bbb', 'bb.', 'b..']);
  return toRows(f);
})();

const HAT_AQUA = (() => {
  const f = blankFrame();
  // 蓝色水瓶 + 水花
  stampFrame(f, 10, 0, ['.bbb.', 'bbbbb', 'bbbbb', 'bbbbb', '.bbb.']);
  stampFrame(f, 14, 0, ['b.', 'bb']);
  stampFrame(f, 19, 1, ['b']);
  return toRows(f);
})();

const HAT_PIS = (() => {
  const f = blankFrame();
  // 双鱼头饰：两条小鱼并排（蓝边粉身 + 粉边蓝身）+ 鱼尾 + 中央水花连接
  stampFrame(f, 6, 1, ['bbbbbbbb', 'bppppppb', 'bbbbbbbb']);
  stampFrame(f, 18, 1, ['pppppppp', 'pbbbbbbp', 'pppppppp']);
  stampFrame(f, 4, 2, ['bb', 'b.']);
  stampFrame(f, 26, 2, ['pp', '.p']);
  stampFrame(f, 14, 0, ['.b.', 'bpb', '.b.']);
  return toRows(f);
})();

// 星座专属身体特征（耳朵/钳子/翅膀/尾巴等）
const FEAT_ARIES = (() => {
  const f = blankFrame();
  stampFrame(f, 4, 4, ['w.', 'ww', '.w']);
  stampFrame(f, 27, 4, ['w.', 'ww', '.w']);
  return toRows(f);
})();

const FEAT_TAURUS = (() => {
  const f = blankFrame();
  stampFrame(f, 4, 4, ['b.', 'bb', '.b']);
  stampFrame(f, 27, 4, ['b.', 'bb', '.b']);
  return toRows(f);
})();

const FEAT_GEMINI = (() => {
  const f = blankFrame();
  stampFrame(f, 4, 4, ['b.', 'bb', '.b']);
  stampFrame(f, 27, 4, ['p.', 'pp', '.p']);
  return toRows(f);
})();

const FEAT_CANCER = (() => {
  const f = blankFrame();
  // 蟹钳移到脸颊两侧
  stampFrame(f, 3, 12, ['.rr.', 'rrrr', 'rrr.', 'r..']);
  stampFrame(f, 25, 12, ['.rr.', 'rrrr', '.rrr', '..r']);
  return toRows(f);
})();

const FEAT_LEO = (() => {
  const f = blankFrame();
  // 金色兽耳
  stampFrame(f, 4, 4, ['y.', 'yy', '.y']);
  stampFrame(f, 27, 4, ['y.', 'yy', '.y']);
  return toRows(f);
})();

const FEAT_VIRGO = (() => {
  const f = blankFrame();
  // 小翅膀在脸颊两侧
  stampFrame(f, 3, 11, ['w.', 'ww', 'ww', '.w']);
  stampFrame(f, 27, 11, ['w.', 'ww', 'ww', '.w']);
  return toRows(f);
})();

const FEAT_LIBRA = (() => {
  const f = blankFrame();
  // 金翅膀在脸颊两侧
  stampFrame(f, 3, 12, ['y.', 'yy', '.y']);
  stampFrame(f, 28, 12, ['y.', 'yy', '.y']);
  return toRows(f);
})();

const FEAT_SCORPIO = (() => {
  const f = blankFrame();
  // 蝎尾翘在头侧
  stampFrame(f, 26, 2, ['v', 'vv', 'v.', 'v.']);
  return toRows(f);
})();

const FEAT_SAG = (() => {
  const f = blankFrame();
  stampFrame(f, 4, 4, ['g.', 'gg', '.g']);
  stampFrame(f, 27, 4, ['g.', 'gg', '.g']);
  return toRows(f);
})();

const FEAT_CAP = (() => {
  // 头部化：无额外特征（羊角胡须已在头饰上）
  return toRows(blankFrame());
})();

const FEAT_AQUA = (() => {
  const f = blankFrame();
  stampFrame(f, 4, 5, ['b.', 'bb']);
  stampFrame(f, 27, 5, ['b.', 'bb']);
  return toRows(f);
})();

const FEAT_PIS = (() => {
  // 头部化：无额外特征（双鱼发饰已在头饰上）
  return toRows(blankFrame());
})();

// 每星座专属服装款式（上身 + 裙子）
const CLOTHES_ARIES = (() => {
  const f = blankFrame();
  // 白蝴蝶结领
  stampFrame(f, 12, 14, ['ww']);
  stampFrame(f, 11, 15, ['w..w']);
  // 无袖连衣裙（手臂肤色）
  stampFrame(f, 7, 16, ['ffccccccccccff']);
  stampFrame(f, 7, 17, ['ffccccccccccff']);
  stampFrame(f, 7, 18, ['ffccccccccccff']);
  stampFrame(f, 7, 19, ['ffccccccccccff']);
  // A 字裙
  stampFrame(f, 8, 20, ['cccccccccc']);
  stampFrame(f, 8, 21, ['cccccccccc']);
  stampFrame(f, 9, 22, ['cccccccc']);
  stampFrame(f, 10, 23, ['cccccc']);
  stampFrame(f, 11, 24, ['cccc']);
  stampFrame(f, 12, 25, ['cc']);
  stampFrame(f, 12, 26, ['cc']);
  return toRows(f);
})();

const CLOTHES_TAURUS = (() => {
  const f = blankFrame();
  // 金蝴蝶结领
  stampFrame(f, 12, 14, ['yy']);
  stampFrame(f, 11, 15, ['y..y']);
  // 长袖长裙（优雅）
  stampFrame(f, 7, 16, ['cccccccccccccc']);
  stampFrame(f, 7, 17, ['cccccccccccccc']);
  stampFrame(f, 7, 18, ['cccccccccccccc']);
  stampFrame(f, 7, 19, ['cccccccccccccc']);
  stampFrame(f, 8, 20, ['cccccccccc']);
  stampFrame(f, 8, 21, ['cccccccccc']);
  stampFrame(f, 8, 22, ['cccccccccc']);
  stampFrame(f, 9, 23, ['cccccccc']);
  stampFrame(f, 9, 24, ['cccccccc']);
  stampFrame(f, 10, 25, ['cccccc']);
  stampFrame(f, 10, 26, ['cccccc']);
  return toRows(f);
})();

const CLOTHES_GEMINI = (() => {
  const f = blankFrame();
  // 左右拼色上衣 + 百褶裙
  stampFrame(f, 7, 16, ['ffccccccbbbbff']);
  stampFrame(f, 7, 17, ['ffccccccbbbbff']);
  stampFrame(f, 7, 18, ['ffccccccbbbbff']);
  stampFrame(f, 7, 19, ['ffccccccbbbbff']);
  stampFrame(f, 8, 20, ['cccccccccc']);
  stampFrame(f, 8, 21, ['bbbbbbbbbb']);
  stampFrame(f, 8, 22, ['cccccccccc']);
  stampFrame(f, 9, 23, ['cccccccc']);
  stampFrame(f, 9, 24, ['bbbbbbbb']);
  stampFrame(f, 10, 25, ['cccccc']);
  stampFrame(f, 10, 26, ['bbbbbb']);
  return toRows(f);
})();

const CLOTHES_CANCER = (() => {
  const f = blankFrame();
  // 泡泡袖（肩部鼓宽）
  stampFrame(f, 6, 16, ['cccccccccccccccc']);
  stampFrame(f, 6, 17, ['cccccccccccccccc']);
  stampFrame(f, 7, 18, ['ffccccccccccff']);
  stampFrame(f, 7, 19, ['ffccccccccccff']);
  // A 字裙
  stampFrame(f, 8, 20, ['cccccccccc']);
  stampFrame(f, 8, 21, ['cccccccccc']);
  stampFrame(f, 9, 22, ['cccccccc']);
  stampFrame(f, 10, 23, ['cccccc']);
  stampFrame(f, 11, 24, ['cccc']);
  stampFrame(f, 12, 25, ['cc']);
  stampFrame(f, 12, 26, ['cc']);
  return toRows(f);
})();

const CLOTHES_LEO = (() => {
  const f = blankFrame();
  // 白色毛领披肩 + 喇叭裙
  stampFrame(f, 6, 15, ['wwwwwwwwwwwwww']);
  stampFrame(f, 7, 16, ['wwccccccccccww']);
  stampFrame(f, 7, 17, ['cccccccccccccc']);
  stampFrame(f, 7, 18, ['cccccccccccccc']);
  stampFrame(f, 7, 19, ['cccccccccccccc']);
  stampFrame(f, 8, 20, ['cccccccccc']);
  stampFrame(f, 8, 21, ['cccccccccc']);
  stampFrame(f, 8, 22, ['cccccccccc']);
  stampFrame(f, 7, 23, ['cccccccccccc']);
  stampFrame(f, 7, 24, ['cccccccccccc']);
  stampFrame(f, 6, 25, ['cccccccccccccc']);
  stampFrame(f, 6, 26, ['cccccccccccccc']);
  return toRows(f);
})();

const CLOTHES_VIRGO = (() => {
  const f = blankFrame();
  // 粉色花边领 + 蓬蓬纱裙
  stampFrame(f, 7, 15, ['pppppppppppp']);
  stampFrame(f, 8, 16, ['ppccccccccpp']);
  stampFrame(f, 7, 17, ['ffccccccccccff']);
  stampFrame(f, 7, 18, ['ffccccccccccff']);
  stampFrame(f, 7, 19, ['ffccccccccccff']);
  stampFrame(f, 7, 20, ['cccccccccccc']);
  stampFrame(f, 7, 21, ['cccccccccccc']);
  stampFrame(f, 6, 22, ['cccccccccccccc']);
  stampFrame(f, 6, 23, ['cccccccccccccc']);
  stampFrame(f, 6, 24, ['cccccccccccccc']);
  stampFrame(f, 7, 25, ['cccccccccccc']);
  stampFrame(f, 8, 26, ['cccccccccc']);
  return toRows(f);
})();

const CLOTHES_LIBRA = (() => {
  const f = blankFrame();
  // V 领衬衫 + 直筒裙
  stampFrame(f, 8, 16, ['ffffffffffff']);
  stampFrame(f, 9, 17, ['cccccccc']);
  stampFrame(f, 8, 18, ['cccccccccc']);
  stampFrame(f, 7, 19, ['ffccccccccccff']);
  stampFrame(f, 8, 20, ['cccccccccc']);
  stampFrame(f, 8, 21, ['cccccccccc']);
  stampFrame(f, 8, 22, ['cccccccccc']);
  stampFrame(f, 8, 23, ['cccccccccc']);
  stampFrame(f, 9, 24, ['cccccccc']);
  stampFrame(f, 9, 25, ['cccccccc']);
  stampFrame(f, 10, 26, ['cccccc']);
  return toRows(f);
})();

const CLOTHES_SCORPIO = (() => {
  const f = blankFrame();
  // 高领紧身 + 鱼尾裙
  stampFrame(f, 9, 15, ['cccccccc']);
  stampFrame(f, 9, 16, ['cccccccc']);
  stampFrame(f, 8, 17, ['cccccccccc']);
  stampFrame(f, 8, 18, ['cccccccccc']);
  stampFrame(f, 8, 19, ['cccccccccc']);
  stampFrame(f, 8, 20, ['cccccccccc']);
  stampFrame(f, 8, 21, ['cccccccccc']);
  stampFrame(f, 9, 22, ['cccccccc']);
  stampFrame(f, 9, 23, ['cccccccc']);
  stampFrame(f, 9, 24, ['cccccccc']);
  stampFrame(f, 8, 25, ['cccccccccc']);
  stampFrame(f, 7, 26, ['cccccccccccc']);
  return toRows(f);
})();

const CLOTHES_SAG = (() => {
  const f = blankFrame();
  // 运动短裙 + 腰带
  stampFrame(f, 7, 16, ['ffccccccccccff']);
  stampFrame(f, 7, 17, ['ffccccccccccff']);
  stampFrame(f, 7, 18, ['ffccccccccccff']);
  stampFrame(f, 8, 19, ['dddddddddd']);
  stampFrame(f, 8, 20, ['cccccccccc']);
  stampFrame(f, 9, 21, ['cccccccc']);
  stampFrame(f, 10, 22, ['cccccc']);
  stampFrame(f, 11, 23, ['cccc']);
  return toRows(f);
})();

const CLOTHES_CAP = (() => {
  const f = blankFrame();
  // 西装翻领 + 一步裙
  stampFrame(f, 8, 16, ['cccccccccc']);
  stampFrame(f, 8, 17, ['c........c']);
  stampFrame(f, 8, 18, ['cccccccccc']);
  stampFrame(f, 7, 19, ['ffccccccccccff']);
  stampFrame(f, 9, 20, ['cccccccc']);
  stampFrame(f, 9, 21, ['cccccccc']);
  stampFrame(f, 9, 22, ['cccccccc']);
  stampFrame(f, 9, 23, ['cccccccc']);
  stampFrame(f, 9, 24, ['cccccccc']);
  stampFrame(f, 9, 25, ['cccccccc']);
  stampFrame(f, 9, 26, ['cccccccc']);
  return toRows(f);
})();

const CLOTHES_AQUA = (() => {
  const f = blankFrame();
  // 白色水手领 + 蓝条裙
  stampFrame(f, 8, 15, ['wwwwwwwwww']);
  stampFrame(f, 8, 16, ['w..cccc..w']);
  stampFrame(f, 8, 17, ['w..cccc..w']);
  stampFrame(f, 7, 18, ['ffccccccccccff']);
  stampFrame(f, 7, 19, ['ffccccccccccff']);
  stampFrame(f, 8, 20, ['cccccccccc']);
  stampFrame(f, 8, 21, ['bbbbbbbbbb']);
  stampFrame(f, 8, 22, ['cccccccccc']);
  stampFrame(f, 9, 23, ['bbbbbbbb']);
  stampFrame(f, 9, 24, ['cccccccc']);
  stampFrame(f, 10, 25, ['bbbbbb']);
  stampFrame(f, 10, 26, ['cccccc']);
  return toRows(f);
})();

const CLOTHES_PIS = (() => {
  const f = blankFrame();
  // 泡泡袖 + 蓬蓬裙
  stampFrame(f, 6, 16, ['.cccccccccccccc.']);
  stampFrame(f, 6, 17, ['.cccccccccccccc.']);
  stampFrame(f, 7, 18, ['ffccccccccccff']);
  stampFrame(f, 7, 19, ['ffccccccccccff']);
  stampFrame(f, 6, 20, ['cccccccccccccc']);
  stampFrame(f, 6, 21, ['cccccccccccccc']);
  stampFrame(f, 6, 22, ['cccccccccccccc']);
  stampFrame(f, 7, 23, ['cccccccccccc']);
  stampFrame(f, 7, 24, ['cccccccccccc']);
  stampFrame(f, 8, 25, ['cccccccccc']);
  stampFrame(f, 9, 26, ['cccccccc']);
  return toRows(f);
})();

// 穿搭定义：need = 解锁所需累计学习秒数（每个星座 = 发色 + 专属服装款式 + 特征 + 头饰）
// 统一规则：白羊默认解锁，其余星座均需 1 小时（3600 秒）
const PET_OUTFITS = [
  { id: 'aries', name: '白羊座', emoji: '♈', need: 0, colors: Object.assign({}, MOCHI_BASE, { h: '#f7f2e8', c: '#ffffff', w: '#ffffff' }), hat: HAT_ARIES, feature: FEAT_ARIES, hair: HAIR_ARIES },
  { id: 'taurus', name: '金牛座', emoji: '♉', need: 3600, colors: Object.assign({}, MOCHI_BASE, { h: '#b07a4f', c: '#f0d9a8', b: '#8d5a3a', y: '#ffd93d' }), hat: HAT_TAURUS, feature: FEAT_TAURUS, hair: HAIR_TAURUS },
  { id: 'gemini', name: '双子座', emoji: '♊', need: 3600, colors: Object.assign({}, MOCHI_BASE, { h: '#6fa8dc', c: '#d8ecf7', b: '#6fa8dc', p: '#ff8ab3' }), hat: HAT_GEMINI, feature: FEAT_GEMINI, hair: HAIR_GEMINI },
  { id: 'cancer', name: '巨蟹座', emoji: '♋', need: 3600, colors: Object.assign({}, MOCHI_BASE, { h: '#c96a5a', c: '#ffd9d9', r: '#ff6b6b' }), hat: HAT_CANCER, feature: FEAT_CANCER, hair: HAIR_CANCER },
  { id: 'leo', name: '狮子座', emoji: '♌', need: 3600, colors: Object.assign({}, MOCHI_BASE, { h: '#ffc94d', c: '#ffe9a8', y: '#ffd93d', o: '#ffb347', w: '#ffffff' }), hat: HAT_LEO, feature: FEAT_LEO, hair: HAIR_LEO },
  { id: 'virgo', name: '处女座', emoji: '♍', need: 3600, colors: Object.assign({}, MOCHI_BASE, { h: '#f2a8c8', c: '#ffe4ee', p: '#ff8ab3', y: '#ffd93d', w: '#ffffff' }), hat: HAT_VIRGO, feature: FEAT_VIRGO, hair: HAIR_VIRGO },
  { id: 'libra', name: '天秤座', emoji: '♎', need: 3600, colors: Object.assign({}, MOCHI_BASE, { h: '#e8cf9a', c: '#f5efe0', y: '#ffd93d' }), hat: HAT_LIBRA, feature: FEAT_LIBRA, hair: HAIR_LIBRA },
  { id: 'scorpio', name: '天蝎座', emoji: '♏', need: 3600, colors: Object.assign({}, MOCHI_BASE, { h: '#9b6bff', c: '#e8d8ff', v: '#9b6bff' }), hat: HAT_SCORPIO, feature: FEAT_SCORPIO, hair: HAIR_SCORPIO },
  { id: 'sag', name: '射手座', emoji: '♐', need: 3600, colors: Object.assign({}, MOCHI_BASE, { h: '#7fbf6f', c: '#dff0d8', g: '#6fcf6f' }), hat: HAT_SAG, feature: FEAT_SAG, hair: HAIR_SAG },
  { id: 'capricorn', name: '摩羯座', emoji: '♑', need: 3600, colors: Object.assign({}, MOCHI_BASE, { h: '#7a5a3a', c: '#e0d6c5', b: '#8d5a3a' }), hat: HAT_CAP, feature: FEAT_CAP, hair: HAIR_CAP },
  { id: 'aquarius', name: '水瓶座', emoji: '♒', need: 3600, colors: Object.assign({}, MOCHI_BASE, { h: '#7ec8f0', c: '#e0f2fc', b: '#6fa8dc', w: '#ffffff' }), hat: HAT_AQUA, feature: FEAT_AQUA, hair: HAIR_AQUA },
  { id: 'pisces', name: '双鱼座', emoji: '♓', need: 3600, colors: Object.assign({}, MOCHI_BASE, { h: '#8a9df0', c: '#dce8fc', b: '#6fa8dc', p: '#ff8ab3' }), hat: HAT_PIS, feature: FEAT_PIS, hair: HAIR_PIS }
];

// ============ 发饰系统（可自由搭配的小饰品，叠加在星座形象最上层） ============
const DECOR_BOW = (() => {
  const f = blankFrame();
  // 粉色蝴蝶结（头顶偏右）
  stampFrame(f, 18, 0, ['p.p', 'ppp', 'p.p']);
  stampFrame(f, 19, 1, ['r']);
  return toRows(f);
})();

const DECOR_FLOWER = (() => {
  const f = blankFrame();
  // 小花（头顶中间）
  stampFrame(f, 15, 0, ['p']);
  stampFrame(f, 14, 1, ['pyp']);
  stampFrame(f, 15, 2, ['p']);
  return toRows(f);
})();

const DECOR_STAR = (() => {
  const f = blankFrame();
  // 星星发夹
  stampFrame(f, 15, 0, ['.y.']);
  stampFrame(f, 14, 1, ['yWy']);
  stampFrame(f, 15, 2, ['.y.']);
  return toRows(f);
})();

const DECOR_HEART = (() => {
  const f = blankFrame();
  // 爱心发夹
  stampFrame(f, 15, 0, ['pp']);
  stampFrame(f, 14, 1, ['wpp']);
  stampFrame(f, 15, 2, ['p']);
  return toRows(f);
})();

const DECOR_SPROUT = (() => {
  const f = blankFrame();
  // 呆毛（头顶翘起）
  stampFrame(f, 14, 0, ['g']);
  stampFrame(f, 15, 0, ['g']);
  stampFrame(f, 16, 1, ['g']);
  return toRows(f);
})();

const DECOR_CATEAR = (() => {
  const f = blankFrame();
  // 猫耳（两侧小三角）
  stampFrame(f, 9, 0, ['o.']);
  stampFrame(f, 8, 1, ['oo']);
  stampFrame(f, 22, 0, ['o.']);
  stampFrame(f, 21, 1, ['oo']);
  return toRows(f);
})();

const DECOR_RABBIT = (() => {
  const f = blankFrame();
  // 兔耳（两侧长耳朵）
  stampFrame(f, 9, 0, ['pp', 'pp', 'pp', 'pp']);
  stampFrame(f, 9, 4, ['p.']);
  stampFrame(f, 10, 1, ['w', 'w', 'w']);
  stampFrame(f, 22, 0, ['pp', 'pp', 'pp', 'pp']);
  stampFrame(f, 21, 4, ['.p']);
  stampFrame(f, 21, 1, ['w', 'w', 'w']);
  return toRows(f);
})();

const DECOR_CROWN = (() => {
  const f = blankFrame();
  // 皇冠 + 宝石
  stampFrame(f, 15, 0, ['.y.']);
  stampFrame(f, 14, 1, ['yyy']);
  stampFrame(f, 13, 2, ['yyyyy']);
  stampFrame(f, 12, 3, ['yyyyyyy']);
  stampFrame(f, 15, 3, ['r']);
  return toRows(f);
})();

const DECOR_HEADPHONE = (() => {
  const f = blankFrame();
  // 耳机（头带 + 两侧耳罩）
  stampFrame(f, 7, 2, ['bbbbbbbbbbbbbbbbbb']);
  stampFrame(f, 7, 3, ['b']);
  stampFrame(f, 24, 3, ['b']);
  stampFrame(f, 7, 4, ['B']);
  stampFrame(f, 24, 4, ['B']);
  return toRows(f);
})();

const DECOR_CLOVER = (() => {
  const f = blankFrame();
  // 幸运草（四叶）
  stampFrame(f, 14, 0, ['g.g']);
  stampFrame(f, 14, 1, ['ggg']);
  stampFrame(f, 14, 2, ['g.g']);
  return toRows(f);
})();

const DECOR_HORNS = (() => {
  const f = blankFrame();
  // 小恶魔角
  stampFrame(f, 8, 0, ['r']);
  stampFrame(f, 9, 1, ['r']);
  stampFrame(f, 23, 0, ['r']);
  stampFrame(f, 22, 1, ['r']);
  return toRows(f);
})();

const DECOR_HALO = (() => {
  const f = blankFrame();
  // 天使光环（漂浮头顶）
  stampFrame(f, 11, 0, ['.yyyyyyyy.']);
  stampFrame(f, 12, 1, ['y......y']);
  return toRows(f);
})();

// 发饰定义：need = 解锁所需累计学习秒数；frame 叠加在星座形象最上层
const PET_DECORS = [
  { id: 'none', name: '无发饰', emoji: '🚫', need: 0, frame: null, colors: null },
  { id: 'bow', name: '蝴蝶结', emoji: '🎀', need: 0, frame: DECOR_BOW, colors: { p: '#ff8ab3', r: '#ff5c8a' } },
  { id: 'flower', name: '小花', emoji: '🌸', need: 300, frame: DECOR_FLOWER, colors: { p: '#ff8ab3', y: '#ffd93d' } },
  { id: 'star', name: '星星夹', emoji: '⭐', need: 600, frame: DECOR_STAR, colors: { y: '#ffd93d', W: '#fff6c9' } },
  { id: 'heart', name: '爱心夹', emoji: '💗', need: 1200, frame: DECOR_HEART, colors: { p: '#ff5c8a', w: '#ffffff' } },
  { id: 'sprout', name: '呆毛', emoji: '🌱', need: 1800, frame: DECOR_SPROUT, colors: { g: '#6fcf6f' } },
  { id: 'catear', name: '猫耳', emoji: '🐱', need: 2400, frame: DECOR_CATEAR, colors: { o: '#ffb347' } },
  { id: 'rabbit', name: '兔耳', emoji: '🐰', need: 3600, frame: DECOR_RABBIT, colors: { p: '#ff8ab3', w: '#ffffff' } },
  { id: 'crown', name: '皇冠', emoji: '👑', need: 5400, frame: DECOR_CROWN, colors: { y: '#ffd93d', r: '#ff5c8a' } },
  { id: 'headphone', name: '耳机', emoji: '🎧', need: 7200, frame: DECOR_HEADPHONE, colors: { b: '#6fa8dc', B: '#3d7ec2' } },
  { id: 'clover', name: '幸运草', emoji: '🍀', need: 10800, frame: DECOR_CLOVER, colors: { g: '#6fcf6f' } },
  { id: 'horns', name: '恶魔角', emoji: '😈', need: 14400, frame: DECOR_HORNS, colors: { r: '#ff6b6b' } },
  { id: 'halo', name: '天使环', emoji: '😇', need: 21600, frame: DECOR_HALO, colors: { y: '#ffd93d' } }
];

let petDecorId = localStorage.getItem('pet-decor') || 'none';

function currentDecor() {
  for (let i = 0; i < PET_DECORS.length; i++) {
    if (PET_DECORS[i].id === petDecorId) return PET_DECORS[i];
  }
  return PET_DECORS[0];
}

const PET_PRAISE = ['好棒！', '真厉害！', '继续加油！', '星座来啦！'];
const PET_COMFORT = ['别灰心！', '再试一次！', '加油哦~', '有我在！'];

let petState = 'idle';
let petBlink = false;
let petTimeout = null;
let petBubbleTimer = null;
let petTotalSec = parseInt(localStorage.getItem('pet-time') || '0', 10) || 0;
let petOutfitId = localStorage.getItem('pet-outfit') || 'aries';
// 解锁余额制（清零重计）：petBalance = 自上次解锁以来可用的秒数；解锁物品时扣除其 need，不能叠加到下一个
let petBalance = parseInt(localStorage.getItem('pet-balance') || '0', 10) || 0;
let petUnlocked = (function () {
  try { return JSON.parse(localStorage.getItem('pet-unlocked') || '[]'); } catch (e) { return []; }
})();
let petPrevBalance = petBalance;
let petCheatReset = false;

// 已解锁判定：need===0 的默认项总是解锁；其余看 petUnlocked 列表
function isPetUnlocked(id, need) {
  return need === 0 || petUnlocked.indexOf(id) !== -1;
}
// 解锁：余额足够则扣除 need 并标记已解锁（返回是否成功）
function unlockPetItem(id, need) {
  if (isPetUnlocked(id, need)) return true;
  if (petBalance < need) return false;
  petBalance -= need;
  petUnlocked.push(id);
  localStorage.setItem('pet-balance', String(petBalance));
  localStorage.setItem('pet-unlocked', JSON.stringify(petUnlocked));
  return true;
}
// 下一个可解锁项（未解锁中 need 最小的）
function nextPetReady() {
  let best = null;
  const consider = (item) => {
    if (isPetUnlocked(item.id, item.need)) return;
    if (!best || item.need < best.need) best = item;
  };
  PET_OUTFITS.forEach(o => consider(o));
  PET_DECORS.forEach(d => consider(d));
  PET_FOODS.forEach(f => consider({ id: f.food, name: f.food, emoji: f.food, need: f.need }));
  return best;
}

function currentOutfit() {
  for (let i = 0; i < PET_OUTFITS.length; i++) {
    if (PET_OUTFITS[i].id === petOutfitId) return PET_OUTFITS[i];
  }
  return PET_OUTFITS[0];
}

function drawFrame(ctx, frame, colors) {
  for (let y = 0; y < PET_SIZE; y++) {
    const row = frame[y];
    if (!row) continue;
    for (let x = 0; x < PET_SIZE; x++) {
      const ch = row[x];
      if (ch === '.' || ch === ' ') continue;
      const col = colors[ch];
      if (col) {
        ctx.fillStyle = col;
        ctx.fillRect(x * 4, y * 4, 4, 4);
      }
    }
  }
}

function renderPet(faceFrame) {
  const ctx = $('petCanvas').getContext('2d');
  ctx.clearRect(0, 0, 128, 128);
  const o = currentOutfit();
  drawFrame(ctx, faceFrame, o.colors);
  if (o.hair) drawFrame(ctx, o.hair, o.colors);
  if (o.feature) drawFrame(ctx, o.feature, o.colors);
  if (o.hat) drawFrame(ctx, o.hat, o.colors);
  // 发饰叠加在最上层
  const d = currentDecor();
  if (d && d.frame) drawFrame(ctx, d.frame, d.colors);
}

function showPetBubble(text, ms) {
  const b = $('petBubble');
  b.textContent = text;
  b.classList.remove('hidden');
  clearTimeout(petBubbleTimer);
  petBubbleTimer = setTimeout(() => b.classList.add('hidden'), ms || 1200);
}

function setPetState(state) {
  clearTimeout(petTimeout);
  petState = state;
  const pet = $('pet');
  if (state === 'typing') {
    pet.className = 'pet pet-typing';
    renderPet(FACE_FOCUS);
    petTimeout = setTimeout(() => setPetState('idle'), 250);
  } else if (state === 'correct') {
    pet.className = 'pet pet-correct';
    renderPet(randomItem([FACE_HAPPY, FACE_LOVE, FACE_SPARKLE, FACE_GIGGLE]));
    showPetBubble(randomItem(PET_PRAISE));
    petTimeout = setTimeout(() => setPetState('idle'), 1200);
  } else if (state === 'wrong') {
    pet.className = 'pet pet-wrong';
    renderPet(randomItem([FACE_SAD, FACE_SWEAT, FACE_CRY, FACE_ANGRY]));
    showPetBubble(randomItem(PET_COMFORT));
    petTimeout = setTimeout(() => setPetState('idle'), 1200);
  } else if (state === 'surprised') {
    pet.className = 'pet pet-correct';
    renderPet(FACE_SURPRISED);
    showPetBubble('✨ 哇，新星座解锁啦！', 2000);
    petTimeout = setTimeout(() => setPetState('idle'), 2000);
  } else if (state === 'love') {
    pet.className = 'pet pet-correct';
    renderPet(FACE_LOVE);
    showPetBubble('💕 好喜欢！', 1500);
    petTimeout = setTimeout(() => setPetState('idle'), 1500);
  } else if (state === 'star') {
    pet.className = 'pet pet-correct';
    renderPet(FACE_STAR);
    showPetBubble('✨ 焕然一新！', 1400);
    petTimeout = setTimeout(() => setPetState('idle'), 1400);
  } else if (state === 'angry') {
    pet.className = 'pet pet-wrong';
    renderPet(FACE_ANGRY);
    showPetBubble('哼！', 1200);
    petTimeout = setTimeout(() => setPetState('idle'), 1400);
  } else if (state === 'cry') {
    pet.className = 'pet pet-wrong';
    renderPet(FACE_CRY);
    showPetBubble('呜呜…', 1400);
    petTimeout = setTimeout(() => setPetState('idle'), 1600);
  } else if (state === 'shy') {
    pet.className = 'pet pet-idle';
    renderPet(FACE_SHY);
    showPetBubble('害羞啦~', 1200);
    petTimeout = setTimeout(() => setPetState('idle'), 1500);
  } else if (state === 'giggle') {
    pet.className = 'pet pet-correct';
    renderPet(FACE_GIGGLE);
    showPetBubble('嘿嘿~', 1200);
    petTimeout = setTimeout(() => setPetState('idle'), 1300);
  } else if (state === 'daze') {
    pet.className = 'pet pet-idle';
    renderPet(FACE_DAZE);
    showPetBubble('…发呆中', 1500);
    petTimeout = setTimeout(() => setPetState('idle'), 1800);
  } else if (state === 'dizzy') {
    pet.className = 'pet pet-wrong';
    renderPet(FACE_DIZZY);
    showPetBubble('好晕…', 1200);
    petTimeout = setTimeout(() => setPetState('idle'), 1500);
  } else if (state === 'sparkle') {
    pet.className = 'pet pet-correct';
    renderPet(FACE_SPARKLE);
    showPetBubble('✨ 闪闪发亮！', 1400);
    petTimeout = setTimeout(() => setPetState('idle'), 1500);
  } else if (state === 'sweat') {
    pet.className = 'pet pet-wrong';
    renderPet(FACE_SWEAT);
    showPetBubble('好难呀…', 1200);
    petTimeout = setTimeout(() => setPetState('idle'), 1400);
  } else if (state === 'tired') {
    pet.className = 'pet pet-idle';
    renderPet(FACE_TIRED);
    petTimeout = setTimeout(() => setPetState('idle'), 2000);
  } else if (state === 'wink') {
    pet.className = 'pet pet-idle';
    renderPet(FACE_WINK);
    petTimeout = setTimeout(() => setPetState('idle'), 350);
  } else {
    pet.className = 'pet pet-idle';
    renderPet(petBlink ? FACE_CLOSED : FACE_OPEN);
  }
}

function formatPetTime(sec) {
  if (sec < 60) return sec + ' 秒';
  const m = Math.floor(sec / 60);
  if (m < 60) return m + ' 分钟';
  const h = Math.floor(m / 60);
  return h + ' 小时 ' + (m % 60) + ' 分';
}

// 累计学习时间（打字测试 + 英语学习进行中时每秒 +1）
function petIsLearning() {
  return !!learnState && !learnState.finished;
}

function renderWardrobe() {
  $('petTimeLabel').textContent = '⏱️ 累计学习 ' + formatPetTime(petTotalSec) + ' · 🔋 可用 ' + formatPetTime(petBalance);
  const next = nextPetReady();
  if (next) {
    const pct = Math.round((petBalance / next.need) * 100);
    $('petTimeBar').style.width = Math.min(100, pct) + '%';
    $('petNextUnlock').textContent = '下一个：' + next.emoji + ' ' + next.name + '（还需 ' + formatPetTime(Math.max(0, next.need - petBalance)) + '）';
  } else {
    $('petTimeBar').style.width = '100%';
    $('petNextUnlock').textContent = '🎉 全部已解锁！';
  }
  const grid = $('petOutfitGrid');
  grid.innerHTML = '';
  PET_OUTFITS.forEach(o => {
    const unlocked = isPetUnlocked(o.id, o.need);
    const ready = !unlocked && petBalance >= o.need;
    const item = document.createElement('button');
    item.className = 'pet-outfit-item' + (o.id === petOutfitId ? ' active' : '') + (unlocked ? '' : (ready ? ' ready' : ' locked'));
    item.innerHTML =
      '<span class="pet-outfit-preview">' + o.emoji + '</span>' +
      '<span class="pet-outfit-name">' + o.name + '</span>' +
      '<span class="pet-outfit-need">' + (unlocked ? (o.need === 0 ? '默认' : '✓ 已解锁') : (ready ? '🔓 点击解锁' : '🔒 还需 ' + formatPetTime(o.need - petBalance))) + '</span>';
    if (unlocked) {
      item.addEventListener('click', () => {
        petOutfitId = o.id;
        localStorage.setItem('pet-outfit', o.id);
        renderWardrobe();
        setPetState('star');
        showPetBubble('换上 ' + o.name + '！', 1500);
      });
    } else if (ready) {
      item.addEventListener('click', () => {
        if (unlockPetItem(o.id, o.need)) {
          petOutfitId = o.id;
          localStorage.setItem('pet-outfit', o.id);
          renderWardrobe();
          setPetState('surprised');
          showPetBubble('🎉 解锁 ' + o.name + '！（消耗 ' + formatPetTime(o.need) + '）', 2000);
        }
      });
    }
    grid.appendChild(item);
  });
  renderDecorGrid();
}

function renderDecorGrid() {
  const grid = $('petDecorGrid');
  grid.innerHTML = '';
  PET_DECORS.forEach((d) => {
    const unlocked = isPetUnlocked(d.id, d.need);
    const ready = !unlocked && petBalance >= d.need;
    const item = document.createElement('button');
    item.className = 'pet-decor-item' + (d.id === petDecorId ? ' active' : '') + (unlocked ? '' : (ready ? ' ready' : ' locked'));
    item.innerHTML =
      '<span class="pet-decor-emoji">' + d.emoji + '</span>' +
      '<span class="pet-decor-name">' + d.name + '</span>' +
      '<span class="pet-decor-need">' + (unlocked ? (d.need === 0 ? '默认' : '✓') : (ready ? '🔓 点击解锁' : '🔒 ' + formatPetTime(d.need - petBalance))) + '</span>';
    if (unlocked) {
      item.addEventListener('click', () => {
        petDecorId = d.id;
        localStorage.setItem('pet-decor', d.id);
        renderDecorGrid();
        setPetState('star');
        showPetBubble(d.id === 'none' ? '摘下发饰~' : '戴上 ' + d.name + '！', 1500);
      });
    } else if (ready) {
      item.addEventListener('click', () => {
        if (unlockPetItem(d.id, d.need)) {
          petDecorId = d.id;
          localStorage.setItem('pet-decor', d.id);
          renderDecorGrid();
          setPetState('surprised');
          showPetBubble('🎉 解锁 ' + d.name + '！（消耗 ' + formatPetTime(d.need) + '）', 2000);
        }
      });
    }
    grid.appendChild(item);
  });
}

function openPetWardrobe() {
  renderWardrobe();
  $('petModal').classList.remove('hidden');
}

// ============ 投喂系统 ============
let petFeedCount = parseInt(localStorage.getItem('pet-feed') || '0', 10) || 0;
// 食物按累计学习时间解锁：need = 解锁所需秒数
const PET_FOODS = [
  { food: '🍎', need: 300,   react: ['嗯~好脆！', '苹果最棒了！'] },
  { food: '🍰', need: 900,   react: ['哇，蛋糕！', '甜到心里~'] },
  { food: '🍙', need: 1800,  react: ['饭团团~', '好香呀！'] },
  { food: '🍬', need: 3600,  react: ['甜甜的！', '再来一颗~'] },
  { food: '🥛', need: 7200,  react: ['咕嘟咕嘟~', '补钙长高高！'] },
  { food: '🍜', need: 14400, react: ['吸溜吸溜~', '拉面好香呀！'] }
];

// ============ 解锁规则迁移：清零重计（不叠加） ============
(function migratePetUnlocks() {
  if (petTotalSec >= 500000) {
    // 破解模式（超大累计时间）→ 恢复正常真实计时，全部重新解锁
    petTotalSec = 0;
    petBalance = 0;
    petUnlocked = ['aries', 'none', 'bow'];
    petOutfitId = 'aries';
    petDecorId = 'none';
    petPrevBalance = 0;
    localStorage.setItem('pet-time', '0');
    localStorage.setItem('pet-balance', '0');
    localStorage.setItem('pet-unlocked', JSON.stringify(petUnlocked));
    localStorage.setItem('pet-outfit', 'aries');
    localStorage.setItem('pet-decor', 'none');
    petCheatReset = true;
  } else {
    // 正常数据：把旧“累计解锁”的项标记为已解锁；可用余额从 0 重计（已消耗的时间不叠加）
    const saved = petUnlocked.slice();
    const add = (id) => { if (saved.indexOf(id) === -1) saved.push(id); };
    PET_OUTFITS.forEach(o => { if (o.need > 0 && o.need <= petTotalSec) add(o.id); });
    PET_DECORS.forEach(d => { if (d.need > 0 && d.need <= petTotalSec) add(d.id); });
    PET_FOODS.forEach(f => { if (f.need > 0 && f.need <= petTotalSec) add(f.food); });
    petUnlocked = saved;
    petBalance = 0;
    petPrevBalance = 0;
    localStorage.setItem('pet-unlocked', JSON.stringify(petUnlocked));
    localStorage.setItem('pet-balance', '0');
  }
})();

function openPetFeed() {
  renderPetFeed();
  $('petFeedPanel').classList.toggle('hidden');
}

function renderPetFeed() {
  const grid = $('petFeedGrid');
  grid.innerHTML = '';
  PET_FOODS.forEach((item) => {
    const unlocked = isPetUnlocked(item.food, item.need);
    const ready = !unlocked && petBalance >= item.need;
    const btn = document.createElement('button');
    btn.className = 'pet-food-btn' + (unlocked ? '' : (ready ? ' ready' : ' locked'));
    btn.dataset.food = item.food;
    btn.title = unlocked ? '投喂 ' + item.food : (ready ? '点击解锁并投喂' : '还需 ' + formatPetTime(item.need - petBalance) + ' 解锁');
    btn.textContent = (unlocked || ready) ? item.food : '🔒';
    if (unlocked) {
      btn.addEventListener('click', () => feedPet(item.food));
    } else if (ready) {
      btn.addEventListener('click', () => {
        if (unlockPetItem(item.food, item.need)) {
          renderPetFeed();
          setPetState('surprised');
          showPetBubble('🎉 解锁 ' + item.food + '！（消耗 ' + formatPetTime(item.need) + '）', 1800);
          feedPet(item.food);
        }
      });
    } else {
      btn.addEventListener('click', () => {
        showPetBubble('还需学习 ' + formatPetTime(item.need - petBalance) + ' 解锁 ' + item.food + ' 哦~', 1800);
      });
    }
    grid.appendChild(btn);
  });
  $('petFeedCount').textContent = '已投喂 ' + petFeedCount + ' 次';
  const next = PET_FOODS.find((f) => !isPetUnlocked(f.food, f.need));
  if (!next) {
    $('petFeedHint').textContent = '🎉 全部食物已解锁！';
  } else if (petBalance >= next.need) {
    $('petFeedHint').textContent = '🔓 ' + next.food + ' 可解锁，点击解锁并投喂！';
  } else {
    $('petFeedHint').textContent = '💡 解锁 ' + next.food + ' 还需 ' + formatPetTime(Math.max(0, next.need - petBalance));
  }
}

function feedPet(food) {
  petFeedCount++;
  localStorage.setItem('pet-feed', String(petFeedCount));
  $('petFeedCount').textContent = '已投喂 ' + petFeedCount + ' 次';
  // 投喂音效
  playFeedSound();
  // 每次吃随机不同表情
  setPetState(randomItem(['love', 'star', 'surprised', 'wink', 'correct', 'shy', 'giggle', 'sparkle', 'daze']));
  const item = PET_FOODS.find((f) => f.food === food);
  const reacts = item ? item.react : ['好吃！'];
  showPetBubble(randomItem(reacts) + ' ' + food, 1600);
}

function setupPet() {
  setPetState('idle');
  // 待机表情：普通眨眼 / 俏皮单眼眨眼 / 偶尔困倦
  setInterval(() => {
    if (petState !== 'idle') return;
    const roll = Math.random();
    if (roll < 0.7) {
      petBlink = true;
      renderPet(FACE_CLOSED);
      setTimeout(() => {
        petBlink = false;
        if (petState === 'idle') renderPet(FACE_OPEN);
      }, 180);
    } else if (roll < 0.9) {
      setPetState('wink');
    } else {
      setPetState(randomItem(['tired', 'giggle', 'daze']));
    }
  }, 2800);
  // 衣橱入口
  $('petWardrobeBtn').addEventListener('click', openPetWardrobe);
  $('pet').addEventListener('click', openPetFeed);
  $('petCloseBtn').addEventListener('click', () => $('petModal').classList.add('hidden'));
  $('petModal').addEventListener('click', (e) => {
    if (e.target === $('petModal')) $('petModal').classList.add('hidden');
  });
  // 投喂（食物按钮在 renderPetFeed 中动态生成）
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.pet-feed-panel') && !e.target.closest('#pet') && !e.target.closest('.pet-bubble')) {
      $('petFeedPanel').classList.add('hidden');
    }
  });
  // 累计学习时间：总时间继续累计，可用余额同步增长；解锁后余额扣除（清零重计，不叠加）
  setInterval(() => {
    if (!petIsLearning()) return;
    petTotalSec++;
    petBalance++;
    localStorage.setItem('pet-time', String(petTotalSec));
    localStorage.setItem('pet-balance', String(petBalance));
    // 刚攒够某个物品的时间时提示（不自动解锁，玩家自行选择）
    const next = nextPetReady();
    if (next && petPrevBalance < next.need && petBalance >= next.need) {
      showPetBubble('🔔 可用时间够了！去衣橱解锁 ' + next.emoji + ' ' + next.name + ' 吧~', 2200);
    }
    petPrevBalance = petBalance;
  }, 1000);
  // 破解模式重置提示
  if (petCheatReset) {
    setTimeout(() => {
      showPetBubble('🔁 已恢复真实计时，重新开始解锁之旅！', 2600);
    }, 800);
  }
}

// ============ 账号系统（本机多账号，进度分开保存） ============
const ACC_CURRENT = 'acc-current';
const ACC_PREFIX = 'acc-';
const ACC_PROGRESS_KEYS = [
  'pet-time', 'pet-balance', 'pet-unlocked', 'pet-outfit', 'pet-decor', 'pet-feed',
  'learn-sound', 'learn-key-sound', 'typing-theme', 'learn-wrong',
  'learn-progress-cet4', 'learn-progress-cet6', 'learn-progress-phrases',
  'learn-progress-essay',
  'learn-mastery-cet4', 'learn-mastery-cet6', 'learn-mastery-phrases'
];

const CLOUD_TOKEN = 'cloud-token';
async function cloudRefresh() {
  const token = localStorage.getItem(CLOUD_TOKEN);
  if (!token) return false;
  try {
    const res = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }
    });
    if (!res.ok) { localStorage.removeItem(CLOUD_TOKEN); return false; }
    const body = await res.json();
    localStorage.setItem(CLOUD_TOKEN, body.token);
    return true;
  } catch (e) { return false; }
}
async function cloudRequest(path, options) {
  const opts = options || {};
  const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
  const token = localStorage.getItem(CLOUD_TOKEN);
  if (token) headers.Authorization = 'Bearer ' + token;
  let res;
  try {
    res = await fetch('/api' + path, Object.assign({}, opts, { headers }));
  } catch (e) {
    // 网络错误（后端未部署/不可达）：标记云端不可用，调用方可降级到本地账号
    const err = new Error('网络请求失败');
    err.cloudUnavailable = true;
    throw err;
  }
  // token 过期/被吊销：尝试刷新一次后重试
  if (res.status === 401 && !opts._retried && localStorage.getItem(CLOUD_TOKEN)) {
    const ok = await cloudRefresh();
    if (ok) return cloudRequest(path, Object.assign({}, opts, { _retried: true }));
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error || '网络请求失败');
    // 404：静态托管/未部署后端（如 Cloudflare Pages），视为云端不可用
    if (res.status === 404) err.cloudUnavailable = true;
    throw err;
  }
  return body;
}

async function cloudLogin(name, pass) {
  const body = await cloudRequest('/auth/login', { method: 'POST', body: JSON.stringify({ username: name, password: pass }) });
  localStorage.setItem(CLOUD_TOKEN, body.token);
  localStorage.setItem(ACC_CURRENT, body.username);
  accApply(body.progress || {});
}

async function cloudRegister(name, pass, agreed) {
  const body = await cloudRequest('/auth/register', { method: 'POST', body: JSON.stringify({ username: name.trim(), password: pass, agreed: !!agreed }) });
  localStorage.setItem(CLOUD_TOKEN, body.token);
  localStorage.setItem(ACC_CURRENT, body.username);
  await cloudSync();
}

async function cloudSync() {
  if (!localStorage.getItem(CLOUD_TOKEN)) return;
  try {
    await cloudRequest('/progress', { method: 'PUT', body: JSON.stringify({ progress: accCollect() }) });
  } catch (e) {
    console.warn('云端进度同步失败:', e.message);
  }
}

function accUserName() { return localStorage.getItem(ACC_CURRENT) || ''; }
function accIsLoggedIn() { return !!accUserName(); }

function accRead(name) {
  try { return JSON.parse(localStorage.getItem(ACC_PREFIX + name) || 'null'); }
  catch (e) { return null; }
}

// 打包当前全部进度键
function accCollect() {
  const data = {};
  ACC_PROGRESS_KEYS.forEach(k => {
    const v = localStorage.getItem(k);
    if (v !== null) data[k] = v;
  });
  return data;
}

// 把账号数据写回进度键
function accApply(data) {
  Object.keys(data).forEach(k => localStorage.setItem(k, data[k]));
}

// 保存当前进度到账号
function accSave(name) {
  const acc = accRead(name) || { created: Date.now() };
  acc.data = accCollect();
  localStorage.setItem(ACC_PREFIX + name, JSON.stringify(acc));
}

// ---- 密码工具：强度校验 + PBKDF2 哈希（避免明文存储）----
function validatePasswordStrength(pass) {
  if (!pass) return '❌ 请输入密码~';
  if (pass.length < 6) return '❌ 密码至少 6 位~';
  if (!/[A-Za-z]/.test(pass) || !/\d/.test(pass)) return '❌ 密码需同时包含字母和数字~';
  return '';
}

const PBKDF2_ITER = 100000;
function bytesToHex(bytes) { return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join(''); }
function hexToBytes(hex) { const arr = new Uint8Array(hex.length / 2); for (let i = 0; i < arr.length; i++) arr[i] = parseInt(hex.substr(i * 2, 2), 16); return arr; }
async function hashPassword(pass) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: PBKDF2_ITER, hash: 'SHA-256' }, keyMaterial, 256);
  return 'pbkdf2$' + bytesToHex(salt) + '$' + bytesToHex(bits);
}
async function verifyPassword(pass, stored) {
  if (!stored) return false;
  // 兼容旧明文账号：登录成功后由 accLogin 自动迁移为哈希
  if (stored.indexOf('pbkdf2$') !== 0) return stored === pass;
  const parts = stored.split('$');
  if (parts.length !== 3) return false;
  try {
    const salt = hexToBytes(parts[1]);
    const keyMaterial = await crypto.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: PBKDF2_ITER, hash: 'SHA-256' }, keyMaterial, 256);
    return bytesToHex(bits) === parts[2];
  } catch (e) { return false; }
}

// 登录：验证账号并加载其进度
async function accLogin(name, pass) {
  const acc = accRead(name);
  // 统一提示，不泄露账号是否存在
  if (!acc) return '❌ 账号或密码不正确~';
  const ok = await verifyPassword(pass, acc.password);
  if (!ok) return '❌ 账号或密码不正确~';
  // 旧明文账号：登录成功后自动迁移为哈希存储
  if (acc.password && acc.password.indexOf('pbkdf2$') !== 0) {
    acc.password = await hashPassword(pass);
    localStorage.setItem(ACC_PREFIX + name, JSON.stringify(acc));
  }
  if (!acc.data || !Object.keys(acc.data).length) {
    // 首次登录：把当前游客进度存入账号
    acc.data = accCollect();
    localStorage.setItem(ACC_PREFIX + name, JSON.stringify(acc));
  } else {
    accApply(acc.data);
  }
  localStorage.setItem(ACC_CURRENT, name);
  return '';
}

// 注册：创建账号并登录（游客进度归入新账号）
async function accRegister(name, pass) {
  name = name.trim();
  if (!name) return '❌ 请输入用户名~';
  if (!/^[A-Za-z0-9_\u4e00-\u9fa5]{1,12}$/.test(name)) return '❌ 用户名需为 1-12 位中英文 / 数字 / 下划线~';
  const strengthErr = validatePasswordStrength(pass);
  if (strengthErr) return strengthErr;
  if (accRead(name)) return '❌ 该用户名已被注册~';
  const passwordHash = await hashPassword(pass);
  localStorage.setItem(ACC_PREFIX + name, JSON.stringify({ password: passwordHash, created: Date.now(), data: accCollect() }));
  localStorage.setItem(ACC_CURRENT, name);
  return '';
}

// 修改密码：云端 / 本地（返回错误文案，成功返回空串）
async function cloudChangePassword(oldPass, newPass) {
  if (!localStorage.getItem(CLOUD_TOKEN)) return '❌ 当前未连接云端账号';
  try {
    await cloudRequest('/auth/password', { method: 'PUT', body: JSON.stringify({ oldPassword: oldPass, newPassword: newPass }) });
    return '';
  } catch (e) {
    // 云端不可用：降级到本地账号改密
    if (e && e.cloudUnavailable) return await accChangePassword(oldPass, newPass);
    return '❌ ' + e.message;
  }
}
async function accChangePassword(oldPass, newPass) {
  const name = accUserName();
  if (!name) return '❌ 未登录';
  const acc = accRead(name);
  if (!acc) return '❌ 账号不存在';
  const ok = await verifyPassword(oldPass, acc.password);
  if (!ok) return '❌ 当前密码不正确';
  acc.password = await hashPassword(newPass);
  localStorage.setItem(ACC_PREFIX + name, JSON.stringify(acc));
  return '';
}

// 登出：保存当前进度到账号，清空进度键回游客
function accLogout() {
  const name = accUserName();
  if (name) accSave(name);
  // 云端：通知服务端吊销当前 token（立即失效），fire-and-forget
  const token = localStorage.getItem(CLOUD_TOKEN);
  if (token) {
    fetch('/api/auth/logout', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token } }).catch(() => {});
  }
  cloudSync();
  localStorage.removeItem(ACC_CURRENT);
  localStorage.removeItem(CLOUD_TOKEN);
  ACC_PROGRESS_KEYS.forEach(k => localStorage.removeItem(k));
  // 清除学习进度存档，避免跨账号残留
  try {
    Object.keys(localStorage).forEach((k) => { if (k.indexOf('learn-session-') === 0) localStorage.removeItem(k); });
  } catch (e) {}
  location.reload();
}

function renderAccountPanel() {
  const name = accUserName();
  $('accountMsg').textContent = '';
  const changeArea = $('accountChangeArea');
  if (changeArea) changeArea.classList.toggle('hidden', !name);
  if (name) {
    $('accountTitle').textContent = '👤 ' + name;
    $('accountStatus').textContent = '✅ 已登录：' + name + '（进度已自动保存到本机）';
    $('accountStatus').classList.remove('hidden');
    $('accountLogoutBtn').classList.remove('hidden');
    $('accountUser').value = '';
    $('accountPass').value = '';
  } else {
    $('accountTitle').textContent = '👤 登录 / 注册';
    $('accountStatus').classList.add('hidden');
    $('accountLogoutBtn').classList.add('hidden');
  }
}

function setupAccount() {
  const btn = $('accountBtn');
  const name = accUserName();
  if (name) {
    btn.textContent = '👤 ' + name;
    btn.title = '账号：' + name + '（点击管理）';
    btn.classList.add('logged-in');
  }
  btn.addEventListener('click', () => {
    renderAccountPanel();
    $('accountModal').classList.remove('hidden');
  });
  $('accountCloseBtn').addEventListener('click', () => $('accountModal').classList.add('hidden'));
  $('accountModal').addEventListener('click', (e) => {
    if (e.target === $('accountModal')) $('accountModal').classList.add('hidden');
  });
  $('accountLoginBtn').addEventListener('click', async () => {
    const name = $('accountUser').value.trim();
    const pass = $('accountPass').value;
    try {
      await cloudLogin(name, pass);
      location.reload();
    } catch (e) {
      if (e && e.cloudUnavailable) {
        // 云端不可用（静态托管/未部署后端）：自动降级到本地账号
        const localErr = await accLogin(name, pass);
        if (localErr) $('accountMsg').textContent = localErr;
        else location.reload();
      } else {
        $('accountMsg').textContent = '❌ ' + e.message;
      }
    }
  });
  $('accountRegBtn').addEventListener('click', async () => {
    const name = $('accountUser').value.trim();
    const pass = $('accountPass').value;
    if (!/^[A-Za-z0-9_\u4e00-\u9fa5]{1,12}$/.test(name)) {
      $('accountMsg').textContent = '❌ 用户名需为 1-12 位中英文 / 数字 / 下划线~';
      return;
    }
    const strengthErr = validatePasswordStrength(pass);
    if (strengthErr) { $('accountMsg').textContent = strengthErr; return; }
    if (!$('accountAgree') || !$('accountAgree').checked) {
      $('accountMsg').textContent = '❌ 请先阅读并同意《用户协议》与《隐私政策》~';
      return;
    }
    try {
      await cloudRegister(name, pass, true);
      location.reload();
    } catch (e) {
      if (e && e.cloudUnavailable) {
        // 云端不可用（静态托管/未部署后端）：自动降级到本地账号
        const localErr = await accRegister(name, pass);
        if (localErr) $('accountMsg').textContent = localErr;
        else location.reload();
      } else {
        $('accountMsg').textContent = '❌ ' + e.message;
      }
    }
  });
  $('accountChangeBtn').addEventListener('click', async () => {
    const oldPass = $('accountOldPass').value;
    const newPass = $('accountNewPass').value;
    const newPass2 = $('accountNewPass2').value;
    const strengthErr = validatePasswordStrength(newPass);
    if (strengthErr) { $('accountMsg').textContent = strengthErr; return; }
    if (newPass !== newPass2) { $('accountMsg').textContent = '❌ 两次输入的新密码不一致~'; return; }
    const err = localStorage.getItem(CLOUD_TOKEN)
      ? await cloudChangePassword(oldPass, newPass)
      : await accChangePassword(oldPass, newPass);
    $('accountMsg').textContent = err || '✅ 密码修改成功！';
    if (!err) {
      $('accountOldPass').value = '';
      $('accountNewPass').value = '';
      $('accountNewPass2').value = '';
    }
  });
  $('accountLogoutBtn').addEventListener('click', () => {
    if (window.confirm('确定要登出吗？当前进度会保存到账号。')) accLogout();
  });
  $('accountPass').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') $('accountLoginBtn').click();
  });
  setInterval(cloudSync, 15000);
  window.addEventListener('beforeunload', cloudSync);
}

// ============ 初始化 ============
// 星空粒子背景：随机生成闪烁星星 + 漂浮光点
function initStars() {
  const box = $('bgStars');
  if (!box) return;
  let html = '';
  // 闪烁小星星（约 140 颗，随机位置/大小/节奏）
  for (let i = 0; i < 140; i++) {
    const x = (Math.random() * 100).toFixed(2);
    const y = (Math.random() * 100).toFixed(2);
    const size = (Math.random() < 0.8 ? 1 + Math.random() : 2 + Math.random() * 1.5).toFixed(2);
    const delay = (Math.random() * 6).toFixed(2);
    const dur = (3 + Math.random() * 5).toFixed(2);
    const op = (0.3 + Math.random() * 0.6).toFixed(2);
    html += '<i class="star" style="left:' + x + '%;top:' + y + '%;width:' + size + 'px;height:' + size + 'px;animation-delay:' + delay + 's;animation-duration:' + dur + 's;opacity:' + op + '"></i>';
  }
  // 漂浮光点（较大较柔和，缓慢游动）
  for (let i = 0; i < 14; i++) {
    const x = (Math.random() * 100).toFixed(2);
    const y = (Math.random() * 100).toFixed(2);
    const size = (3 + Math.random() * 5).toFixed(2);
    const delay = (Math.random() * 8).toFixed(2);
    const dur = (8 + Math.random() * 10).toFixed(2);
    html += '<i class="dust" style="left:' + x + '%;top:' + y + '%;width:' + size + 'px;height:' + size + 'px;animation-delay:' + delay + 's;animation-duration:' + dur + 's"></i>';
  }
  box.innerHTML = html;
}

function init() {
  setupTheme();
  initStars();
  setupLearn();
  // 离开页面时保存学习进度存档，刷新/关闭后返回可恢复
  window.addEventListener('beforeunload', saveLearnSession);
  setupPet();
  setupAccount();
  $('retryBtn').addEventListener('click', handleRetry);
  $('newTextBtn').addEventListener('click', handleNewText);
  // 预热语音引擎，减少首次发音延迟
  warmUpTTS();
  checkEnVoice();
  updateWrongBadge();
  // 词库从外部文件异步加载，加载完成后开始学习（优先恢复上次未完成的进度）
  loadVocab().then(() => {
    if (!restoreLearnSession(learnState.cat)) {
      startLearn();
    } else {
      startLearn(true);
    }
    learnInput.focus();
  });
}

document.addEventListener('DOMContentLoaded', init);

// ============ 英语词汇库 ============
const VOCAB = {
  cet4: [],
  cet6: [],
  phrases: [],
  // 作文句式 / 高分表达：数据内嵌在 essay-data.js（window.ESSAY_DATA），由 loadVocab 加载
  essay: [],
  // 作文范文：数据内嵌在 sample-data.js（window.SAMPLE_DATA），由 loadVocab 加载
  sample: []
};

// 词库数据文件（Tab 分隔 5 列：en \t phonetic \t cn \t example \t exampleCn，首行为表头）
const VOCAB_FILES = {
  cet4: 'cet4.tsv',
  cet6: 'cet6.tsv',
  phrases: 'phrases.tsv'
};
let vocabLoaded = false;

// 解析 TSV：跳过表头，返回词条数组
function parseTsv(text) {
  const words = [];
  const lines = text.split(/\r?\n/);
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const p = line.split('\t');
    if (p.length < 5) continue;
    const en = p[0].trim();
    if (!en) continue;
    words.push({
      en,
      phonetic: (p[1] || '').trim(),
      cn: (p[2] || '').trim(),
      example: (p[3] || '').trim(),
      exampleCn: (p[4] || '').trim(),
      synonym: (p[5] || '').trim(),
      root: (p[6] || '').trim()
    });
  }
  return words;
}

// 加载普通词表（长难句内联在 VOCAB 中）
// 优先使用内嵌词库 vocab-data.js（script 标签加载不受 file:// 下 CORS 拦截），
// 否则退回 fetch 外部 tsv（适用于本地服务器环境）。
async function loadVocab() {
  // 作文句式 / 高分表达：内嵌 essay-data.js（script 标签加载不受 file:// 下 CORS 拦截）
  if (typeof window !== 'undefined' && window.ESSAY_DATA) {
    VOCAB.essay = window.ESSAY_DATA.essay || [];
  }
  if (typeof window !== 'undefined' && window.SAMPLE_DATA) {
    VOCAB.sample = window.SAMPLE_DATA.sample || [];
  }
  if (typeof window !== 'undefined' && window.VOCAB_TSV) {
    Object.keys(VOCAB_FILES).forEach(function (key) {
      const tsv = window.VOCAB_TSV[key];
      VOCAB[key] = tsv ? parseTsv(tsv) : [];
    });
  } else {
    await Promise.all(Object.keys(VOCAB_FILES).map(async (key) => {
      try {
        const res = await fetch(VOCAB_FILES[key]);
        if (!res.ok) throw new Error('HTTP ' + res.status);
        VOCAB[key] = parseTsv(await res.text());
      } catch (e) {
        console.warn('词库加载失败: ' + key, e);
        VOCAB[key] = [];
      }
    }));
  }
  // 常用短语：独立 phrases-data.js 覆盖（桌面四六级资料，按源文件标题分组）
  // 优先使用新数据（每条带 title/level），兼容旧的 PHRASES_TSV
  if (typeof window !== 'undefined' && window.PHRASES_DATA) {
    VOCAB.phrases = (window.PHRASES_DATA || []).map((p) => ({
      en: p.en, phonetic: '', cn: p.cn, example: '', exampleCn: '',
      synonym: '', root: '', title: p.title || '', level: p.level || 'cet4'
    }));
  } else if (typeof window !== 'undefined' && window.PHRASES_TSV) {
    VOCAB.phrases = parseTsv(window.PHRASES_TSV);
  }
  vocabLoaded = true;
}

// ============ 学习状态 ============
const learnState = {
  cat: 'cet4',
  lmode: 'type',
  words: [],
  index: 0,
  mistakes: 0,
  startTime: null,
  revealed: false,
  sound: true,
  customWords: [],
  activeCat: ''   // 最近一次 startLearn 的分分类，用于判断目录弹窗关闭时是否已开始学习
};

// ============ 学习会话存档（离开界面保存，返回时恢复） ============
// 按分类存档：cet4/cet6/phrases 只存 en 列表（恢复时从词库映射，节省空间）；
// essay/sample/custom 存完整序列（结构特殊，无法简单映射）。错题本不存档（每次重新生成）。
function saveLearnSession() {
  const cat = learnState.cat;
  if (!cat || cat === 'wrong' || !Array.isArray(learnState.words) || learnState.words.length === 0) return;
  const isNormal = (cat === 'cet4' || cat === 'cet6' || cat === 'phrases');
  try {
    const payload = {
      cat: cat,
      lmode: learnState.lmode,
      index: learnState.index,
      mistakes: learnState.mistakes,
      customWords: learnState.customWords || [],
      savedAt: Date.now()
    };
    if (isNormal) {
      payload.ens = learnState.words.map((w) => w.en);
    } else {
      payload.words = learnState.words;
    }
    localStorage.setItem('learn-session-' + cat, JSON.stringify(payload));
  } catch (e) { /* 配额不足时静默忽略，下次进入重新开始 */ }
}

function clearLearnSession(cat) {
  try { localStorage.removeItem('learn-session-' + cat); } catch (e) {}
}

// 尝试恢复指定分类的学习进度；成功返回 true（learnState 已就绪）
function restoreLearnSession(cat) {
  let raw = null;
  try { raw = localStorage.getItem('learn-session-' + cat); } catch (e) { return false; }
  if (!raw) return false;
  let s;
  try { s = JSON.parse(raw); } catch (e) { return false; }
  if (!s || s.cat !== cat) return false;
  const isNormal = (cat === 'cet4' || cat === 'cet6' || cat === 'phrases');
  const length = isNormal ? (Array.isArray(s.ens) ? s.ens.length : 0) : (Array.isArray(s.words) ? s.words.length : 0);
  if (length === 0) return false;
  if (typeof s.index !== 'number' || s.index < 0 || s.index >= length) return false;
  let words = null;
  if (isNormal) {
    const pool = VOCAB[cat] || [];
    const byEn = new Map(pool.map((w) => [w.en, w]));
    words = s.ens.map((en) => byEn.get(en) || { en: en, phonetic: '', cn: '', example: '', exampleCn: '', synonym: '', root: '' });
  } else {
    words = s.words;
  }
  if (!words || words.length === 0) return false;
  learnState.cat = cat;
  learnState.words = words;
  learnState.index = s.index;
  learnState.mistakes = typeof s.mistakes === 'number' ? s.mistakes : 0;
  learnState.customWords = Array.isArray(s.customWords) ? s.customWords.slice() : [];
  return true;
}

// ============ 自定义背词（题库勾选） ============
let customSrc = 'cet4';            // 自定义面板当前基础词库
const customSelected = new Set();  // 已勾选的单词（en）
let customLetter = 'ALL';          // 字母筛选：'ALL' 或单个字母（普通词库）
let customTitle = 'ALL';           // 短语模式：标题筛选（'ALL' 或源文件标题）
let customSearch = '';             // 搜索关键词

// 当前筛选条件下的单词（词库 + 字母筛选 + 搜索）
function getFilteredWords() {
  const pool = VOCAB[customSrc] || [];
  const q = customSearch.trim().toLowerCase();
  return pool.filter((w) => {
    if (customSrc === 'phrases') {
      // 短语模式：按源文件标题筛选（四六级分开，标题带级别前缀区分重名）
      if (customTitle !== 'ALL' && (w.level || '') + '::' + (w.title || '') !== customTitle) return false;
    } else if (customLetter !== 'ALL' && (w.en[0] || '#').toUpperCase() !== customLetter) {
      return false;
    }
    if (q) {
      const inEn = w.en.toLowerCase().indexOf(q) !== -1;
      const inCn = (w.cn || '').toLowerCase().indexOf(q) !== -1;
      if (!inEn && !inCn) return false;
    }
    return true;
  });
}

// 当前选中的所有单词
function getCustomWords() {
  return Array.from(customSelected);
}

// 渲染筛选条：普通词库为字母（全部 + A-Z）；短语按源文件标题（四级 / 六级分组）
function renderCustomLetterFilter() {
  const box = $('customLetterFilter');
  if (!box) return;
  const lbl = $('customFilterLabel');
  if (lbl) lbl.textContent = customSrc === 'phrases' ? '在题库中按标题勾选想要的短语（四六级分开）' : '在题库中勾选想要的单词';
  if (customSrc === 'phrases') {
    const pool = VOCAB.phrases || [];
    const titles = [];
    const seen = new Set();
    pool.forEach((w) => {
      const t = w.title || '未分组';
      if (!seen.has(t)) { seen.add(t); titles.push(t); }
    });
    const groups = [
      { label: '🎓 四级标题', level: 'cet4' },
      { label: '🏅 六级标题', level: 'cet6' }
    ];
    let html = '<button class="custom-lf custom-lf-title' + (customTitle === 'ALL' ? ' on' : '') + '" data-lf="ALL">全部</button>';
    groups.forEach((g) => {
      const items = titles.filter((t) => pool.some((w) => w.title === t && w.level === g.level));
      if (!items.length) return;
      html += '<span class="custom-lf-group">' + g.label + '</span>';
      items.forEach((t) => {
        const key = g.level + '::' + t;
        html += '<button class="custom-lf custom-lf-title' + (customTitle === key ? ' on' : '') + '" data-lf="' + escHtml(key) + '">' + escHtml(t) + '</button>';
      });
    });
    box.innerHTML = html;
    return;
  }
  const letters = ['ALL'].concat('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
  box.innerHTML = letters.map((ch) =>
    '<button class="custom-lf' + (customLetter === ch ? ' on' : '') + '" data-lf="' + ch + '">' + ch + '</button>'
  ).join('');
}

// 渲染单词列表（题库勾选）
function renderCustomWordList() {
  const box = $('customWordList');
  const info = $('customListInfo');
  if (!box || !info) return;
  const list = getFilteredWords();
  info.textContent = '共 ' + list.length + ' 词 · 已选 ' + customSelected.size;
  box.innerHTML = list.map((w) => {
    const on = customSelected.has(w.en);
    return '<label class="custom-word-item' + (on ? ' on' : '') + '">' +
      '<input type="checkbox" class="cwi-check" data-en="' + escHtml(w.en) + '"' + (on ? ' checked' : '') + ' />' +
      '<span class="cwi-en">' + escHtml(w.en) + '</span>' +
      '<span class="cwi-ph">' + (customSrc === 'phrases' ? escHtml((w.level === 'cet6' ? '🏅 ' : '🎓 ') + (w.title || '')) : escHtml(w.phonetic)) + '</span>' +
      '<span class="cwi-cn">' + escHtml(w.cn) + '</span>' +
    '</label>';
  }).join('');
}

// 渲染已选 chips + 计数
function renderCustomSelected() {
  const box = $('customSelected');
  const count = $('customCount');
  if (!box || !count) return;
  const sel = getCustomWords();
  count.textContent = sel.length;
  if (sel.length === 0) {
    box.innerHTML = '<span class="custom-empty">尚未勾选单词，在题库中勾选或输入单词后开始</span>';
    return;
  }
  const shown = sel.slice(0, 40);
  box.innerHTML = shown.map((en) => '<span class="custom-chip">' + escHtml(en) + '</span>').join('') +
    (sel.length > 40 ? '<span class="custom-chip">…共 ' + sel.length + ' 个</span>' : '');
}

function refreshCustomUI() {
  renderCustomLetterFilter();
  renderCustomWordList();
  renderCustomSelected();
}

// 同步面板中的词库按钮高亮
function syncCustomSourceUI() {
  document.querySelectorAll('.custom-source-btn').forEach((b) => {
    b.classList.toggle('active', b.dataset.csrc === customSrc);
  });
}

function openCustomModal() {
  syncCustomSourceUI();
  refreshCustomUI();
  $('customModal').classList.remove('hidden');
}

function setupCustom() {
  const modal = $('customModal');
  if (!modal) return;
  // 基础词库切换
  document.querySelectorAll('.custom-source-btn').forEach((b) => {
    b.addEventListener('click', () => {
      document.querySelectorAll('.custom-source-btn').forEach((x) => x.classList.remove('active'));
      b.classList.add('active');
      customSrc = b.dataset.csrc;
      customLetter = 'ALL';
      customTitle = 'ALL';
      customSearch = '';
      $('customSearch').value = '';
      refreshCustomUI();
    });
  });
  // 筛选（普通词库=字母，短语=标题）
  $('customLetterFilter').addEventListener('click', (e) => {
    const btn = e.target.closest('.custom-lf');
    if (!btn) return;
    if (customSrc === 'phrases') {
      customTitle = btn.dataset.lf;
    } else {
      customLetter = btn.dataset.lf;
    }
    renderCustomLetterFilter();
    renderCustomWordList();
  });
  // 搜索（防抖）
  let searchTimer = null;
  $('customSearch').addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      customSearch = $('customSearch').value;
      renderCustomWordList();
    }, 150);
  });
  // 单词勾选
  $('customWordList').addEventListener('change', (e) => {
    const cb = e.target;
    if (!cb.classList || !cb.classList.contains('cwi-check')) return;
    const en = cb.dataset.en;
    if (cb.checked) customSelected.add(en); else customSelected.delete(en);
    const item = cb.closest('.custom-word-item');
    if (item) item.classList.toggle('on', cb.checked);
    renderCustomSelected();
    const info = $('customListInfo');
    if (info) info.textContent = '共 ' + getFilteredWords().length + ' 词 · 已选 ' + customSelected.size;
  });
  // 全选当前筛选 / 清空已选
  $('customCheckAll').addEventListener('click', () => {
    getFilteredWords().forEach((w) => customSelected.add(w.en));
    refreshCustomUI();
  });
  $('customUncheckAll').addEventListener('click', () => {
    customSelected.clear();
    refreshCustomUI();
  });
  // 输入单词快速添加
  $('customAddWords').addEventListener('click', () => {
    const val = $('customInput').value || '';
    const words = val.split(/[\s,，、;；]+/).map((s) => s.trim().toLowerCase()).filter(Boolean);
    words.forEach((w) => customSelected.add(w));
    $('customInput').value = '';
    refreshCustomUI();
  });
  // 开始背诵
  $('customStartBtn').addEventListener('click', () => {
    const sel = getCustomWords();
    if (sel.length === 0) { $('customInput').focus(); return; }
    learnState.customWords = sel;
    modal.classList.add('hidden');
    if (learnState.cat !== 'custom') {
      learnState.cat = 'custom';
      document.querySelectorAll('.cat-btn').forEach((b) => b.classList.toggle('active', b.dataset.cat === 'custom'));
    }
    clearLearnSession('custom');
    startLearn();
    updateWrongManageBtn();
    learnInput.focus();
  });
  // 关闭面板：若自定义分类尚未开始学习，自动进入（无已选词时显示空状态提示，避免残留上一分类内容）
  function closeCustomModal() {
    modal.classList.add('hidden');
    if (learnState.activeCat !== 'custom') startLearn();
  }
  $('customCloseBtn').addEventListener('click', closeCustomModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeCustomModal(); });
}

// ============ 作文句式目录（类型筛选 + 勾选 + 默写） ============
const ESSAY_STAGE_LABELS = {
  ALL: '全部',
  opening: '📖 开篇引入', viewpoint: '💡 表明观点',
  cause: '🔗 因果论证', contrast: '⚖️ 对比分析', example: '📌 举例论证',
  emphasis: '🔝 递进强调', importance: '⭐ 重要性阐述',
  summary: '🏁 总结观点', suggestion: '💡 建议措施', outlook: '🔮 展望未来',
  tech: '💻 科技素养', study: '📚 学习能力', self: '🌱 自律成长',
  social: '🤝 社会责任', team: '💬 沟通合作', logic: '🔗 逻辑衔接'
};
let essayStage = 'ALL';           // 目录当前筛选类型
const essaySelected = new Set();  // 已勾选的句式（en）

// 当前筛选类型下的句式
function getEssayFiltered() {
  const pool = VOCAB.essay || [];
  if (essayStage === 'ALL') return pool;
  return pool.filter((w) => w.stage === essayStage);
}

// 渲染类型筛选条（全部 + 各类型）
function renderEssayStageFilter() {
  const box = $('essayStageFilter');
  if (!box) return;
  const stages = ['ALL', 'opening', 'viewpoint', 'cause', 'contrast', 'example', 'emphasis', 'importance', 'summary', 'suggestion', 'outlook', 'tech', 'study', 'self', 'social', 'team', 'logic'];
  box.innerHTML = stages.map((s) =>
    '<button class="custom-lf' + (essayStage === s ? ' on' : '') + '" data-essay-stage="' + s + '">' + ESSAY_STAGE_LABELS[s] + '</button>'
  ).join('');
}

// 渲染句式列表（勾选）
function renderEssayList() {
  const box = $('essayWordList');
  const info = $('essayListInfo');
  if (!box || !info) return;
  const list = getEssayFiltered();
  info.textContent = '共 ' + list.length + ' 句 · 已选 ' + essaySelected.size;
  box.innerHTML = list.map((w) => {
    const on = essaySelected.has(w.en);
    return '<label class="custom-word-item' + (on ? ' on' : '') + '">' +
      '<input type="checkbox" class="cwi-check" data-en="' + escHtml(w.en) + '"' + (on ? ' checked' : '') + ' />' +
      '<span class="cwi-en">' + escHtml(w.en) + '</span>' +
      '<span class="cwi-ph">' + escHtml(ESSAY_STAGE_LABELS[w.stage] || w.stage) + '</span>' +
      '<span class="cwi-cn">' + escHtml(w.cn) + '</span>' +
    '</label>';
  }).join('');
}

function refreshEssayUI() {
  renderEssayStageFilter();
  renderEssayList();
}

// 打开目录：默认全选所有句式
function openEssayModal() {
  if (essaySelected.size === 0) {
    (VOCAB.essay || []).forEach((w) => essaySelected.add(w.en));
  }
  refreshEssayUI();
  $('essayModal').classList.remove('hidden');
}

function setupEssay() {
  const modal = $('essayModal');
  if (!modal) return;
  // 类型筛选
  $('essayStageFilter').addEventListener('click', (e) => {
    const btn = e.target.closest('.custom-lf');
    if (!btn) return;
    essayStage = btn.dataset.essayStage;
    renderEssayStageFilter();
    renderEssayList();
  });
  // 句式勾选
  $('essayWordList').addEventListener('change', (e) => {
    const cb = e.target;
    if (!cb.classList || !cb.classList.contains('cwi-check')) return;
    const en = cb.dataset.en;
    if (cb.checked) essaySelected.add(en); else essaySelected.delete(en);
    const item = cb.closest('.custom-word-item');
    if (item) item.classList.toggle('on', cb.checked);
    const info = $('essayListInfo');
    if (info) info.textContent = '共 ' + getEssayFiltered().length + ' 句 · 已选 ' + essaySelected.size;
  });
  // 全选当前筛选 / 清空已选
  $('essayCheckAll').addEventListener('click', () => {
    getEssayFiltered().forEach((w) => essaySelected.add(w.en));
    refreshEssayUI();
  });
  $('essayUncheckAll').addEventListener('click', () => {
    essaySelected.clear();
    refreshEssayUI();
  });
  // 开始背诵
  $('essayStartBtn').addEventListener('click', () => {
    if (essaySelected.size === 0) { $('essayListInfo').textContent = '⚠️ 请先勾选至少一条句式'; return; }
    modal.classList.add('hidden');
    if (learnState.cat !== 'essay') {
      learnState.cat = 'essay';
      document.querySelectorAll('.cat-btn').forEach((b) => b.classList.toggle('active', b.dataset.cat === 'essay'));
    }
    clearLearnSession('essay');
    startLearn();
    updateWrongManageBtn();
    learnInput.focus();
  });
  // 关闭目录：若作文句式尚未开始学习，自动按默认全选范围开始（跳过不选时页面内容正常）
  function closeEssayModal() {
    modal.classList.add('hidden');
    if (learnState.activeCat !== 'essay') startLearn();
  }
  $('essayCloseBtn').addEventListener('click', closeEssayModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeEssayModal(); });
}

// 学习区「📂 目录」按键：打开作文句式目录重新选择
function setupEssayDirBtn() {
  $('essayDirBtn').addEventListener('click', () => {
    if (learnState.cat === 'essay') openEssayModal();
  });
}

// 学习区「📋 选择单词」按键：打开自定义面板重新选择
function setupCustomDirBtn() {
  $('customDirBtn').addEventListener('click', () => {
    if (learnState.cat === 'custom') openCustomModal();
  });
}

// ============ 作文范文（真题范文：跟打 + 分段背诵） ============
let sampleLevel = 'ALL';          // 目录当前筛选级别：ALL / cet4 / cet6
const sampleSelected = new Set(); // 已勾选的范文（title）
const SAMPLE_LEVEL_LABELS = { ALL: '全部', cet4: '🎓 四级范文', cet6: '🏅 六级范文' };

// 当前筛选级别下的范文
function getSampleFiltered() {
  const pool = VOCAB.sample || [];
  if (sampleLevel === 'ALL') return pool;
  return pool.filter((w) => w.level === sampleLevel);
}

// 渲染级别筛选条（全部 / 四级 / 六级）
function renderSampleLevelFilter() {
  const box = $('sampleLevelFilter');
  if (!box) return;
  box.innerHTML = ['ALL', 'cet4', 'cet6'].map((lv) =>
    '<button class="custom-lf' + (sampleLevel === lv ? ' on' : '') + '" data-sample-level="' + lv + '">' + SAMPLE_LEVEL_LABELS[lv] + '</button>'
  ).join('');
}

// 渲染范文列表（勾选）
function renderSampleList() {
  const box = $('sampleWordList');
  const info = $('sampleListInfo');
  if (!box || !info) return;
  const list = getSampleFiltered();
  info.textContent = '共 ' + list.length + ' 篇 · 已选 ' + sampleSelected.size;
  box.innerHTML = list.map((w) => {
    const on = sampleSelected.has(w.title);
    const tag = (w.level === 'cet4' ? '🎓 四级' : '🏅 六级') + (w.type ? ' · ' + w.type : '');
    return '<label class="custom-word-item' + (on ? ' on' : '') + '">' +
      '<input type="checkbox" class="cwi-check" data-title="' + escHtml(w.title) + '"' + (on ? ' checked' : '') + ' />' +
      '<span class="cwi-en">' + escHtml(w.title) + '</span>' +
      '<span class="cwi-ph">' + tag + '</span>' +
      '<span class="cwi-cn">' + escHtml(w.topic || '') + '</span>' +
    '</label>';
  }).join('');
}

function refreshSampleUI() {
  renderSampleLevelFilter();
  renderSampleList();
}

// 打开目录：默认全选所有范文
function openSampleModal() {
  if (sampleSelected.size === 0) {
    (VOCAB.sample || []).forEach((w) => sampleSelected.add(w.title));
  }
  refreshSampleUI();
  $('sampleModal').classList.remove('hidden');
}

function setupSample() {
  const modal = $('sampleModal');
  if (!modal) return;
  // 级别筛选（切换级别即选中该级别全部范文，四级/六级分开背诵）
  $('sampleLevelFilter').addEventListener('click', (e) => {
    const btn = e.target.closest('.custom-lf');
    if (!btn) return;
    sampleLevel = btn.dataset.sampleLevel;
    sampleSelected.clear();
    getSampleFiltered().forEach((w) => sampleSelected.add(w.title));
    renderSampleLevelFilter();
    renderSampleList();
  });
  // 范文勾选
  $('sampleWordList').addEventListener('change', (e) => {
    const cb = e.target;
    if (!cb.classList || !cb.classList.contains('cwi-check')) return;
    const t = cb.dataset.title;
    if (cb.checked) sampleSelected.add(t); else sampleSelected.delete(t);
    const item = cb.closest('.custom-word-item');
    if (item) item.classList.toggle('on', cb.checked);
    const info = $('sampleListInfo');
    if (info) info.textContent = '共 ' + getSampleFiltered().length + ' 篇 · 已选 ' + sampleSelected.size;
  });
  // 全选当前筛选 / 清空已选
  $('sampleCheckAll').addEventListener('click', () => {
    getSampleFiltered().forEach((w) => sampleSelected.add(w.title));
    refreshSampleUI();
  });
  $('sampleUncheckAll').addEventListener('click', () => {
    sampleSelected.clear();
    refreshSampleUI();
  });
  // 开始背诵
  $('sampleStartBtn').addEventListener('click', () => {
    if (sampleSelected.size === 0) { $('sampleListInfo').textContent = '⚠️ 请先勾选至少一篇范文'; return; }
    modal.classList.add('hidden');
    if (learnState.cat !== 'sample') {
      learnState.cat = 'sample';
      document.querySelectorAll('.cat-btn').forEach((b) => b.classList.toggle('active', b.dataset.cat === 'sample'));
    }
    clearLearnSession('sample');
    startLearn();
    updateWrongManageBtn();
    updateEssayDirBtn();
    updateCustomDirBtn();
    updateSampleDirBtn();
    learnInput.focus();
  });
  // 关闭目录：若作文范文尚未开始学习，自动按默认全选范围开始（跳过不选时页面内容正常）
  function closeSampleModal() {
    modal.classList.add('hidden');
    if (learnState.activeCat !== 'sample') startLearn();
  }
  $('sampleCloseBtn').addEventListener('click', closeSampleModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeSampleModal(); });
}

// 构建范文练习序列：每篇按段落拆分，逐段跟打/背诵（先读结构 → 逐段背表达）
function buildSampleSequence(list) {
  const seq = [];
  (list || []).forEach((unit) => {
    const paras = (unit.en || '').split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean);
    const cnParas = (unit.cn || '').split(/\n\s*\n/).map((p) => p.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean);
    paras.forEach((p, i) => {
      seq.push({
        kind: 'sentence', type: 'sentence', stage: 'sample',
        title: unit.title, stype: unit.type || '', stopic: unit.topic || '', sprompt: unit.prompt || '', level: unit.level, paraLabel: '第' + (i + 1) + '段',
        en: p, phonetic: '', cn: cnParas[i] || '', example: '', exampleCn: ''
      });
    });
  });
  return seq;
}

// 学习区「📄 范文目录」按键：打开作文范文目录重新选择
function setupSampleDirBtn() {
  $('sampleDirBtn').addEventListener('click', () => {
    if (learnState.cat === 'sample') openSampleModal();
  });
}

// 作文范文「范文目录」按钮：仅在作文范文分类下显示
function updateSampleDirBtn() {
  $('sampleDirBtn').classList.toggle('hidden', learnState.cat !== 'sample');
}

// ============ 错题本 ============
function getWrongWords() {
  try { return JSON.parse(localStorage.getItem('learn-wrong') || '[]'); } catch (e) { return []; }
}

function saveWrongWords(list) {
  localStorage.setItem('learn-wrong', JSON.stringify(list));
}

// 记录错题（同一词只记一次，count 累计错误次数，rightCount 为连续做对次数）
function addWrongWord(item) {
  if (!item || !item.en) return;
  const list = getWrongWords();
  const idx = list.findIndex((w) => w.en === item.en);
  if (idx >= 0) {
    list[idx].count = (list[idx].count || 1) + 1;
    list[idx].last = Date.now();
    list[idx].rightCount = 0; // 又做错了：连续做对次数重置
  } else {
    list.push({
      en: item.en,
      phonetic: item.phonetic || '',
      cn: item.cn || '',
      example: item.example || '',
      exampleCn: item.exampleCn || '',
      type: item.type || '',
      count: 1,
      last: Date.now(),
      rightCount: 0
    });
  }
  saveWrongWords(list);
  updateWrongBadge();
}

// 错题做对：累计连续做对次数，达到 3 次自动移除
function markWrongCorrect(en) {
  const list = getWrongWords();
  const idx = list.findIndex((w) => w.en === en);
  if (idx < 0) return null;
  const item = list[idx];
  item.rightCount = (item.rightCount || 0) + 1;
  item.last = Date.now();
  let removed = false;
  if (item.rightCount >= 3) {
    list.splice(idx, 1);
    removed = true;
  }
  saveWrongWords(list);
  updateWrongBadge();
  return { removed, rightCount: item.rightCount };
}

// 做对了从错题本移除
function removeWrongWord(en) {
  const list = getWrongWords().filter((w) => w.en !== en);
  saveWrongWords(list);
  updateWrongBadge();
}

// 全部移除错题本
function clearWrongWords() {
  localStorage.removeItem('learn-wrong');
  updateWrongBadge();
  renderWrongManage();
  if (learnState.cat === 'wrong') startLearn();
}

// ============ 错题管理弹窗 ============
function escHtml(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderWrongManage() {
  const list = getWrongWords();
  const box = $('wrongManageList');
  const empty = $('wrongEmpty');
  if (!list.length) {
    box.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  box.innerHTML = list.map((w) =>
    '<div class="wrong-manage-item">' +
      '<div class="wrong-manage-info">' +
        '<div class="wrong-manage-word">' + escHtml(w.en) + '</div>' +
        '<div class="wrong-manage-cn">' + escHtml(w.cn) + '</div>' +
      '</div>' +
      '<span class="wrong-manage-count">错 ' + (w.count || 1) + ' 次</span>' +
      '<button class="wrong-remove-btn" data-wrong-en="' + escHtml(w.en) + '">移除</button>' +
    '</div>'
  ).join('');
}

function openWrongManage() {
  renderWrongManage();
  $('wrongModal').classList.remove('hidden');
}

function updateWrongManageBtn() {
  $('wrongManageBtn').classList.toggle('hidden', learnState.cat !== 'wrong');
}

// 作文句式「目录」按钮：仅在作文句式分类下显示
function updateEssayDirBtn() {
  $('essayDirBtn').classList.toggle('hidden', learnState.cat !== 'essay');
}

// 自定义「选择单词」按钮：仅在自定义分类下显示
function updateCustomDirBtn() {
  $('customDirBtn').classList.toggle('hidden', learnState.cat !== 'custom');
}

// ============ 记忆度（提升背诵效果） ============
const MASTERY_PREFIX = 'learn-mastery-';

function getMastery(cat) {
  try { return JSON.parse(localStorage.getItem(MASTERY_PREFIX + cat) || '{}'); }
  catch (e) { return {}; }
}

function setMastery(cat, en, level) {
  const m = getMastery(cat);
  m[en] = level;
  localStorage.setItem(MASTERY_PREFIX + cat, JSON.stringify(m));
}

// 统计掌握情况：已掌握 / 模糊 / 不认识
function masteryCounts(cat) {
  const m = getMastery(cat);
  let known = 0, hesitant = 0, unknown = 0;
  (VOCAB[cat] || []).forEach((w) => {
    const lv = m[w.en];
    if (lv === 2) known++;
    else if (lv === 1) hesitant++;
    else if (lv === 0) unknown++;
  });
  return { known, hesitant, unknown };
}

function renderMasteryStats() {
  const el = $('learnMasteryStats');
  if (!el) return;
  const isSentence = learnState.cat === 'essay' || learnState.cat === 'sample';
  // 跟打模式/长难句/错题本/自定义/未加载时不显示进度区统计（只在听写测试显示待掌握数量）
  if (isSentence || learnState.cat === 'wrong' || learnState.cat === 'custom' || !vocabLoaded || learnState.lmode === 'type') { el.textContent = ''; return; }
  const c = masteryCounts(learnState.cat);
  const pending = c.hesitant + c.unknown;
  el.textContent = pending ? '⏳ 待巩固 ' + pending : '🎉 全部已掌握';
}

// 进度标签：错题本 / 自定义 / 长难句（显示当前模式与数量）
function updateProgressLabel() {
  const tag = $('learnProgressTag');
  if (!tag) return;
  const cat = learnState.cat;
  const isSentence = cat === 'essay';
  if (cat === 'wrong') {
    tag.textContent = '📕 错题 ';
  } else if (cat === 'custom') {
    tag.textContent = '📋 自定义 ';
  } else if (cat === 'sample') {
    tag.textContent = '📄 范文 ';
  } else if (isSentence) {
    tag.textContent = '� 作文 ';
  } else {
    tag.textContent = '';
  }
}

// 打对/打错自动记录记忆度（打错自动记为未掌握，无需手动自评）
// 自定义分类不记录记忆度（词可能来自不同词库，避免污染基础词库的掌握度）
function markMasteryCorrect(w) {
  if (w && !w.type && learnState.cat !== 'custom') { setMastery(learnState.cat, w.en, 2); renderMasteryStats(); }
}
function markMasteryWrong(w) {
  if (w && !w.type && learnState.cat !== 'custom') { setMastery(learnState.cat, w.en, 0); renderMasteryStats(); }
}

function setupWrongManage() {
  const modal = $('wrongModal');
  $('wrongManageBtn').addEventListener('click', openWrongManage);
  $('wrongCloseBtn').addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });
  $('wrongClearAllBtn').addEventListener('click', () => {
    const n = getWrongWords().length;
    if (!n) return;
    if (confirm('确定移除错题本中的全部 ' + n + ' 个单词吗？此操作不可恢复。')) {
      clearWrongWords();
    }
  });
  // 单个移除（事件委托）
  $('wrongManageList').addEventListener('click', (e) => {
    const rm = e.target.closest('.wrong-remove-btn');
    if (!rm) return;
    removeWrongWord(rm.dataset.wrongEn);
    renderWrongManage();
    if (learnState.cat === 'wrong') startLearn();
  });
}

// 更新错题本按钮数量
function updateWrongBadge() {
  const btn = document.querySelector('.cat-btn[data-cat="wrong"]');
  if (!btn) return;
  const n = getWrongWords().length;
  btn.textContent = n > 0 ? '📕 错题本(' + n + ')' : '📕 错题本';
  btn.disabled = n === 0;
}

function startLearn(fromSave) {
  const isSentenceCat = learnState.cat === 'essay';
  // 标记当前 words 归属的分类（目录弹窗关闭时据此判断是否需要补启学习）
  learnState.activeCat = learnState.cat;
  if (!fromSave) {
    if (learnState.cat === 'wrong') {
      // 错题本：重练所有错题
      learnState.words = shuffle(getWrongWords());
    } else if (learnState.cat === 'custom') {
      // 自定义：只背用户指定的单词（en 字符串 → 完整词对象）
      const pool = VOCAB[customSrc] || [];
      const byEn = new Map(pool.map((w) => [w.en, w]));
      learnState.words = shuffle((learnState.customWords || []).map((en) =>
        byEn.get(en) || { en, phonetic: '', cn: '', example: '', exampleCn: '' }
      ));
    } else if (isSentenceCat) {
      // 作文句式：只练目录中勾选的句式
      const pool = VOCAB.essay || [];
      const list = essaySelected.size ? pool.filter((w) => essaySelected.has(w.en)) : pool;
      learnState.words = buildSentenceSequence(list);
    } else if (learnState.cat === 'sample') {
      // 作文范文：只背目录中勾选的范文（按段落拆分，逐段跟打背诵）
      const pool = VOCAB.sample || [];
      const list = sampleSelected.size ? pool.filter((w) => sampleSelected.has(w.title)) : pool;
      learnState.words = buildSampleSequence(list);
    } else {
      learnState.words = shuffle(VOCAB[learnState.cat] || []);
    }
    learnState.index = 0;
    learnState.mistakes = 0;
  }
  // fromSave：words / index / mistakes 已由 restoreLearnSession() 恢复，跳过重新洗牌
  learnState.startTime = Date.now();
  learnState.revealed = false;
  // 错题本直接使用听写测试模式
  if (learnState.cat === 'wrong' && learnState.lmode !== 'dict') {
    learnState.lmode = 'dict';
    document.querySelectorAll('.mode-btn').forEach((b) => b.classList.toggle('active', b.dataset.lmode === 'dict'));
  }
  $('learnTotal').textContent = learnState.words.length;
  updateWrongBadge();
  showBestTip();
  updateProgressLabel();
  renderMasteryStats();
  // 词表为空时显示友好提示，避免崩溃（区分：加载中 / 错题本空 / 词库空）
  if (learnState.words.length === 0) {
    const loading = !isSentenceCat && learnState.cat !== 'wrong' && learnState.cat !== 'custom' && learnState.cat !== 'sample' && !vocabLoaded;
    learnEn.classList.remove('sentence', 'revealed', 'hidden');
    learnEn.textContent = loading ? '词库加载中…' : (learnState.cat === 'wrong' ? '暂无错题 🎉' : (learnState.cat === 'sample' ? '请先选择要背诵的范文 📄' : (learnState.cat === 'custom' ? '请先选择要背的单词 📋' : '该词库暂无单词')));
    learnPhonetic.textContent = '';
    learnCn.textContent = loading ? '正在从词库文件读取单词…' : (learnState.cat === 'wrong' ? '快去练习，打错的词会自动收进来！' : (learnState.cat === 'sample' ? '点击上方「📄 作文范文」按钮，选择要背诵的范文。' : (learnState.cat === 'custom' ? '点击上方「📋 自定义」按钮，按字母 / 标题目录或输入单词来指定背诵内容。' : '可检查词库数据文件是否完整。')));
    learnExampleEn.textContent = '';
    learnExampleCn.textContent = '';
    document.querySelector('.word-phonetic-row').classList.add('hidden');
    document.querySelector('.word-example').classList.add('hidden');
    $('learnStage').className = 'learn-stage hidden';
    $('learnPrompt').classList.add('hidden');
    learnInput.value = '';
    learnFeedback.textContent = '';
    learnFeedback.className = 'learn-feedback';
    updateEssayDirBtn();
    updateCustomDirBtn();
    updateSampleDirBtn();
    return;
  }
  updateEssayDirBtn();
  updateCustomDirBtn();
  updateSampleDirBtn();
  loadLearnWord();
}

// 从四/六级词表查找单词的完整信息（音标/释义/例句）
function getWordInfo(cat, en) {
  return VOCAB[cat].find((w) => w.en === en) || { en, phonetic: '', cn: '', example: '', exampleCn: '' };
}

// 构建作文句式练习序列：每条 { stage, en, cn } 直接作为一条跟打/默写句子
function buildSentenceSequence(list) {
  const seq = [];
  (list || []).forEach((unit) => {
    seq.push({ kind: 'sentence', type: 'sentence', stage: unit.stage, en: unit.en, phonetic: '', cn: unit.cn, example: '', exampleCn: '' });
  });
  return seq;
}

function showBestTip() {
  const saved = JSON.parse(localStorage.getItem('learn-progress-' + learnState.cat) || '{}');
  const tip = document.querySelector('.learn-tip');
  const isSentenceCat = learnState.cat === 'essay';
  let base;
  if (learnState.cat === 'sample') {
    base = '📄 真题范文按段落跟打背诵 · 先读结构再逐段背 · Shift 听发音';
  } else if (isSentenceCat) {
    base = '作文句式 / 高分表达逐条跟打或默写 · 分类标签见上方 · Shift 听发音';
  } else if (learnState.cat === 'wrong') {
    base = '📕 听写模式重练错题 · 连续做对 3 次自动移出 · Shift 听发音';
  } else if (learnState.cat === 'custom') {
    base = '📋 只背你选定的单词 · 可随时点「📋 自定义」换一组 · Shift 听发音';
  } else {
    base = '打字跟打：输完自动下一个 · 听写：给翻译默写，Enter 判定 · 👁️ 查看答案';
  }
  tip.textContent = saved.best
    ? `🏅 本组历史最佳 ${saved.best}% · ${base}`
    : base;
}

// ============ 单词发音（TTS） ============
let cachedVoice = null;
let ttsWarmed = false;
let ttsRunning = false;  // TTS 调度循环是否运行（保证同一时刻只有一个循环，避免并发冲突）
let ttsPending = null;   // 最新待播请求（连续点击时保留最新，保证不丢）
let ttsReady = false;    // 语音引擎是否就绪
let ttsQueue = [];       // 引擎就绪前积压的请求（解决"刚开始点击不出音"）

// 检测英文语音是否可用，并提示用户（避免误解为"按键失效"）
function checkEnVoice() {
  const hint = $('voiceHint');
  if (!hint) return;
  if (!('speechSynthesis' in window)) {
    hint.textContent = '⚠️ 当前浏览器不支持语音朗读。';
    hint.classList.remove('hidden');
    return;
  }
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    const hasEn = voices.some((v) => v.lang && v.lang.toLowerCase().startsWith('en'));
    if (hasEn) hint.classList.add('hidden');
    else hint.classList.remove('hidden');
  }
}

// 预热语音引擎：提前加载引擎和语音列表，并检测引擎就绪状态
function warmUpTTS() {
  if (ttsWarmed || !('speechSynthesis' in window)) return;
  ttsWarmed = true;
  getEnVoice();
  checkEnVoice();
  // 语音列表加载完成 = 引擎就绪的信号
  if ('onvoiceschanged' in window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoice = null;
      getEnVoice();
      checkEnVoice();
      markTTSReady();
    };
  }
  // 预热：真正播放一个空内容，触发引擎初始化
  try {
    const u = new SpeechSynthesisUtterance(' ');
    u.onend = markTTSReady;
    u.onerror = markTTSReady;
    window.speechSynthesis.speak(u);
  } catch (e) {
    markTTSReady();
  }
  // 兜底：5 秒后强制标记就绪，避免引擎异常导致永久排队
  setTimeout(markTTSReady, 5000);
}

function markTTSReady() {
  if (ttsReady) return;
  ttsReady = true;
  // 引擎就绪：立即播放积压的请求
  while (ttsQueue.length) {
    const req = ttsQueue.shift();
    speakWord(req.word, req.force, req.onEnd, req.immediate);
  }
}

function getEnVoice() {
  if (cachedVoice) return cachedVoice;
  if (!('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  cachedVoice = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('en'))
    || voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('en-us'));
  return cachedVoice;
}

function speakWord(word, force = false, onEnd = null, immediate = false) {
  // force=true 表示手动播放，不受发音开关限制
  if (!force && !learnState.sound) return;
  if (!('speechSynthesis' in window)) return;
  const clean = String(word).replace(/[^\x00-\x7F]/g, '').trim();
  if (!clean) return;

  // 引擎未就绪（刚打开页面时 Chrome 语音引擎还在初始化）：
  // 先把请求积压起来，引擎一就绪就自动播出，避免"刚开始点击不出音"。
  if (!ttsReady) {
    ttsQueue.push({ word: clean, force, onEnd, immediate });
    return;
  }

  // 记录最新请求（连续快速点击时后一次会打断前一次，但每次点击都会轮到播放）
  ttsPending = { clean, onEnd, immediate };
  // 立即打断当前播放，让新请求尽快上场
  try {
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }
  } catch (e) { /* 忽略 */ }
  if (!ttsRunning) runTTSLoop();
}

// 单例播放调度循环：同一时刻只有一个循环在处理请求，
// 避免连续点击时多个轮询并发 cancel 导致互相吞掉。
function runTTSLoop() {
  ttsRunning = true;
  let attempts = 0;

  const next = () => {
    if (!ttsPending) { ttsRunning = false; return; }
    const req = ttsPending;
    ttsPending = null;
    attempts = 0;
    let done = false;

    // 幂等结束：onend/onerror/保险定时器都可能触发，只处理一次
    const finish = () => {
      if (done) return;
      done = true;
      if (typeof req.onEnd === 'function') req.onEnd();
      next();
    };

    const play = () => {
      if (req.immediate) {
        // —— 手动播放：立即响应 ——
        // 点击后 cancel 当前（打断），30ms 后直接 speak，
        // 不再等待引擎"完全空闲"（等待正是"慢一拍"的来源）。
        try {
          window.speechSynthesis.cancel();
          setTimeout(() => {
            const utter = new SpeechSynthesisUtterance(req.clean);
            utter.lang = 'en-US';
            utter.rate = 0.9;
            utter.pitch = 1;
            const voice = getEnVoice();
            if (voice) utter.voice = voice;
            utter.onend = finish;
            utter.onerror = finish;
            window.speechSynthesis.speak(utter);
            // 保险：引擎异常未回调时 5 秒后强制继续
            setTimeout(finish, 5000);
          }, 30);
        } catch (e) {
          finish();
        }
        return;
      }
      // —— 自动朗读：等待引擎空闲后播（防吞音） ——
      try {
        const busy = window.speechSynthesis.speaking || window.speechSynthesis.pending;
        if (busy && attempts < 3) {
          // 引擎仍忙：cancel 后稍等再试（最多约 150ms）
          window.speechSynthesis.cancel();
          attempts++;
          setTimeout(play, 50);
          return;
        }
        // 引擎空闲（或已等待足够久）→ 播放
        const utter = new SpeechSynthesisUtterance(req.clean);
        utter.lang = 'en-US';
        utter.rate = 0.9;
        utter.pitch = 1;
        const voice = getEnVoice();
        if (voice) utter.voice = voice;
        utter.onend = finish;
        utter.onerror = finish;
        window.speechSynthesis.speak(utter);
        // 保险：若引擎异常一直未触发 onend/onerror（Chrome 极端情况），
        // 5 秒后强制结束本轮，保证调度循环不会卡死
        setTimeout(finish, 5000);
      } catch (e) {
        // 语音不可用或 voice 转换失败：静默降级，继续下一个请求
        finish();
      }
    };

    play();
  };

  next();
}

function loadLearnWord() {
  learnState.revealed = false;
  learnAdvancing = false;
  clearTimeout(learnNextTimer);
  learnInput.value = '';
  learnInput.classList.remove('correct-input', 'wrong-input');
  learnFeedback.textContent = '';
  learnFeedback.className = 'learn-feedback';
  renderLearnWord();
  renderLearnSpell();
  updateLearnProgress();
  learnInput.focus();
  // 打单词前先念一遍发音
  const w = learnState.words[learnState.index];
  if (w) speakWord(w.en);
}

// 句子逐字母拼写反馈：正确绿色、拼错红色、当前位置高亮
function renderLearnSpell() {
  const el = $('learnSpell');
  const w = learnState.words[learnState.index];
  // 仅跟打模式 + 句子显示；听写模式/单词一律隐藏（不残留打字显示）
  if (!w || w.type !== 'sentence' || learnState.lmode !== 'type') {
    el.classList.add('hidden');
    return;
  }
  el.classList.remove('hidden');
  const val = learnInput.value;
  const target = w.en;
  el.innerHTML = '';
  for (let i = 0; i < target.length; i++) {
    const span = document.createElement('span');
    const ch = i < val.length ? val[i] : target[i];
    span.textContent = ch === ' ' ? '\u00A0' : ch;
    span.className = 'spell-char';
    if (i < val.length) {
      span.classList.add(
        val[i].toLowerCase() === target[i].toLowerCase() ? 'spell-ok' : 'spell-bad'
      );
    } else if (i === val.length) {
      span.classList.add('spell-next');
    } else {
      span.classList.add('spell-muted');
    }
    el.appendChild(span);
  }
}

function renderLearnWord() {
  const w = learnState.words[learnState.index];
  const isSentence = w.type === 'sentence';
  $('learnCurrent').textContent = learnState.index + 1;
  learnPhonetic.textContent = w.phonetic;
  learnCn.textContent = w.cn;
  // 范文跟打：只保留打字跟随屏，隐藏英文正文段（中文翻译保留）；听写模式释义行隐藏
  const sampleType = w.stage === 'sample' && learnState.lmode === 'type';
  learnEn.classList.toggle('hidden', sampleType);
  learnCn.classList.toggle('hidden', learnState.lmode === 'dict');
  // 例句高亮当前单词，强化记忆
  if (w.example) {
    const esc = escHtml(w.example);
    const escEn = String(w.en).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      learnExampleEn.innerHTML = esc.replace(new RegExp('(' + escEn + ')', 'gi'), '<mark class="hl-word">$1</mark>');
    } catch (e) {
      learnExampleEn.textContent = w.example;
    }
  } else {
    learnExampleEn.textContent = '';
  }
  learnExampleCn.textContent = w.exampleCn;
  // 同义反义 / 词根记忆（无内容时隐藏）
  const syn = w.synonym || '';
  const root = w.root || '';
  $('learnSynonym').textContent = syn;
  $('learnRoot').textContent = root;
  $('learnSynonym').classList.toggle('hidden', !syn);
  $('learnRoot').classList.toggle('hidden', !root);
  learnEn.classList.remove('revealed', 'dict-translate');
  // 英文题目：仅作文范文显示（放在顶部）
  $('learnPrompt').classList.add('hidden');
  // 打字拼写反馈条：仅跟打模式 + 句子显示；听写模式下隐藏（不残留英文打字显示）
  $('learnSpell').classList.toggle('hidden', learnState.lmode !== 'type' || w.type !== 'sentence');
  // 作文句式 / 高分表达分类标签
  const stageMap = {
    opening: '📖 开篇引入', viewpoint: '💡 表明观点',
    cause: '🔗 因果论证', contrast: '⚖️ 对比分析', example: '📌 举例论证',
    emphasis: '🔝 递进强调', importance: '⭐ 重要性阐述',
    summary: '🏁 总结观点', suggestion: '💡 建议措施', outlook: '🔮 展望未来',
    tech: '💻 科技素养', study: '📚 学习能力', self: '🌱 自律成长',
    social: '🤝 社会责任', team: '💬 沟通合作', logic: '🔗 逻辑衔接'
  };
  if (w.stage === 'sample') {
    const promptEl = $('learnPrompt');
    promptEl.textContent = w.sprompt ? '📝 ' + w.sprompt : '';
    promptEl.classList.toggle('hidden', !w.sprompt);
    $('learnStage').textContent = '📄 ' + (w.title || '范文') + (w.stype ? ' · ' + w.stype : '') + (w.stopic ? ' · ' + w.stopic : '') + (w.paraLabel ? ' · ' + w.paraLabel : '');
    $('learnStage').className = 'learn-stage stage-sample';
  } else if (w.stage && stageMap[w.stage]) {
    $('learnStage').textContent = stageMap[w.stage];
    $('learnStage').className = 'learn-stage stage-' + w.stage;
  } else {
    $('learnStage').className = 'learn-stage hidden';
  }
  // 句子模式：英文用小字号，隐藏音标行和词形按钮；例句块显示"本句用词"提示（有则显示）
  learnEn.classList.toggle('sentence', isSentence);
  const isDict = learnState.lmode === 'dict';
  document.querySelector('.word-phonetic-row').classList.toggle('hidden', isSentence || !w.phonetic);
  // 听写默写：隐藏例句与同义反义/词根记忆，只保留纯默写（避免提示干扰回忆）
  document.querySelector('.word-example').classList.toggle('hidden', isDict || !w.example);
  document.querySelector('.word-extras').classList.toggle('hidden', isDict);
  $('formsBtn').classList.toggle('hidden', isSentence);
  if (learnState.lmode === 'type') {
    learnEn.textContent = w.en;
  } else {
    // 听写模式：给翻译默写 —— 大字显示中文翻译作为默写提示；英文答案点「👁️ 查看答案」或 Enter 判定后显示
    learnEn.classList.add('dict-translate');
    learnEn.textContent = w.cn || (w.stage === 'sample' ? '（范文段落过长，建议用 ✏️ 单词跟打 逐段背诵）' : '（暂无翻译，凭记忆默写）');
  }
  // 「👁️ 查看答案」只在听写模式下显示
  $('revealAnswerBtn').classList.toggle('hidden', learnState.lmode !== 'dict');
}

function updateLearnProgress() {
  const pct = Math.round((learnState.index / learnState.words.length) * 100);
  $('learnBar').style.width = pct + '%';
}

// ============ 学习输入处理 ============
// ============ 打字音效 ============
let keySoundCtx = null;
let keySoundOn = true;

function getKeySoundCtx() {
  if (!keySoundCtx) keySoundCtx = new (window.AudioContext || window.webkitAudioContext)();
  return keySoundCtx;
}

// 按键音效：key 敲击 / back 退格 / enter 回车 / correct 打对 / wrong 打错
function playKeySound(type) {
  if (!keySoundOn) return;
  try {
    const ctx = getKeySoundCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const cfg = {
      key:     { f: 1500, wave: 'triangle', vol: 0.055, dur: 0.045 },
      back:    { f: 650,  wave: 'triangle', vol: 0.045, dur: 0.05 },
      enter:   { f: 950,  wave: 'sine',     vol: 0.055, dur: 0.07 },
      correct: { f: 1900, wave: 'sine',     vol: 0.06,  dur: 0.09 },
      wrong:   { f: 240,  wave: 'triangle', vol: 0.07,  dur: 0.13 }
    };
    const c = cfg[type] || cfg.key;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = c.wave;
    osc.frequency.value = c.f;
    gain.gain.setValueAtTime(c.vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + c.dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + c.dur + 0.02);
  } catch (e) { /* 音频不可用时静默 */ }
}

// 投喂音效：两音上行“叮咚”，模拟吃东西的愉悦感
function playFeedSound() {
  if (!keySoundOn) return;
  try {
    const ctx = getKeySoundCtx();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const notes = [
      { f: 988, t: 0, dur: 0.09 },     // B5 短音
      { f: 1319, t: 0.09, dur: 0.18 }  // E6 长音
    ];
    notes.forEach((n) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = n.f;
      gain.gain.setValueAtTime(0.07, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + n.t);
      osc.stop(now + n.t + n.dur + 0.02);
    });
  } catch (e) { /* 音频不可用时静默 */ }
}

function setupLearnInput() {
  // 查看答案：听写模式下可切换显示/收起英文答案；显示答案时中文翻译保留在释义行
  $('revealAnswerBtn').addEventListener('click', () => {
    const w = learnState.words[learnState.index];
    if (!w) return;
    if (learnEn.classList.contains('revealed')) {
      // 已显示答案 → 收起，回到「给翻译默写」状态
      learnEn.classList.remove('revealed');
      learnEn.classList.add('dict-translate');
      learnEn.textContent = w.cn || (w.stage === 'sample' ? '（范文段落过长，建议用 ✏️ 单词跟打 逐段背诵）' : '（暂无翻译，凭记忆默写）');
      learnCn.classList.add('hidden');
      learnState.revealed = false;
    } else {
      // 显示英文答案，中文翻译保留在释义行
      learnEn.classList.remove('dict-translate');
      learnEn.textContent = w.en;
      learnEn.classList.add('revealed');
      learnCn.textContent = w.cn || '';
      learnCn.classList.remove('hidden');
      learnState.revealed = true;
    }
    learnInput.focus();
  });
  learnInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      playKeySound('enter');
      handleLearnSubmit();
      return;
    }
    if (e.key === 'Backspace') playKeySound('back');
    else if (e.key && e.key.length === 1) playKeySound('key');
    setPetState('typing');
  });

  learnInput.addEventListener('input', () => {
    if (learnState.index >= learnState.words.length) return;
    if (learnState.lmode === 'type') {
      checkTypeProgress();
    } else if (learnState.lmode === 'dict') {
      // 听写默写：实时拼写检查（红色 + 音效），判定仍以 Enter 为准
      checkDictSpell();
    }
  });
}

// 听写模式实时拼写反馈：默写时打错即时红色边框 + 错误音效提示，修正后自动消除（对错仍以 Enter 判定为准）
function checkDictSpell() {
  const w = learnState.words[learnState.index];
  if (!w) return;
  const target = w.en.toLowerCase();
  const val = learnInput.value.trim().toLowerCase();
  const errMsg = '❌ 拼写有误，检查一下';
  if (!val) {
    learnInput.classList.remove('wrong-input', 'correct-input');
    if (learnFeedback.textContent === errMsg) {
      learnFeedback.textContent = '';
      learnFeedback.className = 'learn-feedback';
    }
    return;
  }
  if (target.startsWith(val)) {
    // 目前打对（前缀匹配）：恢复正常
    learnInput.classList.remove('wrong-input', 'correct-input');
    if (learnFeedback.textContent === errMsg) {
      learnFeedback.textContent = '';
      learnFeedback.className = 'learn-feedback';
    }
  } else if (!learnInput.classList.contains('wrong-input')) {
    // 拼写错误：红色边框 + 错误音效 + 红字提示（仅状态切换时响一次）
    learnInput.classList.add('wrong-input');
    learnInput.classList.remove('correct-input');
    playKeySound('wrong');
    setPetState('wrong');
    learnFeedback.textContent = errMsg;
    learnFeedback.className = 'learn-feedback bad';
  }
}

// 学习进度防重入：防止单词打对时 input 事件重复触发跳词（会跳过一个单词）
let learnAdvancing = false;
let learnNextTimer = null;

function checkTypeProgress() {
  const w = learnState.words[learnState.index];
  const val = learnInput.value;
  const valNorm = val.trim().toLowerCase();
  const target = w.en.toLowerCase();
  // 句子模式：逐字母着色反馈（错误字母红色标出）
  renderLearnSpell();
  if (!val) return;

  if (valNorm === target) {
    if (learnAdvancing) return;
    learnAdvancing = true;
    // 跟打打对：自动标记为已掌握
    markMasteryCorrect(w);
    learnInput.classList.add('correct-input');
    learnInput.classList.remove('wrong-input');
    learnFeedback.className = 'learn-feedback ok';
    // 错题本：连续做对 3 次自动移除
    if (learnState.cat === 'wrong') {
      const r = markWrongCorrect(w.en);
      if (r && r.removed) {
        learnFeedback.textContent = '✅ 连续做对 3 次，已移出错题本！';
      } else if (r) {
        learnFeedback.textContent = '✅ 做对 ' + r.rightCount + '/3，还差 ' + (3 - r.rightCount) + ' 次移除';
      }
    } else {
      learnFeedback.textContent = '✅ 正确！';
    }
    // 打对音效
    playKeySound('correct');
    // 桌宠开心
    setPetState('correct');
    // 打对了再念一遍发音
    speakWord(w.en);
    learnNextTimer = setTimeout(() => nextLearnWord(), 500);
  } else if (target.startsWith(val)) {
    learnInput.classList.remove('correct-input', 'wrong-input');
    learnFeedback.textContent = '';
    learnFeedback.className = 'learn-feedback';
  } else {
    learnInput.classList.add('wrong-input');
    learnInput.classList.remove('correct-input');
    // 打错音效
    playKeySound('wrong');
    // 跟打打错：普通跟打失败不入错题本；仅在重练错题本时重置连续计数
    if (learnState.cat === 'wrong') addWrongWord(w);
    // 桌宠难过
    setPetState('wrong');
  }
}

function handleLearnSubmit() {
  if (learnState.index >= learnState.words.length) return;
  const w = learnState.words[learnState.index];
  const val = learnInput.value.trim().toLowerCase();
  const target = w.en.toLowerCase();

  if (learnState.lmode === 'type') {
    if (val === target) {
      if (learnAdvancing) return;
      learnAdvancing = true;
      // 错题本：连续做对 3 次自动移除
      if (learnState.cat === 'wrong') {
        const r = markWrongCorrect(w.en);
        if (r && r.removed) {
          learnFeedback.textContent = '✅ 连续做对 3 次，已移出错题本！';
        } else if (r) {
          learnFeedback.textContent = '✅ 做对 ' + r.rightCount + '/3，还差 ' + (3 - r.rightCount) + ' 次移除';
        }
      }
      playKeySound('correct');
      setPetState('correct');
      speakWord(w.en);
      learnNextTimer = setTimeout(() => nextLearnWord(), 500);
    } else {
      learnState.mistakes++;
      // 跟打打错：普通跟打失败不入错题本；仅在重练错题本时重置连续计数；自动记为未掌握
      if (learnState.cat === 'wrong') addWrongWord(w);
      markMasteryWrong(w);
      playKeySound('wrong');
      learnFeedback.textContent = '❌ 正确是：' + w.en;
      learnFeedback.className = 'learn-feedback bad';
      learnInput.classList.add('wrong-input');
      setPetState('wrong');
    }
  } else {
    // 听写模式（单拼写）：输入后 Enter 直接判定，自动进入下一个
    if (learnAdvancing) return;
    learnAdvancing = true;
    learnEn.classList.remove('dict-translate');
    learnEn.textContent = w.en;
    learnEn.classList.add('revealed');
    // 判定后：英文答案 + 中文翻译一起显示（翻译在释义行）
    learnCn.textContent = w.cn || '';
    learnCn.classList.remove('hidden');
    if (val === target) {
      // 打对：自动标记已掌握，念一遍发音
      markMasteryCorrect(w);
      speakWord(w.en);
      // 错题本：连续做对 3 次自动移除
      if (learnState.cat === 'wrong') {
        const r = markWrongCorrect(w.en);
        if (r && r.removed) {
          learnFeedback.textContent = '✅ 连续做对 3 次，已移出错题本！';
        } else if (r) {
          learnFeedback.textContent = '✅ 做对 ' + r.rightCount + '/3，还差 ' + (3 - r.rightCount) + ' 次移除';
        }
      } else {
        learnFeedback.textContent = '✅ 太棒了，完全正确！';
      }
      learnFeedback.className = 'learn-feedback ok';
      learnInput.classList.add('correct-input');
      playKeySound('correct');
      setPetState('correct');
      learnNextTimer = setTimeout(() => nextLearnWord(), 600);
    } else {
      learnState.mistakes++;
      addWrongWord(w);
      // 打错：自动记为未掌握
      markMasteryWrong(w);
      playKeySound('wrong');
      learnFeedback.textContent = '❌ 正确答案：' + w.en;
      learnFeedback.className = 'learn-feedback bad';
      learnInput.classList.add('wrong-input');
      setPetState('wrong');
      learnNextTimer = setTimeout(() => nextLearnWord(), 1200);
    }
  }
}

function nextLearnWord() {
  learnAdvancing = false;
  clearTimeout(learnNextTimer);
  if (learnState.index >= learnState.words.length - 1) {
    finishLearn();
    return;
  }
  learnState.index++;
  loadLearnWord();
}

function finishLearn() {
  const elapsed = ((Date.now() - learnState.startTime) / 1000).toFixed(1);
  const total = learnState.words.length;
  const acc = Math.max(0, Math.round((1 - learnState.mistakes / total) * 100));
  saveLearnProgress(acc, elapsed);

  document.querySelector('.modal-title').textContent = '🎉 课程完成！';
  $('resultWpm').textContent = acc + '%';
  $('resultAcc').textContent = learnState.mistakes + ' 个';
  $('resultRaw').textContent = elapsed + 's';
  $('resultErrors').textContent = total;
  $('resultRating').textContent =
    acc >= 90 ? '🏆 掌握得非常好，继续加油！' :
    acc >= 70 ? '🔥 不错，再巩固一下！' :
    '💪 别灰心，多练几次就能记住！';
  $('retryBtn').textContent = '🔄 再学一轮';
  $('newTextBtn').textContent = '📝 换一组';
  // 学习完成：闪光庆祝表情
  setPetState('sparkle');
  updateWrongBadge();
  modal.classList.remove('hidden');
  learnInput.blur();
}

function saveLearnProgress(acc, elapsed) {
  const key = 'learn-progress-' + learnState.cat;
  const prev = JSON.parse(localStorage.getItem(key) || '{}');
  localStorage.setItem(key, JSON.stringify({
    best: Math.max(prev.best || 0, acc),
    last: acc,
    lastElapsed: elapsed,
    date: Date.now()
  }));
}

// ============ 结果按钮（区分打字/学习场景） ============
function handleRetry() {
  // 再学一轮：清除存档，重新洗牌
  clearLearnSession(learnState.cat);
  startLearn();
  modal.classList.add('hidden');
  learnInput.focus();
}

function handleNewText() {
  const cats = Object.keys(VOCAB);
  const next = cats[(cats.indexOf(learnState.cat) + 1) % cats.length];
  // 换一组：清除当前分类存档，重新开始
  clearLearnSession(learnState.cat);
  learnState.cat = next;
  document.querySelectorAll('.cat-btn').forEach((b) => b.classList.toggle('active', b.dataset.cat === next));
  startLearn();
  updateWrongManageBtn();
  modal.classList.add('hidden');
  learnInput.focus();
}

// ============ 词形变化 ============
// 派生词（词性转换）：{ 原词: { '词性': [[派生词, 中文释义], ...] } }
const DERIVED = {
  'happy': { '名词': [['happiness', '幸福']], '副词': [['happily', '快乐地']], '形容词': [['unhappy', '不快乐的']] },
  'friend': { '名词': [['friendship', '友谊']], '形容词': [['friendly', '友好的'], ['friendless', '没有朋友的']] },
  'love': { '名词': [['lover', '爱人'], ['loveliness', '可爱']], '形容词': [['lovely', '可爱的'], ['lovable', '讨人喜欢的']] },
  'learn': { '名词': [['learner', '学习者'], ['learning', '学习']], '形容词': [['learned', '博学的']] },
  'run': { '名词': [['runner', '跑步者'], ['running', '跑步']], '形容词': [['running', '运行中的']] },
  'dream': { '名词': [['dreamer', '梦想家']], '形容词': [['dreamy', '梦幻的']] },
  'smile': { '形容词': [['smiling', '微笑的']], '名词': [['smiley', '笑脸']] },
  'water': { '形容词': [['watery', '水汪汪的']] },
  'book': { '形容词': [['bookish', '书呆子气的']] },
  'world': { '形容词': [['worldly', '世故的'], ['worldwide', '全球的']] },
  'sun': { '形容词': [['sunny', '阳光充足的']], '名词': [['sunrise', '日出'], ['sunset', '日落']] },
  'music': { '名词': [['musician', '音乐家']], '形容词': [['musical', '音乐的']] },
  'food': { '名词': [['foodie', '美食家']] },
  'family': { '形容词': [['familial', '家庭的'], ['familiar', '熟悉的']] },
  'time': { '形容词': [['timely', '及时的'], ['timeless', '永恒的']], '名词': [['timer', '计时器']] },
  'night': { '副词': [['nightly', '每夜地']], '形容词': [['nightly', '每夜的']], '名词': [['nightlife', '夜生活']] },
  'city': { '名词': [['citizen', '市民'], ['citizenship', '公民身份']] },
  'school': { '名词': [['scholar', '学者'], ['scholarship', '奖学金']], '形容词': [['scholarly', '学术的']] },
  'environment': { '形容词': [['environmental', '环境的']], '名词': [['environmentalist', '环保主义者']] },
  'opportunity': { '形容词': [['opportune', '恰好的']] },
  'knowledge': { '形容词': [['knowledgeable', '知识渊博的']] },
  'experience': { '形容词': [['experienced', '有经验的'], ['experiential', '经验性的']] },
  'improve': { '名词': [['improvement', '改进']], '形容词': [['improved', '改进的']] },
  'achieve': { '名词': [['achievement', '成就']], '形容词': [['achievable', '可实现的']] },
  'influence': { '形容词': [['influential', '有影响力的']], '副词': [['influentially', '有影响力地']] },
  'communicate': { '名词': [['communication', '交流']], '形容词': [['communicative', '善于交流的']] },
  'culture': { '形容词': [['cultural', '文化的'], ['cultured', '有教养的']] },
  'develop': { '名词': [['development', '发展'], ['developer', '开发者']], '形容词': [['developing', '发展中的'], ['developed', '发达的']] },
  'education': { '形容词': [['educational', '教育的'], ['educated', '受过教育的']], '名词': [['educator', '教育家']] },
  'effort': { '形容词': [['effortless', '不费力的']], '副词': [['effortlessly', '轻松地']] },
  'health': { '形容词': [['healthy', '健康的'], ['unhealthy', '不健康的']], '副词': [['healthily', '健康地']] },
  'independent': { '名词': [['independence', '独立']], '副词': [['independently', '独立地']], '形容词': [['dependent', '依赖的']] },
  'memory': { '动词': [['memorize', '记住']], '形容词': [['memorable', '难忘的']], '名词': [['memorial', '纪念碑']] },
  'patient': { '名词': [['patience', '耐心']], '副词': [['patiently', '耐心地']], '形容词': [['impatient', '不耐烦的']] },
  'practice': { '形容词': [['practical', '实际的']], '名词': [['practitioner', '从业者'], ['practise', '练习(v)']] },
  'progress': { '形容词': [['progressive', '进步的']], '名词': [['progression', '进展']] },
  'language': { '形容词': [['linguistic', '语言的']], '名词': [['linguist', '语言学家']] },
  'future': { '形容词': [['futuristic', '未来主义的']] },
  'academic': { '名词': [['academy', '学院'], ['academician', '院士']], '副词': [['academically', '学术上']] },
  'abundant': { '名词': [['abundance', '丰富']], '副词': [['abundantly', '丰富地']] },
  'accommodate': { '名词': [['accommodation', '住宿']], '形容词': [['accommodating', '乐于助人的']] },
  'advocate': { '名词': [['advocacy', '提倡'], ['advocate', '提倡者']] },
  'ambiguous': { '名词': [['ambiguity', '歧义']], '副词': [['ambiguously', '含糊地']] },
  'analyze': { '名词': [['analysis', '分析'], ['analyst', '分析师']], '形容词': [['analytical', '分析的']] },
  'anticipate': { '名词': [['anticipation', '预期']], '形容词': [['anticipatory', '预期的']] },
  'authentic': { '名词': [['authenticity', '真实性']], '副词': [['authentically', '真实地']] },
  'coherent': { '名词': [['coherence', '连贯性']], '副词': [['coherently', '连贯地']] },
  'comprehensive': { '动词': [['comprehend', '理解']], '名词': [['comprehension', '理解力'], ['comprehensiveness', '全面性']] },
  'concentrate': { '名词': [['concentration', '专注']], '形容词': [['concentrated', '集中的']] },
  'confront': { '名词': [['confrontation', '对抗']], '形容词': [['confrontational', '对抗性的']] },
  'crucial': { '副词': [['crucially', '至关重要地']] },
  'deteriorate': { '名词': [['deterioration', '恶化']] },
  'efficient': { '名词': [['efficiency', '效率']], '副词': [['efficiently', '高效地']], '形容词': [['inefficient', '低效的']] },
  'elaborate': { '名词': [['elaboration', '详尽阐述']], '副词': [['elaborately', '精心地']] },
  'enhance': { '名词': [['enhancement', '增强']], '形容词': [['enhanced', '增强的']] },
  'facilitate': { '名词': [['facilitation', '促进'], ['facilitator', '促进者'], ['facility', '设施']] },
  'inevitable': { '副词': [['inevitably', '不可避免地']], '名词': [['inevitability', '必然性']] },
  'innovative': { '名词': [['innovation', '创新'], ['innovator', '创新者']], '动词': [['innovate', '创新']] }
};

const IRREGULAR_VERBS = {
  'run': ['ran', 'run', 'running'],
  'go': ['went', 'gone', 'going'],
  'do': ['did', 'done', 'doing'],
  'have': ['had', 'had', 'having'],
  'make': ['made', 'made', 'making'],
  'take': ['took', 'taken', 'taking'],
  'get': ['got', 'got', 'getting'],
  'see': ['saw', 'seen', 'seeing'],
  'give': ['gave', 'given', 'giving'],
  'find': ['found', 'found', 'finding'],
  'think': ['thought', 'thought', 'thinking'],
  'know': ['knew', 'known', 'knowing'],
  'learn': ['learned', 'learned', 'learning'],
  'come': ['came', 'come', 'coming'],
  'eat': ['ate', 'eaten', 'eating'],
  'speak': ['spoke', 'spoken', 'speaking'],
  'write': ['wrote', 'written', 'writing'],
  'read': ['read', 'read', 'reading'],
  'feel': ['felt', 'felt', 'feeling'],
  'leave': ['left', 'left', 'leaving'],
  'meet': ['met', 'met', 'meeting'],
  'put': ['put', 'put', 'putting'],
  'sell': ['sold', 'sold', 'selling'],
  'send': ['sent', 'sent', 'sending'],
  'sit': ['sat', 'sat', 'sitting'],
  'sleep': ['slept', 'slept', 'sleeping'],
  'stand': ['stood', 'stood', 'standing'],
  'swim': ['swam', 'swum', 'swimming'],
  'teach': ['taught', 'taught', 'teaching'],
  'tell': ['told', 'told', 'telling'],
  'understand': ['understood', 'understood', 'understanding'],
  'win': ['won', 'won', 'winning'],
  'wear': ['wore', 'worn', 'wearing'],
  'build': ['built', 'built', 'building'],
  'buy': ['bought', 'bought', 'buying'],
  'catch': ['caught', 'caught', 'catching'],
  'choose': ['chose', 'chosen', 'choosing'],
  'drink': ['drank', 'drunk', 'drinking'],
  'drive': ['drove', 'driven', 'driving'],
  'fall': ['fell', 'fallen', 'falling'],
  'fly': ['flew', 'flown', 'flying'],
  'forget': ['forgot', 'forgotten', 'forgetting'],
  'grow': ['grew', 'grown', 'growing'],
  'hear': ['heard', 'heard', 'hearing'],
  'lose': ['lost', 'lost', 'losing'],
  'begin': ['began', 'begun', 'beginning'],
  'break': ['broke', 'broken', 'breaking'],
  'bring': ['brought', 'brought', 'bringing'],
  'say': ['said', 'said', 'saying']
};

// 不规则名词复数
const IRREGULAR_NOUNS = {
  'man': 'men', 'woman': 'women', 'child': 'children',
  'foot': 'feet', 'tooth': 'teeth', 'mouse': 'mice',
  'person': 'people', 'sheep': 'sheep', 'fish': 'fish'
};

// 不规则形容词 [比较级, 最高级]
const IRREGULAR_ADJS = {
  'good': ['better', 'best'], 'bad': ['worse', 'worst'],
  'many': ['more', 'most'], 'much': ['more', 'most'],
  'little': ['less', 'least'], 'far': ['farther', 'farthest']
};

function pluralize(word) {
  if (IRREGULAR_NOUNS[word]) return IRREGULAR_NOUNS[word];
  if (/(s|x|z|ch|sh)$/i.test(word)) return word + 'es';
  if (/[^aeiou]y$/i.test(word)) return word.slice(0, -1) + 'ies';
  if (/(leaf|knife|wife|life|shelf)$/i.test(word)) return word.replace(/fe?$/, 'ves');
  return word + 's';
}

function thirdPerson(word) {
  if (/(s|x|z|ch|sh|o)$/i.test(word)) return word + 'es';
  if (/[^aeiou]y$/i.test(word)) return word.slice(0, -1) + 'ies';
  return word + 's';
}

function pastTense(word) {
  const ir = IRREGULAR_VERBS[word];
  if (ir) return ir[0];
  if (/e$/.test(word)) return word + 'd';
  if (/[^aeiou]y$/.test(word)) return word.slice(0, -1) + 'ied';
  if (/([^aeiou][aeiou][^aeiou])$/.test(word) && !/(w|x|y)$/.test(word)) return word + word.slice(-1) + 'ed';
  return word + 'ed';
}

function pastParticiple(word) {
  const ir = IRREGULAR_VERBS[word];
  if (ir) return ir[1];
  return pastTense(word);
}

function presentParticiple(word) {
  const ir = IRREGULAR_VERBS[word];
  if (ir) return ir[2];
  if (/ie$/.test(word)) return word.slice(0, -2) + 'ying';
  if (/e$/.test(word) && !/(ee|oe)$/.test(word)) return word.slice(0, -1) + 'ing';
  if (/([^aeiou][aeiou][^aeiou])$/.test(word) && !/(w|x|y)$/.test(word)) return word + word.slice(-1) + 'ing';
  return word + 'ing';
}

function comparative(word) {
  const ir = IRREGULAR_ADJS[word];
  if (ir) return ir[0];
  if (/y$/.test(word) && !/[aeiou]y$/.test(word)) return word.slice(0, -1) + 'ier';
  if (/e$/.test(word)) return word + 'r';
  if (word.length <= 6 && /([^aeiou][aeiou][^aeiou])$/.test(word)) return word + word.slice(-1) + 'er';
  return 'more ' + word;
}

function superlative(word) {
  const ir = IRREGULAR_ADJS[word];
  if (ir) return ir[1];
  if (/y$/.test(word) && !/[aeiou]y$/.test(word)) return word.slice(0, -1) + 'iest';
  if (/e$/.test(word)) return word + 'st';
  if (word.length <= 6 && /([^aeiou][aeiou][^aeiou])$/.test(word)) return word + word.slice(-1) + 'est';
  return 'most ' + word;
}

// 从释义中提取词性（n./v./adj.）
function getPos(cn) {
  const m = String(cn || '').match(/\b(n|v|adj|adv|prep|conj|pron)\./);
  return m ? m[1] : '';
}

// 生成某词的全部词形（形态变化 + 派生词）
function getWordForms(word, cn) {
  const pos = getPos(cn);
  const low = word.toLowerCase();
  const forms = {};
  if (pos === 'n' || pos === '') {
    forms['名词'] = [
      { label: '单数', value: word },
      { label: '复数', value: pluralize(low) }
    ];
  }
  if (pos === 'v' || pos === '') {
    forms['动词'] = [
      { label: '原形', value: word },
      { label: '过去式', value: pastTense(low) },
      { label: '过去分词', value: pastParticiple(low) },
      { label: '现在分词', value: presentParticiple(low) },
      { label: '第三人称单数', value: thirdPerson(low) }
    ];
  }
  if (pos === 'adj') {
    forms['形容词'] = [
      { label: '原级', value: word },
      { label: '比较级', value: comparative(low) },
      { label: '最高级', value: superlative(low) }
    ];
  }
  // 派生词（词性转换：名词/形容词/副词等）
  const derived = DERIVED[low];
  if (derived) {
    const list = [];
    Object.keys(derived).forEach((p) => {
      derived[p].forEach(([dw, dc]) => {
        list.push({ label: p + ' · ' + dc, value: dw });
      });
    });
    forms['派生词'] = list;
  }
  return forms;
}

function showWordForms() {
  const w = learnState.words[learnState.index];
  if (!w) return;
  if (w.type === 'sentence') {
    $('formsTitle').textContent = '句子无词形变化';
    $('formsBody').innerHTML = '<div class="forms-empty">词形变化只对单词有效，请返回单词步骤查看。</div>';
    $('formsModal').classList.remove('hidden');
    return;
  }
  const forms = getWordForms(w.en, w.cn);
  $('formsTitle').textContent = w.en + ' 的词形变化';
  const body = $('formsBody');
  body.innerHTML = '';
  const groups = Object.keys(forms);
  if (groups.length === 0) {
    body.innerHTML = '<div class="forms-empty">该词暂无词形变化（可能是短语或虚词）</div>';
  } else {
    groups.forEach((g) => {
      const groupEl = document.createElement('div');
      groupEl.className = 'forms-group';
      const title = document.createElement('div');
      title.className = 'forms-group-title';
      title.textContent = g;
      groupEl.appendChild(title);
      forms[g].forEach((item) => {
        const row = document.createElement('div');
        row.className = 'forms-item';
        const label = document.createElement('span');
        label.className = 'forms-item-label';
        label.textContent = item.label;
        const value = document.createElement('span');
        value.className = 'forms-item-value';
        value.textContent = item.value;
        row.appendChild(label);
        row.appendChild(value);
        groupEl.appendChild(row);
      });
      body.appendChild(groupEl);
    });
  }
  $('formsModal').classList.remove('hidden');
}

// ============ 学习控件 ============
function setupLearn() {
  document.querySelectorAll('.cat-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const prevCat = learnState.cat;
      // 离开当前学习界面：保存进度存档（错题本除外，每次重新生成）
      if (prevCat !== 'wrong') saveLearnSession();
      document.querySelectorAll('.cat-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      learnState.cat = btn.dataset.cat;
      // 自定义分类：若已有未完成进度则恢复，否则打开面板选择单词
      if (learnState.cat === 'custom') {
        if (prevCat === 'cet4' || prevCat === 'cet6' || prevCat === 'phrases') customSrc = prevCat;
        if (restoreLearnSession('custom')) {
          startLearn(true);
        } else {
          openCustomModal();
        }
        updateWrongManageBtn();
        updateEssayDirBtn();
        updateCustomDirBtn();
        updateSampleDirBtn();
        return;
      }
      // 作文句式：若已有未完成进度则恢复，否则打开目录
      if (learnState.cat === 'essay') {
        if (restoreLearnSession('essay')) {
          startLearn(true);
        } else {
          openEssayModal();
        }
        updateWrongManageBtn();
        updateEssayDirBtn();
        updateCustomDirBtn();
        updateSampleDirBtn();
        return;
      }
      // 作文范文：若已有未完成进度则恢复，否则打开目录
      if (learnState.cat === 'sample') {
        if (restoreLearnSession('sample')) {
          startLearn(true);
        } else {
          openSampleModal();
        }
        updateWrongManageBtn();
        updateEssayDirBtn();
        updateCustomDirBtn();
        updateSampleDirBtn();
        return;
      }
      // 普通分类：错题本不恢复（每次从错题本重新生成）；其余优先恢复存档
      if (learnState.cat === 'wrong' || !restoreLearnSession(learnState.cat)) {
        startLearn();
      } else {
        startLearn(true);
      }
      updateWrongManageBtn();
      updateEssayDirBtn();
      updateCustomDirBtn();
      updateSampleDirBtn();
    });
  });
  document.querySelectorAll('.mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      // 错题本固定使用听写测试（拒绝跟打）
      if (learnState.cat === 'wrong' && btn.dataset.lmode === 'type') return;
      document.querySelectorAll('.mode-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      // 切模式前保存当前进度，返回该分类时仍可恢复
      saveLearnSession();
      learnState.lmode = btn.dataset.lmode;
      if (learnState.cat === 'wrong' || !restoreLearnSession(learnState.cat)) {
        startLearn();
      } else {
        startLearn(true);
      }
    });
  });
  $('learnRestart').addEventListener('click', () => {
    // 重新开始：清除该分类存档，从头洗牌
    clearLearnSession(learnState.cat);
    startLearn();
    learnInput.focus();
  });
  // 发音开关
  const savedSound = localStorage.getItem('learn-sound');
  if (savedSound !== null) learnState.sound = savedSound === '1';
  updateSoundToggle();
  $('soundToggle').addEventListener('click', () => {
    learnState.sound = !learnState.sound;
    localStorage.setItem('learn-sound', learnState.sound ? '1' : '0');
    updateSoundToggle();
    if (learnState.sound) {
      const w = learnState.words[learnState.index];
      if (w) speakWord(w.en);
    } else {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }
  });
  // 播放当前单词发音（点击 🔊 或按 Shift 键）
  function playCurrentWord() {
    const w = learnState.words[learnState.index];
    if (!w) return;
    const btn = $('playBtn');
    // 立即给视觉反馈（即使语音引擎有延迟，按钮也马上响应）
    btn.classList.add('playing');
    clearTimeout(btn._playT);
    btn._playT = setTimeout(() => btn.classList.remove('playing'), 3000);
    // immediate=true：手动播放走"立即响应"通道，不等引擎空闲
    speakWord(w.en, true, () => btn.classList.remove('playing'), true);
  }
  $('playBtn').addEventListener('click', playCurrentWord);
  // 按 Shift 听当前单词发音（输入框无内容时触发，避免打字输入大写时误触）
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Shift' || e.repeat) return;
    if (document.activeElement === learnInput && learnInput.value.trim()) return;
    playCurrentWord();
  });
  // 词形变化按钮
  $('formsBtn').addEventListener('click', showWordForms);
  $('formsCloseBtn').addEventListener('click', () => $('formsModal').classList.add('hidden'));
  $('formsModal').addEventListener('click', (e) => {
    if (e.target === $('formsModal')) $('formsModal').classList.add('hidden');
  });
  // 打字音效开关
  const savedKeySound = localStorage.getItem('learn-key-sound');
  if (savedKeySound !== null) keySoundOn = savedKeySound === '1';
  updateKeySoundToggle();
  $('keySoundToggle').addEventListener('click', () => {
    keySoundOn = !keySoundOn;
    localStorage.setItem('learn-key-sound', keySoundOn ? '1' : '0');
    updateKeySoundToggle();
    if (keySoundOn) playKeySound('key');
  });
  setupWrongManage();
  setupCustom();
  setupEssay();
  setupSample();
  setupEssayDirBtn();
  setupCustomDirBtn();
  setupSampleDirBtn();
  updateWrongManageBtn();
  updateEssayDirBtn();
  updateCustomDirBtn();
  updateSampleDirBtn();
  setupLearnInput();
  renderMasteryStats();
}

function updateSoundToggle() {
  $('soundToggle').textContent = learnState.sound ? '🔊 发音：开' : '🔇 发音：关';
}

function updateKeySoundToggle() {
  $('keySoundToggle').textContent = keySoundOn ? '⌨️ 音效：开' : '⌨️ 音效：关';
}
