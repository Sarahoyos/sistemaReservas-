import { AuthService } from "../services/auth.service.js";
import { qs } from "../core/utils.js";

AuthService.init();

const form = qs("#loginForm");
const msg = qs("#msg");
const email = qs("#email");
const password = qs("#password");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  msg.textContent = "";
  try {
    AuthService.login(email.value, password.value);
    AuthService.redirectToHome();
  } catch (err) {
    msg.textContent = err.message || "Error";
  }
});
