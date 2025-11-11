import express from "express";
import { findAllRoutes, setBaselinePrisma } from "../outbound/routeRepoPrisma";
import { computeComparison } from "../../core/application/routeUseCases";

const router = express.Router();

router.get("/routes", async (req, res) => {
  const all = await findAllRoutes();
  res.json(all);
});

router.post("/routes/:routeId/baseline", async (req, res) => {
  try {
    const { routeId } = req.params;
    const updated = await setBaselinePrisma(routeId);
    res.json({ success: true, route: updated });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.get("/routes/comparison", async (req, res) => {
  try {
    const result = await computeComparison();
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export default router;
