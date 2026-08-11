// Backend security/functional test suite (Node 18+)
// Spawns server.js on a test port and runs API assertions.
// Usage: node test-backend.js
const { spawn } = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');

const PORT = 3999;
const BASE = `http://127.0.0.1:${PORT}`;
const root = __dirname;

const results = [];
function check(name, cond, detail) {
  results.push({ name, pass: !!cond, detail: detail || '' });
  console.log(`${cond ? 'PASS' : 'FAIL'} | ${name}${detail ? ' | ' + detail : ''}`);
}

async function api(method, p, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = 'Bearer ' + token;
  const res = await fetch(BASE + p, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function waitReady(timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try { const r = await fetch(BASE + '/api/health'); if (r.ok) return true; } catch (e) {}
    await new Promise((r) => setTimeout(r, 300));
  }
  return false;
}

(async () => {
  const child = spawn(process.execPath, ['server.js'], {
    env: { ...process.env, PORT: String(PORT), NODE_ENV: 'test', JWT_SECRET: 'test-secret-0123456789abcdef', MAX_AUTH_RATE: '1000' },
    cwd: root,
    stdio: 'ignore'
  });
  try {
    if (!(await waitReady(15000))) { console.log('FATAL: server not ready'); process.exit(1); }

    // 1) 注册
    let r = await api('POST', '/api/auth/register', { username: 'alice', password: 'pass1234' });
    check('register without consent agreed -> 400 (PIPL)', r.status === 400, JSON.stringify(r.data));
    r = await api('POST', '/api/auth/register', { username: 'alice', password: '123', agreed: true });
    check('register weak password -> 400', r.status === 400);
    r = await api('POST', '/api/auth/register', { username: 'alice', password: 'pass1234', agreed: true });
    check('register ok -> 201 + token', r.status === 201 && !!r.data.token, 'username=' + r.data.username);
    const aliceToken = r.data.token;
    r = await api('POST', '/api/auth/register', { username: 'alice', password: 'pass1234', agreed: true });
    check('duplicate register -> 409', r.status === 409);

    // 2) 登录（统一提示不泄露账号存在）
    r = await api('POST', '/api/auth/login', { username: 'ghost', password: 'whatever1' });
    check('login nonexistent -> 401 unified msg', r.status === 401 && r.data.error === '账号或密码不正确');
    r = await api('POST', '/api/auth/login', { username: 'alice', password: 'wrongpw' });
    check('login wrong password -> 401 unified', r.status === 401 && r.data.error === '账号或密码不正确');
    r = await api('POST', '/api/auth/login', { username: 'alice', password: 'pass1234' });
    check('login ok -> 200 + token', r.status === 200 && !!r.data.token);
    check('login response has no password fields', !('password' in r.data) && !('password_hash' in r.data));

    // 2.5) SQL 注入尝试（参数化查询应拒绝；置于限流触发前，避免 429 干扰）
    r = await api('POST', '/api/auth/login', { username: "' OR '1'='1", password: "' OR '1'='1" });
    check('sql injection attempt rejected -> 401', r.status === 401);
    r = await api('POST', '/api/auth/login', { username: "alice'--", password: 'x' });
    check('sql comment injection attempt rejected -> 401', r.status === 401);

    // 3) 登录失败锁定（独立用户，避免影响 alice 后续登录）
    let locked = false;
    for (let i = 0; i < 6; i++) {
      const rr = await api('POST', '/api/auth/login', { username: 'locktarget', password: 'wrongpw' });
      if (rr.status === 423) { locked = true; break; }
    }
    check('login lockout after 5 fails -> 423', locked);

    // 4) 改密 + 旧 token 即时失效（token_version）
    r = await api('PUT', '/api/auth/password', { oldPassword: 'badold', newPassword: 'newpass88' }, aliceToken);
    check('change password wrong old -> 401', r.status === 401);
    r = await api('PUT', '/api/auth/password', { oldPassword: 'pass1234', newPassword: 'newpass88' }, aliceToken);
    check('change password ok -> 200', r.status === 200);
    r = await api('GET', '/api/me', null, aliceToken);
    check('old token invalid after password change -> 401', r.status === 401);
    r = await api('POST', '/api/auth/login', { username: 'alice', password: 'newpass88' });
    check('login with new password ok', r.status === 200);
    const aliceToken2 = r.data.token;

    // 5) 登出 → token 即时失效（jti 黑名单）
    r = await api('POST', '/api/auth/logout', null, aliceToken2);
    check('logout -> 200', r.status === 200);
    r = await api('GET', '/api/me', null, aliceToken2);
    check('token invalid after logout -> 401', r.status === 401);

    // 6) 刷新
    r = await api('POST', '/api/auth/refresh', null, aliceToken2);
    check('refresh with revoked token -> 401', r.status === 401);
    const bob = await api('POST', '/api/auth/register', { username: 'bob', password: 'bobpass1', agreed: true });
    r = await api('POST', '/api/auth/refresh', null, bob.data.token);
    check('refresh ok -> 200 new token', r.status === 200 && !!r.data.token);
    const bobToken2 = r.data.token;
    r = await api('GET', '/api/me', null, bobToken2);
    check('refreshed token works on /api/me', r.status === 200 && r.data.username === 'bob');

    // 7) IDOR / 伪造 token
    const jwt = require('jsonwebtoken');
    const forged = jwt.sign({ id: 1, username: 'alice', tv: 0, jti: 'x' }, 'wrong-secret', { expiresIn: '5m' });
    r = await api('GET', '/api/me', null, forged);
    check('forged token (wrong secret) rejected -> 401', r.status === 401);
    const parts = bob.data.token.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    payload.id = payload.id + 1000; // 篡改用户 id
    const tampered = parts[0] + '.' + Buffer.from(JSON.stringify(payload)).toString('base64url') + '.' + parts[2];
    r = await api('GET', '/api/me', null, tampered);
    check('tampered token (changed id) rejected -> 401', r.status === 401);

    // 10) 安全响应头
    const res = await fetch(BASE + '/');
    check('security header x-content-type-options', res.headers.get('x-content-type-options') === 'nosniff');
    check('security header x-frame-options', res.headers.get('x-frame-options') === 'DENY');

    // 11) 敏感文件拦截（Express）
    for (const p of ['/server.js', '/.env', '/package.json', '/start-server.ps1']) {
      const rr = await fetch(BASE + p);
      check('sensitive file blocked: ' + p, rr.status === 404);
    }

    // 12) 审计日志（存在 + 无密码明文）
    const audit = fs.existsSync(path.join(root, 'data', 'audit.log'))
      ? fs.readFileSync(path.join(root, 'data', 'audit.log'), 'utf8') : '';
    const lines = audit.split('\n').filter((l) => l.trim());
    check('audit log has entries', lines.length >= 8, lines.length + ' lines');
    check('audit log has no password plaintext', !audit.includes('pass1234') && !audit.includes('newpass88'));
  } finally {
    child.kill();
  }

  // 限流专项：用默认阈值（20/分）的独立实例验证，避免与主流程互相干扰
  const rl = spawn(process.execPath, ['server.js'], {
    env: { ...process.env, PORT: String(PORT), NODE_ENV: 'test', JWT_SECRET: 'test-secret-0123456789abcdef' },
    cwd: root,
    stdio: 'ignore'
  });
  try {
    if (await waitReady(15000)) {
      let got429 = false;
      for (let i = 0; i < 25; i++) {
        const rr = await api('POST', '/api/auth/login', { username: 'ratelimit', password: 'wrong' });
        if (rr.status === 429) { got429 = true; break; }
      }
      check('rate limit -> 429 (default threshold)', got429);
    } else {
      check('rate limit -> 429 (default threshold)', false, 'server not ready');
    }
  } finally {
    rl.kill();
  }
  const passed = results.filter((x) => x.pass).length;
  console.log(`\n=== ${passed}/${results.length} checks passed ===`);
  process.exit(passed === results.length ? 0 : 1);
})();
