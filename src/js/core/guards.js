import { ROLES } from "./constants.js";
import { AuthService } from "../services/auth.service.js";

export function requireAuth(redirectTo = "index.html") {
  const session = AuthService.getSession();
  if (!session) {
    window.location.href = redirectTo;
    return null;
  }
  return session;
}

export function requireRole(allowedRoles = [], redirectTo = "403.html") {
  const session = requireAuth("index.html");
  if (!session) return null;

  if (!allowedRoles.includes(session.role)) {
    window.location.href = redirectTo;
    return null;
  }
  return session;
}

export function roleHome(role) {
  if (role === ROLES.ADMIN) return "admin.html";
  if (role === ROLES.OPERATOR) return "operator.html";
  return "client.html";
}
