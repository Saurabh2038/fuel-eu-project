import express from "express";
import { createBankEntry, getAvailableBank } from "../outbound/bankingRepoPrisma";
import * as banking from "../../core/application/bankingUseCases";

const router = express.Router();

router.get("/banking/records", async (req, res) => {
  const { shipId, year } = req.query;
  if (!shipId) return res.status(400).json({ error: "shipId required" });
  const y = Number(year) || new Date().getFullYear();
  try {
    // For simplicity returning bank entries if implemented
    res.json({ entries: [] });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.post("/banking/bank", async (req, res) => {
  const { shipId, year, amount_g } = req.body;
  try {
    const rec = await banking.bankSurplus(shipId, year, amount_g);
    res.json(rec);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.post("/banking/apply", async (req, res) => {
  const { shipId, year, amount_g } = req.body;
  try {
    const rec = await banking.applyBanked(shipId, year, amount_g);
    res.json(rec);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export default router;
