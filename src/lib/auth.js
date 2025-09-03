// src/lib/auth.js
// Centralized auth + per-user storage in localStorage (auth, wallet, profile, bookings)

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

  users[i] = { ...users[i], ...patch };
  saveUsers(users);
  return users[i];
}

// Greeting name for Home header
function setGreetingName(user) {
  const display = (user?.name && String(user.name).trim()) || user?.email || 'Guest';
  try { localStorage.setItem('dormdash_username', display); } catch {}
}

// Small helper used by RequireAuth.jsx
export function isAuthed() {
  return Boolean(getActiveUserId());
}

// ------------------------------
// Account creation / login

export function createUser({ name, email, password, phone }) {
  const users = loadUsers();
  const normEmail = String(email || '').trim().toLowerCase();

  if (users.some(u => (u.email || '').toLowerCase() === normEmail)) {
    throw new Error('Account already exists for this email.');
  }

  const user = {
    id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name: name ?? '',
    email: normEmail,
    password: password ?? '',      // (dev only)
    phone: phone ?? '',
    role: (typeof arguments[0]?.role === 'string' ? arguments[0].role : 'customer'), // NEW


    
    // wallet
    wallet: 0,
    walletCards: [],
    walletTxns: [],

    
    // bookings
    bookings: [],                  // <-- per-user booking history

    //driver profile
    driverProfile: {
    vehicleType: '',
    licenseNumber: '',
    licenseStatus: 'pending',
    backgroundStatus: 'pending',
    helpers: 0,
  },

    
    // profile
    avatar: '',
    createdAt: Date.now(),
  };

  users.push(user);
  saveUsers(users);
  setActiveUserId(user.id);
  setGreetingName(user);
  return user;
}

// keep Auth.jsx happy if it imports registerUser
export const registerUser = createUser;

export function loginUser({ email, password }) {
  const users = loadUsers();
  const normEmail = String(email || '').trim().toLowerCase();

  const user = users.find(
    u => (u.email || '').toLowerCase() === normEmail && u.password === password
  );
  if (!user) throw new Error('Invalid email or password.');

  // Backfill missing fields for older accounts
  let patched = false;
  if (user.wallet == null) { user.wallet = 0; patched = true; }
  if (!Array.isArray(user.walletCards)) { user.walletCards = []; patched = true; }
  if (!Array.isArray(user.walletTxns)) { user.walletTxns = []; patched = true; }
  if (!Array.isArray(user.bookings)) { user.bookings = []; patched = true; }   // <-- ensure present
  if (user.phone == null) { user.phone = ''; patched = true; }
  if (user.avatar == null) { user.avatar = ''; patched = true; }
  if (patched) {
    const i = users.findIndex(u => u.id === user.id);
    users[i] = user;
    saveUsers(users);
  }

  setActiveUserId(user.id);
  setGreetingName(user);
  return user;
}

export function logoutUser() {
  setActiveUserId(null);
}

// ------------------------------
// Profile helpers (used by Profile.jsx)

export function getProfile() {
  const u = getActiveUser();
  if (!u) return null;
  return {
    id: u.id,
    name: u.name ?? '',
    fullName: u.name ?? '',     // alias for UI
    email: u.email ?? '',
    phone: u.phone ?? '',
    avatar: u.avatar ?? '',
  };
}

export function getActiveRole() {
  return getActiveUser()?.role || 'customer'
}
export function setActiveRole(role) {
  const updated = updateActiveUser({ role })
  return updated?.role || role
}

export function getDriverProfile() {
  return getActiveUser()?.driverProfile || {
    vehicleType: '', licenseNumber: '', licenseStatus: 'pending', backgroundStatus: 'pending', helpers: 0
  }
}
export function updateDriverProfile(patch) {
  const u = getActiveUser()
  const next = { ...(u?.driverProfile || {}), ...patch }
  const updated = updateActiveUser({ driverProfile: next })
  return updated?.driverProfile || next
}

export function emitAuthChanged() {
  try { window.dispatchEvent(new CustomEvent('dd:auth:changed')) } catch {}
}

export function updateProfile(patch) {
  // Map fullName from UI to our internal 'name'
  if (Object.prototype.hasOwnProperty.call(patch, 'fullName')) {
    patch.name = patch.fullName;
    delete patch.fullName;
  }

  const allowed = ['name', 'email', 'phone', 'avatar'];
  const safe = {};
  for (const k of allowed) if (Object.prototype.hasOwnProperty.call(patch, k)) safe[k] = patch[k];
  if (typeof safe.email === 'string') safe.email = safe.email.trim().toLowerCase();

  const updated = updateActiveUser(safe);
  if (!updated) return null;

  setGreetingName(updated);

  return {
    id: updated.id,
    name: updated.name ?? '',
    fullName: updated.name ?? '',
    email: updated.email ?? '',
    phone: updated.phone ?? '',
    avatar: updated.avatar ?? '',
  };
}

// ------------------------------
// Per-user bookings (NEW)

function ensureBookingsArray(u) {
  return Array.isArray(u?.bookings) ? u.bookings : [];
}

export function getBookings() {
  return ensureBookingsArray(getActiveUser());
}

export function setBookings(next) {
  const updated = updateActiveUser({ bookings: next });
  return ensureBookingsArray(updated);
}

export function addBooking(booking) {
  const list = getBookings();
  const id = booking?.id || ('bk_' + (crypto?.randomUUID ? crypto.randomUUID() : Date.now()));
  const item = {
    id,
    status: booking?.status || 'scheduled',
    createdAt: booking?.createdAt || Date.now(),
    pickup: booking?.pickup || '',
    dropoff: booking?.dropoff || '',
    vehicle: booking?.vehicle || '',
    helpers: booking?.helpers || '',
    items: booking?.items || [],
    distanceKm: booking?.distanceKm ?? null,
    total: booking?.total ?? booking?.price ?? 0,
  };
  const next = [item, ...list].slice(0, 25); // cap
  return setBookings(next);
}

export function updateBooking(id, patch) {
  const list = getBookings();
  const next = list.map(b => (b.id === id ? { ...b, ...patch } : b));
  return setBookings(next);
}

export function removeBooking(id) {
  const list = getBookings();
  const next = list.filter(b => b.id !== id);
  return setBookings(next);
}

