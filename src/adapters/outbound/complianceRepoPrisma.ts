import prisma from "../../infrastructure/db/prismaClient";
import { computeCB } from "../../core/application/computeCB";

export async function computeAndStoreCB(routeId: string) {
  const route = await prisma.route.findUnique({ where: { routeId } });
  if (!route) throw new Error("Route not found");
  const cb = computeCB(route.ghgIntensity, route.fuelConsumption);
  await prisma.shipCompliance.create({ data: { shipId: route.routeId, year: route.year, cb_gco2eq: cb.cb_gco2eq } });
  return { route, cb };
}

export async function getLatestCB(shipId: string, year: number) {
  return prisma.shipCompliance.findFirst({ where: { shipId, year }, orderBy: { snapshotAt: "desc" } });
}

export async function getAdjustedCB(year: number) {
  const entries = await prisma.shipCompliance.findMany({ where: { year } });
  return entries;
}
