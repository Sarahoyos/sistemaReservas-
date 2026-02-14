import { Storage } from "../core/storage.js";
import { LS_KEYS, ROLES } from "../core/constants.js";
import { UsersService } from "./users.service.js";
import { roleHome } from "../core/guards.js";

export const AuthService = {
  init() {
    UsersService.ensureSeed();
  },

  getSession() {
    return Storage.get(LS_KEYS.SESSION, null);
  },

  login(email, password) {
    AuthService.init();
    const user = UsersService.getByEmail(email);
    if (!user) throw new Error("Credenciales inválidas.");
    if (!user.active) throw new Error("Usuario inactivo.");
    if (user.password !== String(password || "")) throw new Error("Credenciales inválidas.");

    const session = {
      userId: user.id,
      role: user.role,
      createdAt: new Date().toISOString()
    };

    Storage.set(LS_KEYS.SESSION, session);
    return session;
  },

  logout() {
    Storage.remove(LS_KEYS.SESSION);
  },

  registerClient({ name, email, password }) {
    AuthService.init();
    const user = UsersService.create({ name, email, password, role: ROLES.CLIENT });
    // Auto-login
    const session = { userId: user.id, role: user.role, createdAt: new Date().toISOString() };
    Storage.set(LS_KEYS.SESSION, session);
    return session;
  },

  redirectToHome() {
    const session = AuthService.getSession();
    if (!session) return;
    window.location.href = roleHome(session.role);
  }
};
