
//Creacion de claves para almacenar datos en local storage, roles de usuario, estados de reserva y etiquetas para mostrar en la interfaz
export const LS_KEYS = {
  USERS: "hotel_users",
  RESERVATIONS: "hotel_reservations",
  SESSION: "hotel_session",
  ROOMS: "hotel_rooms"
};

//creacion de roles de usuario para el sistema de reservas, estados de reserva y etiquetas para mostrar en la interfaz
export const ROLES = {
  ADMIN: "admin",
  OPERATOR: "operator",
  CLIENT: "client"
};

// creacion de reservación
export const RES_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED"
};

//Etiquetas de estado
export const STATUS_LABEL = {
  [RES_STATUS.PENDING]: "Pendiente",
  [RES_STATUS.CONFIRMED]: "Confirmada",
  [RES_STATUS.CANCELLED]: "Cancelada"
};

//clases CSS de bootstrap para mostrar el estado de la reserva con diferentes colores
export const STATUS_BADGE = {
  [RES_STATUS.PENDING]: "bg-warning text-dark",
  [RES_STATUS.CONFIRMED]: "bg-success",
  [RES_STATUS.CANCELLED]: "bg-danger"
};