// src/lib/auth.js
// Centralized auth + per-user wallet storage in localStorage

// ------------------------------
// Storage helpers
export function loadUsers() {
  try {
    const raw = localStorage.getItem('dd_users_v1');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUsers(users) {
  localStorage.setItem('dd_users_v1', JSON.stringify(users));
}

export function getActiveUserId() {
  return localStorage.getItem('dd_active_user_id') || null;
}

export function setActiveUserId(id) {
  if (id) localStorage.setItem('dd_active_user_id', id);
  else localStorage.removeItem('dd_active_user_id');
}

export function getActiveUser() {
  const id = getActiveUserId();
  if (!id) return null;
  const users = loadUsers();
  return users.find(u => u.id === id) || null;
}

export function updateActiveUser(patch) {
  const id = getActiveUserId();
  if (!id) return null;

  const users = loadUsers();
  const i = users.findIndex(u => u.id === id);
  if (i === -1) return null;

  // Merge patch onto user
  users[i] = { ...users[i], ...patch };
  saveUsers(users);
  return users[i];
}

// Small helper used by RequireAuth.jsx
export function isAuthed() {
  return Boolean(getActiveUserId());
}

// ------------------------------
// Account creation / login

export function createUser({ name, email, password }) {
  const users = loadUsers();
  const normEmail = String(email || '').trim().toLowerCase();

  if (users.some(u => (u.email || '').toLowerCase() === normEmail)) {
    throw new Error('Account already exists for this email.');
  }

  const user = {
    id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name: name ?? '',
    email: normEmail,
    password: password ?? '',      // (dev only—don’t store plaintext in prod)
    wallet: 0,                     // <-- new accounts start at 0
    walletCards: [],               // initialize so context/UI never sees undefined
    walletTxns: [],                // initialize so context/UI never sees undefined
    createdAt: Date.now(),
  };

  users.push(user);
  saveUsers(users);
  setActiveUserId(user.id);
  return user;
}

export function loginUser({ email, password }) {
  const users = loadUsers();
  const normEmail = String(email || '').trim().toLowerCase();

  const user = users.find(
    u => (u.email || '').toLowerCase() === normEmail && u.password === password
  );
  if (!user) throw new Error('Invalid email or password.');

  // Backfill wallet fields if missing (older accounts)
  let patched = false;
  if (user.wallet == null) { user.wallet = 0; patched = true; }
  if (!Array.isArray(user.walletCards)) { user.walletCards = []; patched = true; }
  if (!Array.isArray(user.walletTxns)) { user.walletTxns = []; patched = true; }
  if (patched) {
    const i = users.findIndex(u => u.id === user.id);
    users[i] = user;
    saveUsers(users);
  }

  setActiveUserId(user.id);
  return user;
}

export function logoutUser() {
  setActiveUserId(null);
}
export const registerUser = createUser;

