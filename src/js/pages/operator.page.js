import { requireRole } from "../core/guards.js";
import { ROLES, STATUS_LABEL, STATUS_BADGE } from "../core/constants.js";
import { ReservationsService } from "../service/reservations.service.js";
import { AuthService } from "../service/auth.service.js";
import { qs, escapeHTML, formatDate, nowISODate } from "../core/utils.js";

const session = requireRole([ROLES.OPERATOR]);

const dateInput = qs("#agendaDate");
const tbody = qs("#agendaBody");
const btnLogout = qs("#btnLogout");

btnLogout.addEventListener("click", () => {
  AuthService.logout();
  window.location.href = "index.html";
});

dateInput.value = nowISODate();
dateInput.addEventListener("change", render);

function render() {
  const dateISO = dateInput.value;
  let rows = [];
  try {
    rows = ReservationsService.listByDate(dateISO);
  } catch (err) {
    alert(err.message || "Error");
    return;
  }

  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${escapeHTML(r.userName)}</td>
      <td>${formatDate(r.checkIn)} → ${formatDate(r.checkOut)}</td>
      <td><span class="badge ${STATUS_BADGE[r.status]}">${STATUS_LABEL[r.status]}</span></td>
      <td>
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-sm btn-outline-success" data-action="confirm" data-id="${r.id}">Confirmar</button>
          <button class="btn btn-sm btn-outline-secondary" data-action="reschedule" data-id="${r.id}">Reprogramar</button>
        </div>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll("[data-action]").forEach(el => el.addEventListener("click", onAction));
}

function onAction(e) {
  const el = e.currentTarget;
  const action = el.dataset.action;
  const id = el.dataset.id;

  try {
    if (action === "confirm") {
      ReservationsService.confirm(id, session);
    } else if (action === "reschedule") {
      const checkIn = prompt("Nuevo check-in (YYYY-MM-DD):");
      const checkOut = prompt("Nuevo check-out (YYYY-MM-DD):");
      if (!checkIn || !checkOut) return;
      ReservationsService.reschedule(id, { checkIn, checkOut }, session);
    }
    render();
  } catch (err) {
    alert(err.message || "Error");
  }
}

render();
