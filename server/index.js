import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import express from 'express';
import { createPool } from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MIN_PASSWORD = 8;
const SESSION_DAYS = 30;

const pool = await createPool();
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// ---------- helpers ----------
const scrypt = (password, salt) =>
  new Promise((resolve, reject) =>
    crypto.scrypt(password, salt, 64, (err, key) => (err ? reject(err) : resolve(key.toString('hex'))))
  );
const hashPassword = async password => {
  const salt = crypto.randomBytes(16).toString('hex');
  return { salt, hash: await scrypt(password, salt) };
};
const verifyPassword = async (password, salt, hash) => {
  const test = Buffer.from(await scrypt(password, salt), 'hex');
  const real = Buffer.from(hash, 'hex');
  return test.length === real.length && crypto.timingSafeEqual(test, real);
};
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const isValidEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e).trim());
const waDigits = raw => String(raw).replace(/\D/g, '');
const isValidWhatsApp = raw => waDigits(raw).length >= 8 && waDigits(raw).length <= 15;
const isValidKraPin = pin => /^[AP]\d{9}[A-Z]$/.test(String(pin).trim().toUpperCase());
const initials = name => String(name).trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
const str = (v, max = 5000) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const fail = (res, code, error) => res.status(code).json({ success: false, error });

const publicUser = u => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  partnerId: u.partner_id || undefined,
  partnerName: u.partner_name || undefined,
  avatar: u.avatar,
  title: u.title,
  twoFactor: !!u.totp_enabled
});

// ---------- TOTP (RFC 6238) two-factor for the admin ----------
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const b32encode = buf => {
  let bits = '';
  for (const b of buf) bits += b.toString(2).padStart(8, '0');
  return (bits.match(/.{1,5}/g) || []).map(c => B32[parseInt(c.padEnd(5, '0'), 2)]).join('');
};
const b32decode = s => {
  let bits = '';
  for (const ch of s.replace(/=+$/, '')) bits += B32.indexOf(ch).toString(2).padStart(5, '0');
  return Buffer.from((bits.match(/.{8}/g) || []).map(b => parseInt(b, 2)));
};
const hotp = (secret, counter) => {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const h = crypto.createHmac('sha1', b32decode(secret)).update(msg).digest();
  const o = h[h.length - 1] & 0xf;
  const n = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 1000000).padStart(6, '0');
};
// Returns the matched time step (so it can't be replayed), or 0 when the code is wrong.
const verifyTotp = (secret, code, lastStep) => {
  if (!/^\d{6}$/.test(code)) return 0;
  const now = Math.floor(Date.now() / 30000);
  for (let step = now - 1; step <= now + 1; step++) {
    if (step > lastStep && safeEqual(hotp(secret, step), code)) return step;
  }
  return 0;
};
const newRecoveryCodes = () =>
  Array.from({ length: 8 }, () => {
    const h = crypto.randomBytes(5).toString('hex');
    return `${h.slice(0, 5)}-${h.slice(5)}`;
  });

const WINDOW_MS = 15 * 60 * 1000;
const QUARANTINE_MS = 24 * 60 * 60 * 1000;
const attempts = new Map();
const quarantined = new Map(); // ip -> release time
const recent = key => {
  const now = Date.now();
  const rec = (attempts.get(key) || []).filter(t => now - t < WINDOW_MS);
  if (rec.length) attempts.set(key, rec);
  else attempts.delete(key);
  return rec;
};
const rateLimited = (key, max = 8) => recent(key).length >= max;
const noteAttempt = key => attempts.set(key, [...recent(key), Date.now()]);

// Repeated hostile behaviour from one IP gets it blocked from the whole site.
const quarantine = (ip, reason) => {
  if (quarantined.has(ip)) return;
  quarantined.set(ip, Date.now() + QUARANTINE_MS);
  console.warn(`[SECURITY] Quarantined ${ip} for 24h: ${reason}`);
};
const strike = (ip, reason, limit = 10) => {
  noteAttempt(`strike|${ip}`);
  if (recent(`strike|${ip}`).length >= limit) quarantine(ip, reason);
};
setInterval(() => {
  const now = Date.now();
  for (const [ip, until] of quarantined) if (until < now) quarantined.delete(ip);
  for (const key of attempts.keys()) recent(key);
}, 10 * 60 * 1000).unref();

const PROBE = /(\.env|\.git|wp-admin|wp-login|phpmyadmin|\.php|\.asp|\/etc\/passwd|\.\.[\\/]|xmlrpc|cgi-bin|\.sql|\.bak)/i;
const DUMMY_SALT = crypto.randomBytes(16).toString('hex');
const DUMMY_HASH = crypto.randomBytes(64).toString('hex');
const SETUP_TOKEN = process.env.SETUP_TOKEN || '';
const safeEqual = (a, b) => {
  const x = crypto.createHash('sha256').update(String(a)).digest();
  const y = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(x, y);
};

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// ---------- auth middleware ----------
const auth = wrap(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  req.user = null;
  if (token) {
    const { rows } = await pool.query(
      `SELECT u.*, p.data->>'name' AS partner_name FROM sessions s JOIN users u ON u.id = s.user_id
       LEFT JOIN partners p ON p.id = u.partner_id WHERE s.token_hash = $1 AND s.expires_at > now()`,
      [sha(token)]
    );
    if (rows[0]) req.user = rows[0];
    req.token = token;
  }
  next();
});
const adminReady = u => u?.role === 'admin' && !!u.totp_enabled;
const needAdmin = (req, res, next) => {
  if (req.user?.role === 'admin' && !req.user.totp_enabled) {
    return fail(res, 403, 'Set up two-factor authentication before using admin features.');
  }
  return adminReady(req.user) ? next() : fail(res, 403, 'Only the global admin can do this.');
};
const canManagePartner = (user, partnerId) =>
  !!user && (adminReady(user) || (user.role === 'partner' && user.partner_id === partnerId));

const startSession = async userId => {
  const token = crypto.randomBytes(32).toString('hex');
  await pool.query(
    `INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, now() + interval '${SESSION_DAYS} days')`,
    [sha(token), userId]
  );
  return token;
};

app.use((req, res, next) => {
  const until = quarantined.get(req.ip);
  if (until && until > Date.now()) return res.status(403).type('text').send('Access blocked.');
  let decoded = req.path;
  try { decoded = decodeURIComponent(req.path); } catch { /* malformed encoding is itself suspicious */ strike(req.ip, 'malformed URL', 3); }
  if (PROBE.test(decoded)) {
    strike(req.ip, `probing ${req.path}`, 3);
    return res.status(404).type('text').send('Not found.');
  }
  next();
});

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; media-src 'self' blob:; " +
      "connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'"
  );
  if (req.path.startsWith('/api')) res.setHeader('Cache-Control', 'no-store');
  next();
});

// Global flood control per IP.
app.use((req, res, next) => {
  const key = `req|${req.ip}`;
  noteAttempt(key);
  if (rateLimited(key, 3000)) { strike(req.ip, 'request flood', 3); return fail(res, 429, 'Too many requests.'); }
  next();
});

app.use(express.json({ limit: '12mb' }));
app.use('/api', auth);

// ---------- bootstrap ----------
app.get('/api/bootstrap', wrap(async (req, res) => {
  const [admins, partners, products, hero] = await Promise.all([
    pool.query(`SELECT 1 FROM users WHERE role = 'admin' LIMIT 1`),
    pool.query(`SELECT data FROM partners ORDER BY created_at`),
    pool.query(`SELECT data FROM products ORDER BY created_at DESC`),
    pool.query(`SELECT value FROM settings WHERE key = 'hero_image'`)
  ]);
  res.json({
    hasAdmin: admins.rows.length > 0,
    partners: partners.rows.map(r => r.data),
    products: products.rows.map(r => r.data),
    heroImage: hero.rows[0]?.value || null,
    me: req.user ? publicUser(req.user) : null
  });
}));

// ---------- auth ----------
app.post('/api/setup-admin', wrap(async (req, res) => {
  const setupKey = `setup|${req.ip}`;
  if (rateLimited(setupKey, 5)) return fail(res, 429, 'Too many attempts. Try again later.');
  if (!SETUP_TOKEN) return fail(res, 503, 'Setup is disabled: SETUP_TOKEN is not configured on the server.');
  if (!safeEqual(req.body.setupCode || '', SETUP_TOKEN)) {
    noteAttempt(setupKey);
    strike(req.ip, 'bad admin setup code', 5);
    return fail(res, 403, 'Invalid setup code.');
  }
  const name = str(req.body.name, 100);
  const email = str(req.body.email, 200).toLowerCase();
  const password = String(req.body.password || '');
  if (!name) return fail(res, 400, 'Name is required.');
  if (!isValidEmail(email)) return fail(res, 400, 'Enter a valid email address.');
  if (password.length < MIN_PASSWORD) return fail(res, 400, `Password must be at least ${MIN_PASSWORD} characters.`);
  const { salt, hash } = await hashPassword(password);
  const id = `user-admin-${Date.now()}`;
  // Single statement so two simultaneous setups cannot both become admin.
  const ins = await pool.query(
    `INSERT INTO users (id, name, email, role, avatar, title, salt, hash)
     SELECT $1, $2, $3, 'admin', $4, 'Global Platform Admin', $5, $6
     WHERE NOT EXISTS (SELECT 1 FROM users WHERE role = 'admin') RETURNING *`,
    [id, name, email, initials(name), salt, hash]
  );
  if (!ins.rows[0]) return fail(res, 409, 'An admin account already exists.');
  res.json({ success: true, token: await startSession(id), user: publicUser(ins.rows[0]) });
}));

app.post('/api/login', wrap(async (req, res) => {
  const email = str(req.body.email, 200).toLowerCase();
  const password = String(req.body.password || '');
  const key = `${req.ip}|${email}`;
  const acctKey = `acct|${email}`;
  const ipKey = `ip|${req.ip}`;
  if (rateLimited(key) || rateLimited(acctKey, 15) || rateLimited(ipKey, 20)) {
    return fail(res, 429, 'Too many attempts. Try again in 15 minutes.');
  }
  const { rows } = await pool.query(
    `SELECT u.*, p.data->>'name' AS partner_name FROM users u LEFT JOIN partners p ON p.id = u.partner_id WHERE u.email = $1`,
    [email]
  );
  const u = rows[0];
  const ok = await verifyPassword(password, u ? u.salt : DUMMY_SALT, u ? u.hash : DUMMY_HASH);
  if (!u || !ok) {
    noteAttempt(key);
    noteAttempt(acctKey);
    noteAttempt(ipKey);
    strike(req.ip, `repeated failed logins (${email})`, 25);
    return fail(res, 401, 'Invalid email or password.');
  }
  if (u.role === 'admin' && u.totp_enabled) {
    const code = str(req.body.code, 20).replace(/\s/g, '');
    if (!code) return res.json({ success: false, needsCode: true, error: 'Enter the 6-digit code from your authenticator app.' });
    let good = false;
    const step = verifyTotp(u.totp_secret, code, Number(u.totp_last));
    if (step) {
      const upd = await pool.query(`UPDATE users SET totp_last = $2 WHERE id = $1 AND totp_last < $2`, [u.id, step]);
      good = upd.rowCount > 0;
    } else {
      const hashes = JSON.parse(u.totp_recovery || '[]');
      const h = sha(code.toLowerCase());
      if (hashes.includes(h)) {
        await pool.query(`UPDATE users SET totp_recovery = $2 WHERE id = $1`, [u.id, JSON.stringify(hashes.filter(x => x !== h))]);
        good = true;
      }
    }
    if (!good) {
      noteAttempt(key);
      noteAttempt(acctKey);
      noteAttempt(ipKey);
      strike(req.ip, `bad two-factor code (${email})`, 15);
      return res.status(401).json({ success: false, needsCode: true, error: 'Invalid code.' });
    }
  }
  res.json({ success: true, token: await startSession(u.id), user: publicUser(u) });
}));

app.post('/api/2fa/reset', wrap(async (req, res) => {
  const email = str(req.body.email, 200).toLowerCase();
  const password = String(req.body.password || '');
  const ipKey = `reset|${req.ip}`;
  if (rateLimited(ipKey, 5)) return fail(res, 429, 'Too many attempts. Try again later.');
  const { rows } = await pool.query(`SELECT * FROM users WHERE email = $1 AND role = 'admin'`, [email]);
  const u = rows[0];
  const pwOk = await verifyPassword(password, u ? u.salt : DUMMY_SALT, u ? u.hash : DUMMY_HASH);
  const codeOk = !!SETUP_TOKEN && safeEqual(req.body.setupCode || '', SETUP_TOKEN);
  if (!u || !pwOk || !codeOk) {
    noteAttempt(ipKey);
    strike(req.ip, 'bad two-factor reset attempt', 5);
    return fail(res, 401, 'Reset failed. Check your email, password and setup code.');
  }
  await pool.query(
    `UPDATE users SET totp_enabled = false, totp_secret = NULL, totp_recovery = NULL, totp_last = 0 WHERE id = $1`,
    [u.id]
  );
  await pool.query(`DELETE FROM sessions WHERE user_id = $1`, [u.id]);
  console.warn(`[SECURITY] Two-factor reset for admin ${email} from ${req.ip}`);
  res.json({ success: true });
}));

app.post('/api/2fa/setup', wrap(async (req, res) => {
  if (req.user?.role !== 'admin') return fail(res, 403, 'Only the admin can set up two-factor.');
  if (req.user.totp_enabled) return fail(res, 409, 'Two-factor is already enabled.');
  const secret = b32encode(crypto.randomBytes(20));
  await pool.query(`UPDATE users SET totp_secret = $2 WHERE id = $1`, [req.user.id, secret]);
  const label = encodeURIComponent(`Spinners&Spinners:${req.user.email}`);
  res.json({ success: true, secret, otpauth: `otpauth://totp/${label}?secret=${secret}&issuer=Spinners%26Spinners` });
}));

app.post('/api/2fa/enable', wrap(async (req, res) => {
  if (req.user?.role !== 'admin') return fail(res, 403, 'Only the admin can set up two-factor.');
  if (req.user.totp_enabled) return fail(res, 409, 'Two-factor is already enabled.');
  const key = `2fa|${req.user.id}`;
  if (rateLimited(key, 8)) return fail(res, 429, 'Too many attempts. Try again later.');
  const step = req.user.totp_secret ? verifyTotp(req.user.totp_secret, str(req.body.code, 10).replace(/\s/g, ''), 0) : 0;
  if (!step) {
    noteAttempt(key);
    return fail(res, 400, 'That code is not correct. Check the app and try again.');
  }
  const codes = newRecoveryCodes();
  await pool.query(
    `UPDATE users SET totp_enabled = true, totp_last = $2, totp_recovery = $3 WHERE id = $1`,
    [req.user.id, step, JSON.stringify(codes.map(c => sha(c)))]
  );
  res.json({ success: true, recoveryCodes: codes });
}));

app.post('/api/logout', wrap(async (req, res) => {
  if (req.token) await pool.query(`DELETE FROM sessions WHERE token_hash = $1`, [sha(req.token)]);
  res.json({ success: true });
}));

// ---------- partners ----------
const mergeData = async (db, table, id, patch) => {
  const cur = await db.query(`SELECT data FROM ${table} WHERE id = $1`, [id]);
  if (!cur.rows.length) return { rows: [] };
  const data = { ...cur.rows[0].data, ...patch };
  await db.query(`UPDATE ${table} SET data = $2 WHERE id = $1`, [id, JSON.stringify(data)]);
  return { rows: [{ data }] };
};
app.post('/api/partners', needAdmin, wrap(async (req, res) => {
  const b = req.body || {};
  const name = str(b.name, 120);
  const email = str(b.email, 200).toLowerCase();
  const leadDesigner = str(b.leadDesigner, 120);
  const password = String(b.password || '');
  if (!name) return fail(res, 400, 'Partner name is required.');
  if (!leadDesigner) return fail(res, 400, 'Lead designer / partner admin name is required.');
  if (!isValidWhatsApp(b.whatsapp || '')) return fail(res, 400, 'Enter a valid WhatsApp number with country code (e.g. +254712345678).');
  if (!isValidKraPin(b.kraPin || '')) return fail(res, 400, 'Enter a valid KRA PIN (e.g. A123456789Z).');
  if (!str(b.address)) return fail(res, 400, 'Business location / address is required.');
  const deliveryAvailable = !!b.deliveryAvailable;
  const fee = Number(b.deliveryFee);
  if (deliveryAvailable && !(fee >= 0)) return fail(res, 400, 'Enter a valid delivery charge.');
  if (!isValidEmail(email)) return fail(res, 400, 'Enter a valid login email for the partner.');
  if (password.length < MIN_PASSWORD) return fail(res, 400, `Password must be at least ${MIN_PASSWORD} characters.`);
  if (b.heroImage && (typeof b.heroImage !== 'string' || !b.heroImage.startsWith('data:image/'))) {
    return fail(res, 400, 'Invalid hero image.');
  }

  const dupEmail = await pool.query(`SELECT 1 FROM users WHERE email = $1`, [email]);
  if (dupEmail.rows.length) return fail(res, 409, 'This login email is already in use.');
  const dupName = await pool.query(`SELECT 1 FROM partners WHERE lower(data->>'name') = $1`, [name.toLowerCase()]);
  if (dupName.rows.length) return fail(res, 409, 'A partner with this name already exists.');

  const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'partner';
  const exists = await pool.query(`SELECT 1 FROM partners WHERE id = $1`, [slug]);
  const id = exists.rows.length ? `${slug}-${Date.now()}` : slug;

  const partner = {
    id,
    name,
    location: str(b.location, 200),
    tagline: str(b.tagline, 300),
    ethos: str(b.ethos, 1000),
    accentColor: '#c5a059',
    heroImage: b.heroImage || undefined,
    founded: Number(b.founded) || new Date().getFullYear(),
    leadDesigner,
    specialty: str(b.specialty, 300),
    story: str(b.story, 4000),
    bannerText: str(b.bannerText, 300),
    whatsapp: str(b.whatsapp, 30),
    kraPin: str(b.kraPin, 20).toUpperCase(),
    address: str(b.address, 400),
    deliveryAvailable,
    deliveryFee: deliveryAvailable ? Math.round(fee) : 0
  };
  const { salt, hash } = await hashPassword(password);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`INSERT INTO partners (id, data) VALUES ($1, $2)`, [id, JSON.stringify(partner)]);
    await client.query(
      `INSERT INTO users (id, name, email, role, partner_id, avatar, title, salt, hash) VALUES ($1,$2,$3,'partner',$4,$5,$6,$7,$8)`,
      [`user-partner-${id}`, leadDesigner, email, id, initials(leadDesigner), `Partner Admin (${name})`, salt, hash]
    );
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
  res.json({ success: true, partner });
}));

app.post('/api/partners/:id/password', needAdmin, wrap(async (req, res) => {
  const password = String(req.body.password || '');
  if (password.length < MIN_PASSWORD) return fail(res, 400, `Password must be at least ${MIN_PASSWORD} characters.`);
  const { salt, hash } = await hashPassword(password);
  const r = await pool.query(`UPDATE users SET salt = $1, hash = $2 WHERE partner_id = $3 RETURNING id`, [salt, hash, req.params.id]);
  if (!r.rows.length) return fail(res, 404, 'Partner login not found.');
  await pool.query(`DELETE FROM sessions WHERE user_id = $1`, [r.rows[0].id]);
  res.json({ success: true });
}));

app.delete('/api/partners/:id', needAdmin, wrap(async (req, res) => {
  const id = req.params.id;
  const prods = await pool.query(`SELECT data->>'videoId' AS v FROM products WHERE partner_id = $1`, [id]);
  for (const v of prods.rows.map(r => r.v).filter(Boolean)) await pool.query(`DELETE FROM videos WHERE id = $1`, [v]);
  await pool.query(`DELETE FROM sessions WHERE user_id IN (SELECT id FROM users WHERE partner_id = $1)`, [id]);
  await pool.query(`DELETE FROM users WHERE partner_id = $1`, [id]);
  await pool.query(`DELETE FROM products WHERE partner_id = $1`, [id]);
  await pool.query(`DELETE FROM partners WHERE id = $1`, [id]);
  res.json({ success: true });
}));

app.patch('/api/partners/:id/fulfilment', wrap(async (req, res) => {
  const id = req.params.id;
  if (!canManagePartner(req.user, id)) return fail(res, 403, 'Not allowed.');
  const address = str(req.body.address, 400);
  const deliveryAvailable = !!req.body.deliveryAvailable;
  const fee = Number(req.body.deliveryFee);
  if (!address) return fail(res, 400, 'Business location / address is required.');
  if (deliveryAvailable && !(fee >= 0)) return fail(res, 400, 'Enter a valid delivery charge.');
  const patch = { address, deliveryAvailable, deliveryFee: deliveryAvailable ? Math.round(fee) : 0 };
  const r = await mergeData(pool, 'partners', id, patch);
  if (!r.rows.length) return fail(res, 404, 'Partner not found.');
  res.json({ success: true, partner: r.rows[0].data });
}));

// ---------- site settings ----------
app.put('/api/hero', needAdmin, wrap(async (req, res) => {
  const image = req.body.image;
  if (image !== null && (typeof image !== 'string' || !image.startsWith('data:image/'))) return fail(res, 400, 'Invalid image.');
  if (image === null) await pool.query(`DELETE FROM settings WHERE key = 'hero_image'`);
  else await pool.query(
    `INSERT INTO settings (key, value) VALUES ('hero_image', $1) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [image]
  );
  res.json({ success: true });
}));

// ---------- products ----------
app.post('/api/products', wrap(async (req, res) => {
  const b = req.body || {};
  const partnerId = str(b.partnerId, 200);
  if (!canManagePartner(req.user, partnerId)) return fail(res, 403, 'You can only upload products to your own section.');
  const pr = await pool.query(`SELECT data->>'name' AS name FROM partners WHERE id = $1`, [partnerId]);
  if (!pr.rows[0]) return fail(res, 404, 'Partner not found.');
  const title = str(b.title, 200);
  const description = str(b.description, 4000);
  if (!title || !description) return fail(res, 400, 'Item name and description are required.');
  if (typeof b.image !== 'string' || !b.image.startsWith('data:image/')) return fail(res, 400, 'Please upload a photo.');
  const stock = Number(b.stock);
  if (!Number.isInteger(stock) || stock < 1) return fail(res, 400, 'Quantity must be a whole number of at least 1.');
  const price = Number(b.price) > 0 ? Number(b.price) : 0;

  let videoId;
  if (b.videoId) {
    const v = await pool.query(`SELECT owner_id FROM videos WHERE id = $1`, [String(b.videoId)]);
    if (!v.rows[0] || v.rows[0].owner_id !== req.user.id) return fail(res, 400, 'Video not found.');
    videoId = String(b.videoId);
  }

  const typed = str(b.category, 80).replace(/\s+/g, ' ') || 'General';
  const existing = await pool.query(`SELECT data->>'category' AS c FROM products WHERE lower(data->>'category') = $1 LIMIT 1`, [typed.toLowerCase()]);
  const category = existing.rows[0]?.c || typed;

  const id = `prod-${partnerId}-${Date.now()}`;
  const product = {
    id,
    partnerId,
    partnerName: pr.rows[0].name,
    title,
    category,
    price,
    currency: 'KES',
    image: b.image,
    description,
    details: [],
    materials: [],
    sizes: ['Bespoke Custom Measurements'],
    leadTime: 'On request',
    featured: false,
    stock,
    videoId
  };
  await pool.query(`INSERT INTO products (id, partner_id, data) VALUES ($1, $2, $3)`, [id, partnerId, JSON.stringify(product)]);
  res.json({ success: true, product });
}));

const loadManageable = async (req, res) => {
  const { rows } = await pool.query(`SELECT partner_id, data FROM products WHERE id = $1`, [req.params.id]);
  if (!rows[0]) return void fail(res, 404, 'Product not found.');
  if (!canManagePartner(req.user, rows[0].partner_id)) return void fail(res, 403, 'Not allowed.');
  return rows[0];
};

app.delete('/api/products/:id', wrap(async (req, res) => {
  const row = await loadManageable(req, res);
  if (!row) return;
  await pool.query(`DELETE FROM products WHERE id = $1`, [req.params.id]);
  if (row.data.videoId) await pool.query(`DELETE FROM videos WHERE id = $1`, [row.data.videoId]);
  res.json({ success: true });
}));

app.patch('/api/products/:id/stock', wrap(async (req, res) => {
  const row = await loadManageable(req, res);
  if (!row) return;
  const stock = Number(req.body.stock);
  if (!Number.isInteger(stock) || stock < 0) return fail(res, 400, 'Stock must be a whole number of 0 or more.');
  const r = await mergeData(pool, 'products', req.params.id, { stock });
  res.json({ success: true, product: r.rows[0].data });
}));

app.post('/api/products/:id/sold', wrap(async (req, res) => {
  const row = await loadManageable(req, res);
  if (!row) return;
  const qty = Math.max(1, Math.floor(Number(req.body.quantity) || 1));
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const cur = await client.query(`SELECT data FROM products WHERE id = $1 FOR UPDATE`, [req.params.id]);
    const current = cur.rows[0].data.stock;
    if (typeof current !== 'number') {
      await client.query('ROLLBACK');
      return fail(res, 400, 'This product has no stock count.');
    }
    const r = await mergeData(client, 'products', req.params.id, { stock: Math.max(0, current - qty) });
    await client.query('COMMIT');
    res.json({ success: true, product: r.rows[0].data });
  } catch (e) {
    await client.query('ROLLBACK').catch(() => {});
    throw e;
  } finally {
    client.release();
  }
}));

// ---------- videos ----------
app.post('/api/videos', express.raw({ type: 'video/*', limit: MAX_VIDEO_BYTES }), wrap(async (req, res) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'partner')) return fail(res, 403, 'Login required.');
  if (!Buffer.isBuffer(req.body) || !req.body.length) return fail(res, 400, 'No video received.');
  const id = `vid-${crypto.randomUUID()}`;
  await pool.query(`INSERT INTO videos (id, owner_id, mime, data) VALUES ($1, $2, $3, $4)`, [
    id,
    req.user.id,
    String(req.headers['content-type']).split(';')[0],
    req.body
  ]);
  res.json({ success: true, videoId: id });
}));

app.get('/api/videos/:id', wrap(async (req, res) => {
  const { rows } = await pool.query(`SELECT mime, data FROM videos WHERE id = $1`, [req.params.id]);
  if (!rows[0]) return res.status(404).end();
  const { mime, data } = rows[0];
  res.setHeader('Content-Type', mime);
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  if (range) {
    const start = range[1] ? parseInt(range[1], 10) : 0;
    const end = range[2] ? Math.min(parseInt(range[2], 10), data.length - 1) : data.length - 1;
    if (start > end || start >= data.length) {
      res.setHeader('Content-Range', `bytes */${data.length}`);
      return res.status(416).end();
    }
    res.status(206);
    res.setHeader('Content-Range', `bytes ${start}-${end}/${data.length}`);
    res.setHeader('Content-Length', end - start + 1);
    return res.end(data.subarray(start, end + 1));
  }
  res.setHeader('Content-Length', data.length);
  res.end(data);
}));

app.use('/api', (_req, res) => res.status(404).json({ success: false, error: 'Not found.' }));

// ---------- static site ----------
const dist = path.join(__dirname, '..', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist, { index: false, maxAge: '1h' }));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use((err, _req, res, _next) => {
  if (err?.type === 'entity.too.large') return fail(res, 413, 'File is too large.');
  console.error(err);
  fail(res, 500, 'Server error.');
});

const port = Number(process.env.PORT) || 4000;
app.listen(port, '0.0.0.0', () => console.log(`Server listening on ${port}`));
