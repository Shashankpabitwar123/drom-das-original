// src/lib/auth.js

// storage keys
const USERS_KEY = 'dd_users_v1';
const AUTHED_KEY = 'dormdash_authed';
const CURRENT_USER_KEY = 'dd_current_user';

// --- helpers (single definitions) ---
function _normalizeEmail(e) {
  return String(e || '').trim().toLowerCase();
}

function _readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// Load/save the user registry (array of user objects)
export function loadUsers() {
  return _readJSON(USERS_KEY, []);
}
export function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// --- session helpers ---
export function isAuthed() {
  return localStorage.getItem(AUTHED_KEY) === '1' && !!localStorage.getItem(CURRENT_USER_KEY);
}
export function currentUser() {
  return _readJSON(CURRENT_USER_KEY, null);
}
export function logout() {
  localStorage.removeItem(AUTHED_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
}

// --- registration/login ---
export function registerUser({ username, fullName, phone, email, password }) {
  const users = loadUsers();
  const em = _normalizeEmail(email);
  if (!em || !password) throw new Error('Email and password are required.');
  if (users.some(u => _normalizeEmail(u.email) === em)) {
    throw new Error('An account with this email already exists.');
  }

  const user = {
    id: 'u_' + Math.random().toString(36).slice(2),
    username: (username || '').trim(),
    fullName: (fullName || '').trim(),
    phone: (phone || '').trim(),
    email: em,
    // NOTE: demo only — do NOT store plain text passwords in production.
    password: String(password),
    createdAt: Date.now(),
  };

  users.push(user);
  saveUsers(users);

  // set session cache
  localStorage.setItem(AUTHED_KEY, '1');
  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify({
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      phone: user.phone,
    })
  );

  return user;
}

export function loginUser({ email, password }) {
  const users = loadUsers();
  const em = _normalizeEmail(email);
  const pw = String(password || '');

  const user = users.find(
    u => _normalizeEmail(u.email) === em && String(u.password) === pw
  );
  if (!user) throw new Error('Invalid email or password.');

  localStorage.setItem(AUTHED_KEY, '1');
  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify({
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      phone: user.phone,
    })
  );

  return user;
}

// --- profile helpers used by Profile.jsx ---
export function getProfile() {
  // lightweight profile snapshot used by the app
  return currentUser();
}

export function updateProfile(partial) {
  const cur = currentUser();
  if (!cur) throw new Error('Not signed in.');

  const users = loadUsers();
  const idx = users.findIndex(u => u.id === cur.id);
  if (idx === -1) throw new Error('User record not found.');

  const updatedUser = { ...users[idx], ...partial };
  users[idx] = updatedUser;
  saveUsers(users);

  // refresh session snapshot
  const cached = {
    id: updatedUser.id,
    email: updatedUser.email,
    username: updatedUser.username,
    fullName: updatedUser.fullName,
    phone: updatedUser.phone,
  };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(cached));
  return cached;
}
