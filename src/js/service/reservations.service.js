import { Storage } from "../core/storage.js";
import { LS_KEYS, RES_STATUS, ROLES } from "../core/constants.js";
import { uid, isISODate, nowISODate, toDateAtMidnight } from "../core/utils.js";
import { UsersService } from "./users.service.js";


function overlaps(aStart, aEnd, bStart, bEnd) {
  // ranges [start, end) overlap
  const aS = toDateAtMidnight(aStart).getTime();
  const aE = toDateAtMidnight(aEnd).getTime();
  const bS = toDateAtMidnight(bStart).getTime();
  const bE = toDateAtMidnight(bEnd).getTime();
  return aS < bE && bS < aE;
}

function validateDates(checkIn, checkOut) {
  if (!isISODate(checkIn) || !isISODate(checkOut)) throw new Error("Fechas inválidas.");
  const today = nowISODate();
  if (toDateAtMidnight(checkIn) < toDateAtMidnight(today)) throw new Error("El check-in no puede ser en el pasado.");
  if (toDateAtMidnight(checkOut) <= toDateAtMidnight(checkIn)) throw new Error("El check-out debe ser posterior al check-in.");
}

function assertCanView(session, reservation) {
  if (session.role === ROLES.ADMIN || session.role === ROLES.OPERATOR) return true;
  return reservation.userId === session.userId;
}

export const ReservationsService = {
  listAll() {
    return Storage.get(LS_KEYS.RESERVATIONS, []);
  },

  listByUser(userId) {
    return ReservationsService.listAll().filter(r => r.userId === userId);
  },

  listByDate(dateISO) {
    if (!isISODate(dateISO)) throw new Error("Fecha inválida.");
    // agenda: reservas cuyo rango incluye dateISO
    return ReservationsService.listAll().filter(r =>
      toDateAtMidnight(r.checkIn) <= toDateAtMidnight(dateISO) &&
      toDateAtMidnight(dateISO) < toDateAtMidnight(r.checkOut)
    );
  },

  getById(id) {
    return ReservationsService.listAll().find(r => r.id === id) || null;
  },

  create({ checkIn, checkOut, guests = 1, notes = "", roomId = null }, session) {
    if (!session) throw new Error("No autenticado.");
    if (session.role !== ROLES.CLIENT) throw new Error("Solo un cliente puede crear reservas.");

    validateDates(checkIn, checkOut);

    // Si manejas roomId, aquí validas solapamiento por habitación.
    // Si no, igual puedes validar solapamiento por usuario (para evitar que un usuario se clone a sí mismo).
    const all = ReservationsService.listAll();
    const userReservations = all.filter(r => r.userId === session.userId && r.status !== RES_STATUS.CANCELLED);

    const hasOverlap = userReservations.some(r => overlaps(r.checkIn, r.checkOut, checkIn, checkOut));
    if (hasOverlap) throw new Error("Ya tienes una reserva que se solapa con esas fechas.");

    const user = UsersService.getById(session.userId);
    const reservation = {
      id: uid("r"),
      userId: session.userId,
      userName: user?.name || "Cliente",
      userEmail: user?.email || "",
      checkIn,
      checkOut,
      guests: Number(guests) || 1,
      notes: String(notes || "").trim(),
      roomId,
      status: RES_STATUS.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      history: [
        { at: new Date().toISOString(), by: session.userId, action: "CREATED", to: RES_STATUS.PENDING }
      ]
    };

    Storage.update(LS_KEYS.RESERVATIONS, [], (arr) => {
      arr.push(reservation);
      return arr;
    });

    return reservation;
  },

  cancel(id, session) {
    if (!session) throw new Error("No autenticado.");
    const r = ReservationsService.getById(id);
    if (!r) throw new Error("Reserva no encontrada.");
    if (!assertCanView(session, r)) throw new Error("No autorizado.");
    if (session.role !== ROLES.CLIENT) throw new Error("Solo el cliente puede cancelar desde su vista.");
    if (r.status === RES_STATUS.CANCELLED) throw new Error("La reserva ya está cancelada.");

    return ReservationsService.update(id, { status: RES_STATUS.CANCELLED }, session, "CLIENT_CANCEL");
  },

  confirm(id, session) {
    if (!session) throw new Error("No autenticado.");
    if (![ROLES.OPERATOR, ROLES.ADMIN].includes(session.role)) throw new Error("No autorizado.");
    const r = ReservationsService.getById(id);
    if (!r) throw new Error("Reserva no encontrada.");
    if (r.status === RES_STATUS.CANCELLED) throw new Error("No puedes confirmar una cancelada.");

    return ReservationsService.update(id, { status: RES_STATUS.CONFIRMED }, session, "CONFIRM");
  },

  reschedule(id, { checkIn, checkOut }, session) {
    if (!session) throw new Error("No autenticado.");
    if (![ROLES.OPERATOR, ROLES.ADMIN].includes(session.role)) throw new Error("No autorizado.");
    const r = ReservationsService.getById(id);
    if (!r) throw new Error("Reserva no encontrada.");
    if (r.status === RES_STATUS.CANCELLED) throw new Error("No puedes reprogramar una cancelada.");

    validateDates(checkIn, checkOut);

    // validar solapamiento por usuario (excluyendo esta misma)
    const userReservations = ReservationsService.listByUser(r.userId).filter(x => x.id !== id && x.status !== RES_STATUS.CANCELLED);
    const hasOverlap = userReservations.some(x => overlaps(x.checkIn, x.checkOut, checkIn, checkOut));
    if (hasOverlap) throw new Error("El cliente ya tiene otra reserva que se solapa en esas fechas.");

    return ReservationsService.update(id, { checkIn, checkOut }, session, "RESCHEDULE");
  },

  setStatus(id, status, session) {
    if (!session) throw new Error("No autenticado.");
    if (session.role !== ROLES.ADMIN) throw new Error("Solo admin puede cambiar estados libremente.");
    if (![RES_STATUS.PENDING, RES_STATUS.CONFIRMED, RES_STATUS.CANCELLED].includes(status)) throw new Error("Estado inválido.");

    return ReservationsService.update(id, { status }, session, "ADMIN_STATUS");
  },

  delete(id, session) {
    if (!session) throw new Error("No autenticado.");
    if (session.role !== ROLES.ADMIN) throw new Error("Solo admin puede eliminar reservas.");

    const existing = ReservationsService.getById(id);
    if (!existing) throw new Error("Reserva no encontrada.");

    Storage.update(LS_KEYS.RESERVATIONS, [], (arr) => arr.filter(r => r.id !== id));
    return true;
  },

  update(id, patch, session, action = "UPDATE") {
    return Storage.update(LS_KEYS.RESERVATIONS, [], (arr) => {
      const idx = arr.findIndex(r => r.id === id);
      if (idx < 0) throw new Error("Reserva no encontrada.");

      const prev = arr[idx];
      const next = { ...prev, ...patch, updatedAt: new Date().toISOString() };

      next.history = Array.isArray(prev.history) ? prev.history.slice() : [];
      next.history.push({
        at: new Date().toISOString(),
        by: session.userId,
        action,
        patch
      });

      arr[idx] = next;
      return arr;
    });
  }
};
