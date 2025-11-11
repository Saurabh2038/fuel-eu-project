import express from "express";
import { createPoolAllocation } from "../../core/application/poolingUseCases";
import prisma from "../../infrastructure/db/prismaClient";

const router = express.Router();

router.post("/pools", async (req, res) => {
  const { year, members } = req.body;
  try {
    if (!Array.isArray(members)) throw new Error("members array required");
    const allocation = createPoolAllocation(members);
    const pool = await prisma.pool.create({ data: { year }, include: { members: true } });
    for (const m of allocation) {
      await prisma.poolMember.create({ data: { poolId: pool.id, shipId: m.shipId, cb_before: m.cb_before, cb_after: m.cb_after } });
    }
    const membersSaved = await prisma.poolMember.findMany({ where: { poolId: pool.id } });
    res.json({ pool: { id: pool.id, year: pool.year }, allocation, members: membersSaved });
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export default router;
