// server.js — REST API for the Student Profile app.
// The Cordova app talks to this API; it never touches the database directly.

require('dotenv').config();

const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

// ---- configuration (from environment variables only) -------------------
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('JWT_SECRET is missing or too short (need 32+ characters). Copy .env.example to .env and set it.');
  process.exit(1);
}
const PORT = Number(process.env.PORT) || 3000;
const TOKEN_TTL_SECONDS = 60 * 60 * 8; // 8 hours
const CORS_ORIGINS = (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);

// A hash to compare against when the account doesn't exist, so response
// time doesn't reveal which student IDs are registered.
const DUMMY_HASH = bcrypt.hashSync(crypto.randomBytes(16).toString('hex'), 10);

const app = express();
app.disable('x-powered-by');
app.use(cors(CORS_ORIGINS.length ? { origin: CORS_ORIGINS } : {})); // bearer tokens, no cookies
app.use(express.json({ limit: '1mb' }));

// ---- helpers ------------------------------------------------------------
const fail = (res, status, message) => res.status(status).json({ error: message });
const text = (v) => (typeof v === 'string' ? v.trim() : '');

// Very small in-memory login throttle: 10 failed attempts / 15 min per IP+identifier.
const attempts = new Map();
function throttled(key) {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now - rec.start > 15 * 60 * 1000) return false;
  return rec.count >= 10;
}
function recordFailure(key) {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now - rec.start > 15 * 60 * 1000) attempts.set(key, { start: now, count: 1 });
  else rec.count += 1;
}

function issueToken(userId) {
  const jti = crypto.randomUUID();
  const expiresAt = Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS;
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Math.floor(Date.now() / 1000));
  db.prepare('INSERT INTO sessions (jti, user_id, expires_at) VALUES (?, ?, ?)').run(jti, userId, expiresAt);
  return jwt.sign({ sub: String(userId), jti }, JWT_SECRET, { expiresIn: TOKEN_TTL_SECONDS });
}

function requireAuth(req, res, next) {
  const header = req.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return fail(res, 401, 'Please log in.');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const session = db.prepare('SELECT user_id FROM sessions WHERE jti = ? AND expires_at > ?')
      .get(payload.jti, Math.floor(Date.now() / 1000));
    if (!session || String(session.user_id) !== payload.sub) return fail(res, 401, 'Session expired. Please log in again.');
    req.user = { id: session.user_id, jti: payload.jti };
    next();
  } catch (err) {
    return fail(res, 401, 'Session expired. Please log in again.');
  }
}

function loadProfile(userId) {
  const row = db.prepare(`
    SELECT u.student_id, u.email, p.name, p.course, p.year_level, p.about, p.skills, p.picture
    FROM users u JOIN profiles p ON p.user_id = u.id
    WHERE u.id = ?`).get(userId);
  if (!row) return null;
  let skills = [];
  try { skills = JSON.parse(row.skills); } catch (e) { /* leave empty */ }
  return {
    studentId: row.student_id,
    email: row.email,
    name: row.name,
    course: row.course,
    year: row.year_level,
    about: row.about,
    skills,
    picture: row.picture
  };
}

// Validates the editable profile fields. Returns { error } or { value }.
function validateProfile(body) {
  const name = text(body.name);
  const course = text(body.course);
  const year = text(body.year);
  const about = text(body.about);
  if (!name || !course || !year || !about) return { error: 'Please complete all fields.' };
  if (name.length > 100) return { error: 'Name must be 100 characters or fewer.' };
  if (course.length > 100) return { error: 'Course must be 100 characters or fewer.' };
  if (year.length > 30) return { error: 'Year level must be 30 characters or fewer.' };
  if (about.length > 2000) return { error: 'About must be 2000 characters or fewer.' };

  let skills = body.skills;
  if (!Array.isArray(skills)) return { error: 'Skills must be a list.' };
  skills = skills.map(text).filter(Boolean);
  if (skills.length > 30) return { error: 'You can list up to 30 skills.' };
  if (skills.some((s) => s.length > 40)) return { error: 'Each skill must be 40 characters or fewer.' };
  return { value: { name, course, year, about, skills: [...new Set(skills)] } };
}

// ---- routes -------------------------------------------------------------
app.get('/api/health', (req, res) => res.json({ ok: true }));

// CREATE — register a student account + its profile
app.post('/api/register', (req, res) => {
  const studentId = text(req.body.studentId);
  const email = text(req.body.email);
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!studentId || !email || !password) return fail(res, 400, 'Student ID, email and password are required.');
  if (!/^[A-Za-z0-9-]{3,20}$/.test(studentId)) return fail(res, 400, 'Student ID must be 3-20 letters, numbers or dashes.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) return fail(res, 400, 'Please enter a valid email address.');
  if (password.length < 8 || password.length > 72) return fail(res, 400, 'Password must be 8-72 characters.');

  const profile = validateProfile({
    name: req.body.name,
    course: req.body.course,
    year: req.body.year,
    about: req.body.about || 'New student.',
    skills: req.body.skills || []
  });
  if (profile.error) return fail(res, 400, profile.error);

  const hash = bcrypt.hashSync(password, 12);
  const p = profile.value;

  try {
    const create = db.transaction(() => {
      const info = db.prepare('INSERT INTO users (student_id, email, password_hash) VALUES (?, ?, ?)')
        .run(studentId, email, hash);
      db.prepare('INSERT INTO profiles (user_id, name, course, year_level, about, skills) VALUES (?, ?, ?, ?, ?, ?)')
        .run(info.lastInsertRowid, p.name, p.course, p.year, p.about, JSON.stringify(p.skills));
      return info.lastInsertRowid;
    });
    const userId = create();
    return res.status(201).json({ token: issueToken(userId) });
  } catch (err) {
    if (err && String(err.code).startsWith('SQLITE_CONSTRAINT')) {
      return fail(res, 409, 'That Student ID or email is already registered.');
    }
    console.error('register failed:', err.message);
    return fail(res, 500, 'Something went wrong. Please try again.');
  }
});

// Authenticate — student ID or email + password
app.post('/api/login', (req, res) => {
  const identifier = text(req.body.identifier);
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!identifier || !password) return fail(res, 400, 'Student ID/email and password are required.');

  const key = `${req.ip}|${identifier.toLowerCase()}`;
  if (throttled(key)) return fail(res, 429, 'Too many failed attempts. Please wait a few minutes and try again.');

  try {
    const user = db.prepare('SELECT id, password_hash FROM users WHERE student_id = ? OR email = ?')
      .get(identifier, identifier);
    const ok = bcrypt.compareSync(password, user ? user.password_hash : DUMMY_HASH);
    if (!user || !ok) {
      recordFailure(key);
      return fail(res, 401, 'Invalid student ID or password.');
    }
    attempts.delete(key);
    return res.json({ token: issueToken(user.id) });
  } catch (err) {
    console.error('login failed:', err.message);
    return fail(res, 500, 'Something went wrong. Please try again.');
  }
});

// READ — the logged-in student's own profile
app.get('/api/profile', requireAuth, (req, res) => {
  try {
    const profile = loadProfile(req.user.id);
    if (!profile) return fail(res, 404, 'Profile not found.');
    res.json(profile);
  } catch (err) {
    console.error('get profile failed:', err.message);
    fail(res, 500, 'Unable to retrieve your profile. Please try again.');
  }
});

// UPDATE — name, course, year, about, skills
app.put('/api/profile', requireAuth, (req, res) => {
  const result = validateProfile(req.body);
  if (result.error) return fail(res, 400, result.error);
  const p = result.value;
  try {
    db.prepare(`UPDATE profiles
                SET name = ?, course = ?, year_level = ?, about = ?, skills = ?, updated_at = datetime('now')
                WHERE user_id = ?`)
      .run(p.name, p.course, p.year, p.about, JSON.stringify(p.skills), req.user.id);
    res.json(loadProfile(req.user.id));
  } catch (err) {
    console.error('update profile failed:', err.message);
    fail(res, 500, 'Unable to update your profile.');
  }
});

// UPDATE — profile picture (JPEG data URL from the Cordova camera)
app.put('/api/profile/picture', requireAuth, (req, res) => {
  const picture = typeof req.body.picture === 'string' ? req.body.picture : '';
  if (!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(picture)) return fail(res, 400, 'Invalid picture.');
  if (picture.length > 700000) return fail(res, 400, 'Picture is too large.');
  try {
    db.prepare("UPDATE profiles SET picture = ?, updated_at = datetime('now') WHERE user_id = ?")
      .run(picture, req.user.id);
    res.json({ picture });
  } catch (err) {
    console.error('update picture failed:', err.message);
    fail(res, 500, 'Unable to update your profile picture.');
  }
});

// Logout — deletes the session so the token stops working immediately
app.post('/api/logout', requireAuth, (req, res) => {
  db.prepare('DELETE FROM sessions WHERE jti = ?').run(req.user.jti);
  res.json({ ok: true });
});

// DELETE — remove the account (profile + sessions cascade). Password required.
app.delete('/api/account', requireAuth, (req, res) => {
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (!password) return fail(res, 400, 'Please enter your password to confirm.');
  try {
    const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user.id);
    if (!user || !bcrypt.compareSync(password, user.password_hash)) return fail(res, 403, 'Incorrect password.');
    db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('delete account failed:', err.message);
    fail(res, 500, 'Unable to delete your account.');
  }
});

// ---- fallbacks ------------------------------------------------------------
app.use('/api', (req, res) => fail(res, 404, 'Not found.'));
// Bad JSON bodies and anything unexpected
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') return fail(res, 400, 'Invalid request.');
  if (err && err.type === 'entity.too.large') return fail(res, 413, 'Request is too large.');
  console.error(err);
  fail(res, 500, 'Something went wrong. Please try again.');
});

app.listen(PORT, () => console.log(`Student Profile API listening on port ${PORT}`));
