import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import routesRouter from "../adapters/inbound/http/routes";
import complianceRouter from "./adapters/inbound/http/compliance";
import bankingRouter from "./adapters/inbound/http/banking";


const app = express();
const prisma = new PrismaClient();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// ✅ Mount routes
app.use("/", routesRouter);
app.use("/", complianceRouter);
app.use("/", bankingRouter);


// ✅ Ensure only one baseline on startup
async function ensureSingleBaseline() {
  const baselines = await prisma.route.findMany({
    where: { isBaseline: true },
  });

  if (baselines.length > 1) {
    console.warn(`⚠️ Multiple baselines found (${baselines.length}) — fixing...`);
    const [keep, ...reset] = baselines;
    await prisma.route.updateMany({
      where: { id: { in: reset.map((r) => r.id) } },
      data: { isBaseline: false },
    });
    console.log(`✅ Kept ${keep.routeId} as the single baseline.`);
  }
}

ensureSingleBaseline().catch(console.error);

// ✅ Start server
const PORT = 4000;
app.listen(PORT, () => console.log(`🚀 Server listening on ${PORT}`));
