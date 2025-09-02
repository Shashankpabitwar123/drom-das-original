// src/lib/auth.js
const USERS_KEY = 'dd_users_v1';
const AUThed_KEY = 'dormdash_authed';
const CURRENT_USER_KEY = 'dd_current_user';

function loadUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function isAuthed() {
  return localStorage.getItem(AUThed_KEY) === '1' && !!localStorage.getItem(CURRENT_USER_KEY);
}
export function currentUser() {
  try { return JSON.parse(localStorage.getItem(CURRENT_USER_KEY) || 'null'); }
  catch { return null; }
}
export function logout() {
  localStorage.removeItem(AUThed_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
}

function normalizeEmail(e) { return String(e || '').trim().toLowerCase(); }

export function registerUser({ username, fullName, phone, email, password }) {
  const users = loadUsers();
  const em = normalizeEmail(email);
  if (!em || !password) throw new Error('Email and password are required.');
  if (users.some(u => normalizeEmail(u.email) === em)) {
    throw new Error('An account with this email already exists.');
  }
  const user = {
    id: 'u_' + Math.random().toString(36).slice(2),
    username: (username || '').trim(),
    fullName: (fullName || '').trim(),
    phone: (phone || '').trim(),
    email: em,
    // ⚠️ For demo only. Never store plain passwords in production!
    password: String(password),
    createdAt: Date.now()
  };
  users.push(user);
  saveUsers(users);
  localStorage.setItem(AUThed_KEY, '1');
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ id: user.id, email: user.email, username: user.username, fullName: user.fullName, phone: user.phone }));
  return user;
}

export function loginUser({ email, password }) {
  const users = loadUsers();
  const em = normalizeEmail(email);
  const pw = String(password || '');
  const user = users.find(u => normalizeEmail(u.email) === em && String(u.password) === pw);
  if (!user) throw new Error('Invalid email or password.');
  localStorage.setItem(AUThed_KEY, '1');
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ id: user.id, email: user.email, username: user.username, fullName: user.fullName, phone: user.phone }));
  return user;
}
