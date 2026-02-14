import { requireRole } from "../core/guards.js";
import { ROLES, STATUS_LABEL } from "../core/constants.js";
import { StatsService } from "../services/stats.service.js";
import { AuthService } from "../services/auth.service.js";
import { qs, escapeHTML } from "../core/utils.js";

requireRole([ROLES.ADMIN]);

const btnLogout = qs("#btnLogout");
btnLogout.addEventListener("click", () => {
  AuthService.logout();
  window.location.href = "index.html";
});

const totalEl = qs("#kpiTotal");
const pendingEl = qs("#kpiPending");
const confirmedEl = qs("#kpiConfirmed");
const cancelledEl = qs("#kpiCancelled");
const byDayEl = qs("#byDay");

const s = StatsService.getSummary();

totalEl.textContent = s.total;
pendingEl.textContent = s.byStatus.PENDING;
confirmedEl.textContent = s.byStatus.CONFIRMED;
cancelledEl.textContent = s.byStatus.CANCELLED;

const days = Object.keys(s.byDay).sort();
byDayEl.innerHTML = days.length
  ? `<ul class="list-group">
      ${days.map(d => `<li class="list-group-item d-flex justify-content-between">
        <span>${escapeHTML(d)}</span><span class="badge bg-primary">${s.byDay[d]}</span>
      </li>`).join("")}
     </ul>`
  : `<div class="text-muted">Sin datos aún. Crea reservas primero 👀</div>`;
