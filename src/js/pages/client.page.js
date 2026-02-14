import { requireRole } from "../core/guards.js";
import { ROLES, STATUS_LABEL, STATUS_BADGE } from "../core/constants.js";
import { ReservationsService } from "../service/reservations.service.js";
import { AuthService } from "../service/auth.service.js";
import { UsersService } from "../service/users.service.js";
import { qs, escapeHTML, formatDate, nowISODate } from "../core/utils.js";

const session = requireRole([ROLES.CLIENT]);

const btnLogout = qs("#btnLogout");
const userLabel = qs("#userLabel");

const form = qs("#createReservationForm");
const msg = qs("#msg");

const tbody = qs("#myReservationsBody");

btnLogout.addEventListener("click", () => {
  AuthService.logout();
  window.location.href = "index.html";
});

const me = UsersService.getById(session.userId);
userLabel.textContent = me ? `${me.name} (${me.email})` : "Cliente";

qs("#checkIn").value = nowISODate();

form.addEventListener("submit", (e) => {
  e.preventDefault();
  msg.textContent = "";

  const checkIn = qs("#checkIn").value;
  const checkOut = qs("#checkOut").value;
  const guests = qs("#guests").value;
  const notes = qs("#notes").value;

  try {
    ReservationsService.create({ checkIn, checkOut, guests, notes }, session);
    form.reset();
    qs("#checkIn").value = nowISODate();
    render();
  } catch (err) {
    msg.textContent = err.message || "Error";
  }
});

function render() {
  const rows = ReservationsService.listByUser(session.userId);

  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${formatDate(r.checkIn)} → ${formatDate(r.checkOut)}</td>
      <td>${r.guests}</td>
      <td><span class="badge ${STATUS_BADGE[r.status]}">${STATUS_LABEL[r.status]}</span></td>
      <td>${escapeHTML(r.notes || "")}</td>
      <td>
        <button class="btn btn-sm btn-outline-danger" data-action="cancel" data-id="${r.id}">
          Cancelar
        </button>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll('[data-action="cancel"]').forEach(btn =>
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      try {
        if (!confirm("¿Cancelar esta reserva?")) return;
        ReservationsService.cancel(id, session);
        render();
      } catch (err) {
        alert(err.message || "Error");
      }
    })
  );
}

render();
