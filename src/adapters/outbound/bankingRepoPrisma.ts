import prisma from "../../infrastructure/db/prismaClient";

export async function createBankEntry(shipId: string, year: number, amount_g: number) {
  return prisma.bankEntry.create({ data: { shipId, year, amount_gco2eq: amount_g } });
}

export async function getBankEntries(shipId: string, year: number) {
  return prisma.bankEntry.findMany({ where: { shipId, year } });
}

export async function getAvailableBank(shipId: string, year: number) {
  const entries = await getBankEntries(shipId, year);
  return entries.reduce((s, e) => s + e.amount_gco2eq, 0);
}
