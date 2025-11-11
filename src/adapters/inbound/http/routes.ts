import express from "express";
import { prisma } from "../../../infrastructure/db/prismaClient";

const router = express.Router();

console.log("✅ Routes router initialized");

// --- GET /routes ---
router.get("/routes", async (req, res) => {
  try {
    const routes = await prisma.route.findMany({
      orderBy: { routeId: "asc" },
    });
    console.log("Fetched routes:", routes.length);
    res.json(routes);
  } catch (err) {
    console.error("❌ Error fetching routes:", err);
    res.status(500).json({ error: "Failed to fetch routes" });
  }
});

// --- POST /routes/:id/baseline ---
router.post("/routes/:id/baseline", async (req, res) => {
  const { id } = req.params;

  try {
    console.log("---- Resetting all baselines ----");
    const resetResult = await prisma.route.updateMany({
      data: { isBaseline: false },
    });
    console.log("Reset result:", resetResult);

    console.log("---- Setting new baseline ----");
    const updated = await prisma.route.update({
      where: { routeId: id },
      data: { isBaseline: true },
    });
    console.log("New baseline:", updated);

    res.json({ success: true, baseline: updated });
  } catch (err) {
    console.error("❌ Failed to set baseline:", err);
    res.status(500).json({ error: "Failed to set baseline" });
  }
});

router.get("/routes/comparison", async (req, res) => {
  try {
    const baseline = await prisma.route.findFirst({ where: { isBaseline: true } });
    if (!baseline) {
      return res.status(400).json({ error: "No baseline route set" });
    }

    const comparisons = await prisma.route.findMany({
      where: { id: { not: baseline.id } },
    });

    const formatted = comparisons.map((r) => {
      const percentDiff = ((r.ghgIntensity / baseline.ghgIntensity) - 1) * 100;
      return {
        ...r,
        percentDiff,
        compliant: r.ghgIntensity <= 89.3368,
      };
    });

    res.json({ baseline, comparisons: formatted });
  } catch (err) {
    console.error("❌ Error computing comparison:", err);
    res.status(500).json({ error: "Failed to compute comparison" });
  }
});


export default router;
