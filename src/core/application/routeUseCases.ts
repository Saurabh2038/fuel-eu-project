import prisma from "../../infrastructure/db/prismaClient";
import { TARGET_INTENSITY_2025 } from "../../shared/constants";

export async function listRoutes() {
  return prisma.route.findMany();
}

export async function setBaseline(routeId: string) {
  const route = await prisma.route.findUnique({ where: { routeId } });
  if (!route) throw new Error("Route not found");
  await prisma.route.updateMany({ where: { year: route.year, isBaseline: true }, data: { isBaseline: false } });
  const updated = await prisma.route.update({ where: { routeId }, data: { isBaseline: true } });
  return updated;
}

export async function computeComparison() {
  const baseline = await prisma.route.findFirst({ where: { isBaseline: true } });
  if (!baseline) throw new Error("Baseline not found");
  const others = await prisma.route.findMany({ where: { NOT: { routeId: baseline.routeId } } });
  const comparisons = others.map(r => {
    const percentDiff = ((r.ghgIntensity / baseline.ghgIntensity) - 1) * 100;
    const compliant = r.ghgIntensity <= TARGET_INTENSITY_2025;
    return { ...r, percentDiff, compliant };
  });
  return { baseline, comparisons };
}
