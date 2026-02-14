import { RES_STATUS } from "../core/constants.js";
import { ReservationsService } from "./reservations.service.js";

export const StatsService = {
  getSummary() {
    const all = ReservationsService.listAll();
    const total = all.length;

    const byStatus = {
      [RES_STATUS.PENDING]: all.filter(r => r.status === RES_STATUS.PENDING).length,
      [RES_STATUS.CONFIRMED]: all.filter(r => r.status === RES_STATUS.CONFIRMED).length,
      [RES_STATUS.CANCELLED]: all.filter(r => r.status === RES_STATUS.CANCELLED).length
    };

    // reservas por día (checkIn)
    const byDay = {};
    for (const r of all) {
      byDay[r.checkIn] = (byDay[r.checkIn] || 0) + 1;
    }

    return { total, byStatus, byDay };
  }
};
