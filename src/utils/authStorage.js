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

export const ensureDefaultUsers = async () => {
  const users = readUsers();
  if (users.length > 0) return;

  const adminHash = await hashPassword('admin123');
  writeUsers([
    {
      id: 'user_admin',
      name: 'Admin',
      email: 'admin@railway.com',
      passwordHash: adminHash,
      role: 'admin',
    },
  ]);
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

  updateUser: async (id, { name, password }) => {
    const users = readUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');
    if (name) users[index].name = name;
    if (password) users[index].passwordHash = await hashPassword(password);
    writeUsers(users);
    return users[index];
  },

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
