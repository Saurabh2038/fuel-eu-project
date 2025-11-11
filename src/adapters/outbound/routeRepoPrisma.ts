import prisma from "../../infrastructure/db/prismaClient";

export async function findAllRoutes() {
  return prisma.route.findMany();
}

export async function findRouteByRouteId(routeId: string) {
  return prisma.route.findUnique({ where: { routeId } });
}

export async function setBaselinePrisma(routeId: string) {
  const route = await prisma.route.findUnique({ where: { routeId } });
  if (!route) throw new Error("Route not found");
  await prisma.route.updateMany({ where: { year: route.year, isBaseline: true }, data: { isBaseline: false } });
  return prisma.route.update({ where: { routeId }, data: { isBaseline: true } });
}

export async function findBaseline(year?: number) {
  return prisma.route.findFirst({ where: { isBaseline: true, ...(year ? { year } : {}) } });
}

export async function getComparisonRoutes(year?: number) {
  return prisma.route.findMany({ where: { ...(year ? { year } : {}) } });
}
