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
//--------------------------------------------------------------------------------------------------------------//
// --- add to src/lib/auth.js ---
export function loadUsers() {            // (re-export for Profile page)
  try { const raw = localStorage.getItem('dd_users_v1'); return raw ? JSON.parse(raw) : []; }
  catch { return []; }
}
export function saveUsers(users) {       // (re-export for Profile page)
  localStorage.setItem('dd_users_v1', JSON.stringify(users));
}

/** Returns the lightweight profile used across the app */
export function getProfile() {
  return currentUser(); // same as CURRENT_USER_KEY
}

/** Update the logged-in user's profile and keep everything in sync */
export function updateProfile(partial) {
  const cur = currentUser();
  if (!cur) throw new Error('Not signed in.');

  const users = loadUsers();
  const idx = users.findIndex(u => u.id === cur.id);
  if (idx === -1) throw new Error('User record not found.');

  const updatedUser = { ...users[idx], ...partial };
  users[idx] = updatedUser;
  saveUsers(users);

  // refresh the cached "current user" (used by header/profile, etc.)
  const cached = {
    id: updatedUser.id,
    email: updatedUser.email,
    username: updatedUser.username,
    fullName: updatedUser.fullName,
    phone: updatedUser.phone,
  };
  localStorage.setItem('dd_current_user', JSON.stringify(cached));
  return cached;
}
