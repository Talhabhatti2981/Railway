const USERS_KEY = 'railway_users';

const hashPassword = async (password) => {
  if (!globalThis.crypto?.subtle) {
    return btoa(unescape(encodeURIComponent(password)));
  }
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

const readUsers = () => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const DEFAULT_ADMIN = {
  id: 'user_admin',
  name: 'Admin',
  email: 'admin@railway.com',
  password: 'admin123',
  role: 'admin',
};

/** Always keep default admin in the users table (merge, do not wipe existing users). */
export const ensureDefaultUsers = async () => {
  const users = readUsers();
  const hasDefaultAdmin = users.some(
    (u) => u.email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase()
  );
  if (hasDefaultAdmin) return;

  const adminHash = await hashPassword(DEFAULT_ADMIN.password);
  users.push({
    id: DEFAULT_ADMIN.id,
    name: DEFAULT_ADMIN.name,
    email: DEFAULT_ADMIN.email,
    passwordHash: adminHash,
    role: DEFAULT_ADMIN.role,
  });
  writeUsers(users);
};

export const resolveSignupRole = (users, { adminKey }) => {
  const configuredKey =
    import.meta.env.VITE_ADMIN_SIGNUP_KEY || 'railwayadmin';
  if (adminKey && String(adminKey).trim() === configuredKey) {
    return 'admin';
  }
  const hasAdmin = users.some((u) => u.role === 'admin');
  if (!hasAdmin) return 'admin';
  return 'user';
};

export const authStorage = {
  findByEmail: (email) =>
    readUsers().find((u) => u.email.toLowerCase() === email.toLowerCase()),

  findById: (id) => readUsers().find((u) => u.id === id),

  createUser: async ({ name, email, password, role = 'user' }) => {
    const users = readUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email already registered');
    }
    const user = {
      id: `user_${Date.now()}`,
      name,
      email,
      passwordHash: await hashPassword(password),
      role,
    };
    users.push(user);
    writeUsers(users);
    return user;
  },

  verifyPassword: async (user, password) => {
    const hash = await hashPassword(password);
    return user.passwordHash === hash;
  },

  updateUser: async (id, { name, password, role }) => {
    const users = readUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');
    if (name) users[index].name = name;
    if (password) users[index].passwordHash = await hashPassword(password);
    if (role) users[index].role = role;
    writeUsers(users);
    return users[index];
  },

  listAll: () =>
    readUsers().map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role || 'user',
    })),

  toPublicUser: (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }),
};

export const createSessionToken = (user) =>
  btoa(JSON.stringify({ id: user.id, email: user.email, role: user.role }));

export const parseSessionToken = (token) => {
  try {
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
};
