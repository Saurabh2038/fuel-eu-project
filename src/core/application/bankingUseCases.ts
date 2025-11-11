import prisma from "../../infrastructure/db/prismaClient";
import { computeCB } from "./computeCB";

export async function computeAndStoreCBForRoute(routeId: string) {
  const route = await prisma.route.findUnique({ where: { routeId } });
  if (!route) throw new Error("Route not found");
  const cb = computeCB(route.ghgIntensity, route.fuelConsumption);
  await prisma.shipCompliance.create({ data: { shipId: route.routeId, year: route.year, cb_gco2eq: cb.cb_gco2eq } });
  return { route, cb };
}

export async function getLatestCB(shipId: string, year: number) {
  const rec = await prisma.shipCompliance.findFirst({ where: { shipId, year }, orderBy: { snapshotAt: "desc" } });
  return rec;
}

export async function bankSurplus(shipId: string, year: number, amount_g: number) {
  const latest = await getLatestCB(shipId, year);
  if (!latest) throw new Error("No CB snapshot");
  if (latest.cb_gco2eq <= 0) throw new Error("No surplus to bank");
  if (amount_g > latest.cb_gco2eq) throw new Error("Amount exceeds available surplus");
  const entry = await prisma.bankEntry.create({ data: { shipId, year, amount_gco2eq: amount_g } });
  return entry;
}

export async function getBankAvailable(shipId: string, year: number) {
  const entries = await prisma.bankEntry.findMany({ where: { shipId, year } });
  return entries.reduce((s, e) => s + e.amount_gco2eq, 0);
}

export async function applyBanked(shipId: string, year: number, amount_g: number) {
  const available = await getBankAvailable(shipId, year);
  if (amount_g > available) throw new Error("Not enough banked amount");
  await prisma.bankEntry.create({ data: { shipId, year, amount_gco2eq: -Math.abs(amount_g) } });
  const latest = await getLatestCB(shipId, year);
  const cb_before = latest?.cb_gco2eq ?? 0;
  const applied = amount_g;
  const cb_after = cb_before - applied;
  return { cb_before, applied, cb_after };
}
