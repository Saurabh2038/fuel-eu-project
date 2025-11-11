import express from "express";
import { computeAndStoreCB, getLatestCB as getLatestCBRepo, getAdjustedCB } from "../outbound/complianceRepoPrisma";

const router = express.Router();

router.get("/compliance/cb", async (req, res) => {
  const { shipId, year } = req.query;
  try {
    if (!shipId) return res.status(400).json({ error: "shipId required" });
    const y = Number(year) || new Date().getFullYear();
    const snapshot = await computeAndStoreCB(String(shipId));
    const latest = await getLatestCBRepo(String(shipId), y);
    res.json({ snapshot, latest });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.get("/compliance/adjusted-cb", async (req, res) => {
  const year = Number(req.query.year) || new Date().getFullYear();
  try {
    const adjusted = await getAdjustedCB(year);
    res.json({ adjusted });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export default router;
