import { Storage } from "../core/storage.js";
import { LS_KEYS, ROLES } from "../core/constants.js";
import { uid } from "../core/utils.js";

function seedIfNeeded() {
  const users = Storage.get(LS_KEYS.USERS, null);
  if (users && Array.isArray(users) && users.length) return;

  const seeded = [
    {
      id: uid("u"),
      name: "Administrador",
      email: "admin@hotel.com",
      password: "admin123",
      role: ROLES.ADMIN,
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: uid("u"),
      name: "Operador",
      email: "op@hotel.com",
      password: "op123",
      role: ROLES.OPERATOR,
      active: true,
      createdAt: new Date().toISOString()
    }
  ];

  Storage.set(LS_KEYS.USERS, seeded);
}

export const UsersService = {
  ensureSeed() {
    seedIfNeeded();
  },

  list() {
    seedIfNeeded();
    return Storage.get(LS_KEYS.USERS, []);
  },

  getById(id) {
    return UsersService.list().find(u => u.id === id) || null;
  },

  getByEmail(email) {
    const e = String(email || "").trim().toLowerCase();
    return UsersService.list().find(u => u.email.toLowerCase() === e) || null;
  },

  create({ name, email, password, role = ROLES.CLIENT }) {
    seedIfNeeded();
    const existing = UsersService.getByEmail(email);
    if (existing) throw new Error("Ese correo ya está registrado.");

    const user = {
      id: uid("u"),
      name: String(name || "").trim(),
      email: String(email || "").trim().toLowerCase(),
      password: String(password || ""),
      role,
      active: true,
      createdAt: new Date().toISOString()
    };

    Storage.update(LS_KEYS.USERS, [], (arr) => {
      arr.push(user);
      return arr;
    });

    return user;
  },

  update(id, patch) {
    return Storage.update(LS_KEYS.USERS, [], (arr) => {
      const idx = arr.findIndex(u => u.id === id);
      if (idx < 0) throw new Error("Usuario no encontrado.");
      arr[idx] = { ...arr[idx], ...patch };
      return arr;
    });
  },

  remove(id) {
    return Storage.update(LS_KEYS.USERS, [], (arr) => arr.filter(u => u.id !== id));
  }
};
