import express from "express";
import { prisma } from "../../../infrastructure/db/prismaClient";

const router = express.Router();

/**
 * Compute Compliance Balance (CB)
 * Formula: CB = (Target - Actual) × Energy_in_scope
 * Target (2025) = 89.3368 gCO2e/MJ
 * Energy_in_scope ≈ fuelConsumption × 41000 MJ/t
 */
router.get("/compliance/cb", async (req, res) => {
  try {
    const { year } = req.query;
    const target = 89.3368;

    if (!year) return res.status(400).json({ error: "Year is required" });

    const routes = await prisma.route.findMany({
      where: { year: Number(year) },
    });

    if (!routes.length)
      return res.status(404).json({ error: `No routes found for year ${year}` });

    const results = await Promise.all(
      routes.map(async (r) => {
        const energyInScope = r.fuelConsumption * 41000;
        const cb_gco2eq = (target - r.ghgIntensity) * energyInScope;

        await prisma.shipCompliance.upsert({
          where: {
            shipId_year: { shipId: r.routeId, year: Number(year) },
          },
          update: { cb_gco2eq },
          create: { shipId: r.routeId, year: Number(year), cb_gco2eq },
        });

        return { routeId: r.routeId, cb_gco2eq };
      })
    );

    res.json({
      year,
      results,
    });
  } catch (err) {
    console.error("❌ Error computing CB:", err);
    res.status(500).json({ error: "Failed to compute compliance balance" });
  }
});

export default router;
