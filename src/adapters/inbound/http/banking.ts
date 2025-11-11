import express from "express";
import { prisma } from "../../../infrastructure/db/prismaClient";

const router = express.Router();

/**
 * GET /banking/records?shipId&year
 */
router.get("/banking/records", async (req, res) => {
  const { shipId, year } = req.query;

  if (!shipId || !year)
    return res.status(400).json({ error: "shipId and year are required" });

  const records = await prisma.bankEntry.findMany({
    where: { shipId: String(shipId), year: Number(year) },
  });

  res.json(records);
});

/**
 * POST /banking/bank
 * Body: { shipId, year }
 * Bank positive CB (surplus)
 */
router.post("/banking/bank", async (req, res) => {
  const { shipId, year } = req.body;

  try {
    const compliance = await prisma.shipCompliance.findUnique({
      where: { shipId_year: { shipId, year } },
    });

    if (!compliance)
      return res.status(404).json({ error: "No compliance record found" });

    if (compliance.cb_gco2eq <= 0)
      return res.status(400).json({ error: "CB not positive, cannot bank" });

    const entry = await prisma.bankEntry.create({
      data: {
        shipId,
        year,
        amount_gco2eq: compliance.cb_gco2eq,
      },
    });

    res.json({
      message: "✅ CB banked successfully",
      entry,
    });
  } catch (err) {
    console.error("❌ Error banking CB:", err);
    res.status(500).json({ error: "Failed to bank CB" });
  }
});

/**
 * POST /banking/apply
 * Body: { shipId, year, amount }
 * Apply banked surplus to cover deficit
 */
router.post("/banking/apply", async (req, res) => {
  const { shipId, year, amount } = req.body;

  try {
    const totalBanked = await prisma.bankEntry.aggregate({
      where: { year: Number(year) },
      _sum: { amount_gco2eq: true },
    });

    const available = totalBanked._sum.amount_gco2eq || 0;
    if (amount > available)
      return res.status(400).json({ error: "Not enough banked surplus" });

    const compliance = await prisma.shipCompliance.findUnique({
      where: { shipId_year: { shipId, year } },
    });

    if (!compliance)
      return res.status(404).json({ error: "Compliance record not found" });

    const newCB = compliance.cb_gco2eq + amount;

    await prisma.shipCompliance.update({
      where: { shipId_year: { shipId, year } },
      data: { cb_gco2eq: newCB },
    });

    res.json({
      message: "✅ Banked surplus applied",
      cb_before: compliance.cb_gco2eq,
      applied: amount,
      cb_after: newCB,
    });
  } catch (err) {
    console.error("❌ Error applying banked CB:", err);
    res.status(500).json({ error: "Failed to apply CB" });
  }
});

export default router;
