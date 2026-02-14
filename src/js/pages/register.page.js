import { AuthService } from "../services/auth.service.js";
import { qs } from "../core/utils.js";

AuthService.init();

const form = qs("#registerForm");
const msg = qs("#msg");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  msg.textContent = "";

  const name = qs("#name").value.trim();
  const email = qs("#email").value.trim();
  const password = qs("#password").value;

  try {
    if (!name || !email || !password) throw new Error("Completa todos los campos.");
    AuthService.registerClient({ name, email, password });
    AuthService.redirectToHome();
  } catch (err) {
    msg.textContent = err.message || "Error";
  }
});
