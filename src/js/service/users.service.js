import { Storage } from "../core/storage.js";
import { LS_KEYS, ROLES } from "../core/constants.js";
import { uid } from "../core/utils.js";

function normalizeUsers(raw) {
  if (!Array.isArray(raw)) return [];
  // Limpia entradas raras
  return raw
    .filter(u => u && typeof u === "object")
    .map(u => ({
      id: u.id || uid("u"),
      name: String(u.name || u.nombre || "").trim() || "Usuario",
      email: String(u.email || u.correo || "").trim().toLowerCase(),
      password: String(u.password || ""),
      role: String(u.role || ROLES.CLIENT).trim().toLowerCase(),
      active: u.active !== false,
      createdAt: u.createdAt || new Date().toISOString()
    }))
    .filter(u => u.email); // sin email no sirve
}

function upsertSystemUser(users, { email, name, password, role }) {
  const e = email.toLowerCase();
  const idx = users.findIndex(u => u.email === e);

  if (idx === -1) {
    users.push({
      id: uid("u"),
      name,
      email: e,
      password,
      role,
      active: true,
      createdAt: new Date().toISOString()
    });
    return;
  }

  // Si existe, lo “arreglamos” si alguien lo dañó
  users[idx] = {
    ...users[idx],
    name: users[idx].name || name,
    password: users[idx].password || password,
    role,          // <- fuerza rol correcto
    active: true   // <- lo reactiva si lo apagaron
  };
}

function ensureBaselineUsers() {
  const raw = Storage.get(LS_KEYS.USERS, []);
  const users = normalizeUsers(raw);

  upsertSystemUser(users, {
    email: "admin@hotel.com",
    name: "Administrador",
    password: "admin123",
    role: ROLES.ADMIN
  });

  upsertSystemUser(users, {
    email: "op@hotel.com",
    name: "Operador",
    password: "op123",
    role: ROLES.OPERATOR
  });

  Storage.set(LS_KEYS.USERS, users);
  return users;
}

export const UsersService = {
  ensureSeed() {
    ensureBaselineUsers();
  },

  list() {
    return ensureBaselineUsers();
  },

  getById(id) {
    return UsersService.list().find(u => u.id === id) || null;
  },

  getByEmail(email) {
    const e = String(email || "").trim().toLowerCase();
    return UsersService.list().find(u => u.email === e) || null;
  },

  create({ name, email, password, role = ROLES.CLIENT }) {
    const users = UsersService.list();
    const e = String(email || "").trim().toLowerCase();
    if (users.some(u => u.email === e)) throw new Error("Ese correo ya está registrado.");

    const user = {
      id: uid("u"),
      name: String(name || "").trim(),
      email: e,
      password: String(password || ""),
      role: String(role).trim().toLowerCase(),
      active: true,
      createdAt: new Date().toISOString()
    };

    users.push(user);
    Storage.set(LS_KEYS.USERS, users);
    return user;
  },

  update(id, patch) {
    return Storage.update(LS_KEYS.USERS, [], (arr) => {
      const users = normalizeUsers(arr);
      const idx = users.findIndex(u => u.id === id);
      if (idx < 0) throw new Error("Usuario no encontrado.");

      const next = { ...users[idx], ...patch };
      // Normaliza rol/email si los tocaron
      next.email = String(next.email || "").trim().toLowerCase();
      next.role = String(next.role || ROLES.CLIENT).trim().toLowerCase();

      users[idx] = next;
      return users;
    });
  },

  remove(id) {
    return Storage.update(LS_KEYS.USERS, [], (arr) => normalizeUsers(arr).filter(u => u.id !== id));
  }
};
