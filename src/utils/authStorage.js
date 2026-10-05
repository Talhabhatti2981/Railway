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

export const ADMIN_EMAIL = 'admin@gmail.com';

const DEFAULT_ADMIN = {
  id: 'user_admin',
  name: 'Admin',
  email: ADMIN_EMAIL,
  password: 'admin',
  role: 'admin',
};

/** Single built-in admin; everyone else is a normal user. */
export const ensureDefaultUsers = async () => {
  const users = readUsers();
  const adminHash = await hashPassword(DEFAULT_ADMIN.password);
  let adminIndex = users.findIndex(
    (u) => u.email.toLowerCase() === DEFAULT_ADMIN.email.toLowerCase()
  );

  if (adminIndex === -1) {
    users.push({
      id: DEFAULT_ADMIN.id,
      name: DEFAULT_ADMIN.name,
      email: DEFAULT_ADMIN.email,
      passwordHash: adminHash,
      role: DEFAULT_ADMIN.role,
    });
  } else {
    users[adminIndex] = {
      ...users[adminIndex],
      name: DEFAULT_ADMIN.name,
      email: DEFAULT_ADMIN.email,
      passwordHash: adminHash,
      role: 'admin',
    };
  }

  users.forEach((u, i) => {
    if (
      u.email.toLowerCase() !== DEFAULT_ADMIN.email.toLowerCase() &&
      u.role === 'admin'
    ) {
      users[i] = { ...u, role: 'user' };
    }
  });

  writeUsers(users);
};

export const authStorage = {
  findByEmail: (email) =>
    readUsers().find((u) => u.email.toLowerCase() === email.toLowerCase()),

  findById: (id) => readUsers().find((u) => u.id === id),

  createUser: async ({ name, email, password }) => {
    const users = readUsers();
    const normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === ADMIN_EMAIL.toLowerCase()) {
      throw new Error('This email is reserved. Sign in as admin instead.');
    }
    if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      throw new Error('Email already registered');
    }
    const user = {
      id: `user_${Date.now()}`,
      name,
      email: email.trim(),
      passwordHash: await hashPassword(password),
      role: 'user',
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
    if (role) {
      const isReservedAdmin =
        users[index].email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
      if (role === 'admin' && !isReservedAdmin) {
        throw new Error('Only admin@gmail.com can be admin');
      }
      if (isReservedAdmin && role !== 'admin') {
        throw new Error('Built-in admin role cannot be changed');
      }
      users[index].role = role;
    }
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
