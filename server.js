const path = require('node:path');
const fs = require('node:fs');
const crypto = require('node:crypto');
require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// 使用 Node 内置 SQLite（>=22.5，零原生编译依赖，同步 API）
const { DatabaseSync } = require('node:sqlite');

const app = express();
const port = Number(process.env.PORT || 3000);
// 生产环境必须显式配置 JWT_SECRET，杜绝默认密钥上线
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16)) {
  console.error('FATAL: JWT_SECRET must be set (>=16 chars) in production');
  process.exit(1);
}
const jwtSecret = process.env.JWT_SECRET || 'dev-only-insecure-secret-change-me';
const root = __dirname;
const dataDir = path.join(root, 'data');
fs.mkdirSync(dataDir, { recursive: true });
const db = new DatabaseSync(path.join(dataDir, 'app.db'));
db.exec('PRAGMA journal_mode = WAL;');
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    progress_json TEXT NOT NULL DEFAULT '{}',
    created_at INTEGER NOT NULL,
    token_version INTEGER NOT NULL DEFAULT 0
  )
`);
// 兼容已有旧数据库：检查并补 token_version 列（改密后使旧 token 全部失效）
const userCols = db.prepare('PRAGMA table_info(users)').all().map((c) => c.name);
if (!userCols.includes('token_version')) {
  db.exec('ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0');
}

// ---- 审计日志（PIPL）：记录敏感操作，仅写非敏感字段（绝不含密码/令牌）----
const auditLogPath = path.join(dataDir, 'audit.log');
function logAudit(action, username, ip) {
  try {
    const line = JSON.stringify({ t: new Date().toISOString(), action, username: username || '-', ip: ip || '-' });
    fs.appendFileSync(auditLogPath, line + '\n', 'utf8');
  } catch (e) { /* 日志失败不影响主流程 */ }
}

// ---- 安全响应头 + HTTPS 强制跳转（生产用 FORCE_HTTPS=1 + 反代/Nginx 终结 TLS）----
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('Referrer-Policy', 'no-referrer');
  res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.FORCE_HTTPS === '1' && !req.secure) {
    return res.redirect(301, 'https://' + req.get('host') + req.originalUrl);
  }
  next();
});

app.use(express.json({ limit: '256kb' }));
app.use((req, res, next) => {
  if (/\/(?:server\.js|package\.json|package-lock\.json|ecosystem\.config\.cjs|\.env(?:\.|$)|start-server\.(?:ps1|bat)|.*\.bak$|data\/|node_modules\/|\.git\/)/i.test(req.path)) {
    return res.sendStatus(404);
  }
  next();
});
app.use(express.static(root, { index: 'index.html' }));

function validUsername(value) {
  return typeof value === 'string' && /^[A-Za-z0-9_\u4e00-\u9fa5]{1,12}$/.test(value);
}

function validPassword(value) {
  return typeof value === 'string' && value.length >= 6 && value.length <= 128 &&
    /[A-Za-z]/.test(value) && /\d/.test(value);
}

// 简单的内存速率限制：认证接口每 IP 每分钟最多 20 次（可用 MAX_AUTH_RATE 调整，测试用）
const MAX_AUTH_RATE = Number(process.env.MAX_AUTH_RATE || 20);
const authRate = new Map();
function rateLimit(req, res, next) {
  if (req.path.indexOf('/api/auth/') !== 0) return next();
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  let bucket = authRate.get(ip);
  if (!bucket || bucket.resetAt < now) {
    bucket = { count: 0, resetAt: now + 60000 };
    authRate.set(ip, bucket);
  }
  bucket.count++;
  // 定期清理过期桶，防止 Map 无限增长
  if (authRate.size > 5000) {
    for (const [k, v] of authRate) { if (v.resetAt < now) authRate.delete(k); }
  }
  if (bucket.count > MAX_AUTH_RATE) {
    return res.status(429).json({ error: '请求过于频繁，请稍后再试' });
  }
  next();
}
app.use(rateLimit);

// ---- Token：JWT 携带 jti（登出黑名单）与 tv（token_version，改密后全量失效）----
const revokedTokens = new Map(); // jti -> expiresAt(ms)
function makeToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, tv: user.token_version, jti: crypto.randomUUID() },
    jwtSecret,
    { expiresIn: '30d' }
  );
}
function cleanupRevoked() {
  const now = Date.now();
  for (const [jti, exp] of revokedTokens) { if (exp < now) revokedTokens.delete(jti); }
}
function auth(req, res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  let payload;
  try {
    payload = jwt.verify(token, jwtSecret);
  } catch {
    return res.status(401).json({ error: '登录已失效，请重新登录' });
  }
  // 已登出（jti 黑名单）的 token 立即失效
  cleanupRevoked();
  if (revokedTokens.has(payload.jti)) {
    return res.status(401).json({ error: '登录已失效，请重新登录' });
  }
  // 改密后 token_version 递增 → 该用户旧 token 全部失效
  const user = db.prepare('SELECT id, token_version FROM users WHERE id = ?').get(payload.id);
  if (!user || user.token_version !== payload.tv) {
    return res.status(401).json({ error: '登录已失效，请重新登录' });
  }
  req.user = payload;
  next();
}

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/auth/register', async (req, res) => {
  const { username, password, agreed } = req.body || {};
  if (!validUsername(username) || !validPassword(password)) {
    return res.status(400).json({ error: '用户名格式不正确，或密码需至少 6 位且包含字母和数字' });
  }
  // PIPL 告知同意：注册必须显式勾选（最小收集：仅用户名+密码）
  if (agreed !== true) {
    return res.status(400).json({ error: '请先阅读并同意《用户协议》与《隐私政策》' });
  }
  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (exists) return res.status(409).json({ error: '该用户名已被注册' });
  const passwordHash = await bcrypt.hash(password, 12);
  const result = db.prepare(
    'INSERT INTO users (username, password_hash, progress_json, created_at, token_version) VALUES (?, ?, ?, ?, 0)'
  ).run(username, passwordHash, '{}', Date.now());
  const user = { id: result.lastInsertRowid, username, token_version: 0 };
  logAudit('register', username, req.ip);
  res.status(201).json({ token: makeToken(user), username, progress: {} });
});

// 登录失败锁定：同一 IP+用户名 连续失败 5 次锁定 15 分钟（内存）
const loginFails = new Map(); // `${ip}|${username}` -> { count, lockedUntil }
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60 * 1000;
function cleanupLoginFails() {
  const now = Date.now();
  for (const [k, v] of loginFails) { if (v.lockedUntil && v.lockedUntil < now) loginFails.delete(k); }
}
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  const uname = String(username || '').trim();
  const ip = req.ip || 'unknown';
  const lockKey = ip + '|' + uname.toLowerCase();
  cleanupLoginFails();
  const lock = loginFails.get(lockKey);
  if (lock && lock.lockedUntil && lock.lockedUntil > Date.now()) {
    return res.status(423).json({ error: '登录失败次数过多，请 15 分钟后再试' });
  }
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(uname);
  const ok = user && typeof password === 'string' && (await bcrypt.compare(password, user.password_hash));
  if (!ok) {
    // 统一错误提示，不泄露账号是否存在
    if (!lock) loginFails.set(lockKey, { count: 1, lockedUntil: 0 });
    else { lock.count++; if (lock.count >= MAX_FAILS) lock.lockedUntil = Date.now() + LOCK_MS; }
    logAudit('login_failed', uname, ip);
    return res.status(401).json({ error: '账号或密码不正确' });
  }
  loginFails.delete(lockKey);
  logAudit('login', uname, ip);
  res.json({
    token: makeToken(user),
    username: user.username,
    progress: JSON.parse(user.progress_json || '{}')
  });
});

// 登出：把当前 token 的 jti 加入黑名单 → 立即失效
app.post('/api/auth/logout', auth, (req, res) => {
  const exp = req.user.exp ? req.user.exp * 1000 : Date.now() + 3600000;
  revokedTokens.set(req.user.jti, exp);
  logAudit('logout', req.user.username, req.ip);
  res.json({ ok: true });
});

// 刷新 token：旧 token 有效期内签发新 token（自动续期）
app.post('/api/auth/refresh', auth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(401).json({ error: '账号不存在' });
  logAudit('refresh', user.username, req.ip);
  res.json({ token: makeToken(user) });
});

app.get('/api/me', auth, (req, res) => {
  const user = db.prepare('SELECT username, progress_json FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: '账号不存在' });
  res.json({ username: user.username, progress: JSON.parse(user.progress_json || '{}') });
});

app.put('/api/auth/password', auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body || {};
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: '账号不存在' });
  if (typeof oldPassword !== 'string' || !(await bcrypt.compare(oldPassword, user.password_hash))) {
    logAudit('change_password_failed', user.username, req.ip);
    return res.status(401).json({ error: '当前密码不正确' });
  }
  if (!validPassword(newPassword)) {
    return res.status(400).json({ error: '新密码需至少 6 位且包含字母和数字' });
  }
  const passwordHash = await bcrypt.hash(newPassword, 12);
  // 改密后 token_version +1：该用户所有旧 token 立即失效
  db.prepare('UPDATE users SET password_hash = ?, token_version = token_version + 1 WHERE id = ?').run(passwordHash, user.id);
  logAudit('change_password', user.username, req.ip);
  res.json({ ok: true });
});

app.put('/api/progress', auth, (req, res) => {
  const progress = req.body && req.body.progress;
  if (!progress || typeof progress !== 'object' || Array.isArray(progress)) {
    return res.status(400).json({ error: '进度数据格式不正确' });
  }
  const clean = {};
  Object.keys(progress).slice(0, 40).forEach((key) => {
    if (/^[a-zA-Z0-9-]+$/.test(key) && typeof progress[key] === 'string' && progress[key].length <= 100000) {
      clean[key] = progress[key];
    }
  });
  db.prepare('UPDATE users SET progress_json = ? WHERE id = ?').run(JSON.stringify(clean), req.user.id);
  res.json({ ok: true });
});

app.get('*', (req, res) => res.sendFile(path.join(root, 'index.html')));

app.listen(port, '0.0.0.0', () => {
  console.log(`CET learning site listening on http://0.0.0.0:${port}`);
});
