import { requireRole } from "../core/guards.js";
import { ROLES, STATUS_LABEL, STATUS_BADGE, RES_STATUS } from "../core/constants.js";
import { ReservationsService } from "../service/reservations.service.js";
import { AuthService } from "../service/auth.service.js";
import { qs, escapeHTML, formatDate } from "../core/utils.js";

const session = requireRole([ROLES.ADMIN]);

const tbody = qs("#reservationsBody");
const filterStatus = qs("#filterStatus");
const btnLogout = qs("#btnLogout");

btnLogout.addEventListener("click", () => {
  AuthService.logout();
  window.location.href = "index.html";
});

filterStatus.addEventListener("change", render);

function actionsHTML(r) {
  return `
    <div class="d-flex gap-2 flex-wrap">
      <button class="btn btn-sm btn-outline-success" data-action="confirm" data-id="${r.id}">Confirmar</button>
      <button class="btn btn-sm btn-outline-secondary" data-action="reschedule" data-id="${r.id}">Reprogramar</button>
      <select class="form-select form-select-sm w-auto" data-action="setStatus" data-id="${r.id}">
        <option value="">Cambiar estado...</option>
        <option value="${RES_STATUS.PENDING}">Pendiente</option>
        <option value="${RES_STATUS.CONFIRMED}">Confirmada</option>
        <option value="${RES_STATUS.CANCELLED}">Cancelada</option>
      </select>
      <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${r.id}">Eliminar</button>
    </div>
  `;
}

function render() {
  const status = filterStatus.value;
  let rows = ReservationsService.listAll();

  if (status) rows = rows.filter(r => r.status === status);

  tbody.innerHTML = rows.map(r => `
    <tr>
      <td><code>${escapeHTML(r.id)}</code></td>
      <td>${escapeHTML(r.userName)}<br><small class="text-muted">${escapeHTML(r.userEmail || "")}</small></td>
      <td>${formatDate(r.checkIn)} → ${formatDate(r.checkOut)}</td>
      <td>${r.guests}</td>
      <td><span class="badge ${STATUS_BADGE[r.status]}">${STATUS_LABEL[r.status]}</span></td>
      <td>${actionsHTML(r)}</td>
    </tr>
  `).join("");

  // Delegación de eventos
  tbody.querySelectorAll("[data-action]").forEach(el => {
    el.addEventListener("click", onAction);
    if (el.tagName === "SELECT") el.addEventListener("change", onAction);
  });
}

function onAction(e) {
  const el = e.currentTarget;
  const action = el.dataset.action;
  const id = el.dataset.id;

  try {
    if (action === "confirm") {
      ReservationsService.confirm(id, session);
    } else if (action === "delete") {
      if (!confirm("¿Eliminar esta reserva?")) return;
      ReservationsService.delete(id, session);
    } else if (action === "reschedule") {
      const checkIn = prompt("Nuevo check-in (YYYY-MM-DD):");
      const checkOut = prompt("Nuevo check-out (YYYY-MM-DD):");
      if (!checkIn || !checkOut) return;
      ReservationsService.reschedule(id, { checkIn, checkOut }, session);
    } else if (action === "setStatus") {
      const status = el.value;
      if (!status) return;
      ReservationsService.setStatus(id, status, session);
      el.value = "";
    }
    render();
  } catch (err) {
    alert(err.message || "Error");
  }
}

render();
