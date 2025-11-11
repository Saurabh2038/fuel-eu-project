import express from "express";
import cors from "cors";
import routesRouter from "./adapters/inbound/http/routes";
import complianceRouter from "./adapters/inbound/complianceController";
import bankingRouter from "./adapters/inbound/bankingController";
import poolsRouter from "./adapters/inbound/poolsController";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/", routesRouter);
app.use("/", complianceRouter);
app.use("/", bankingRouter);
app.use("/", poolsRouter);

if (process.env.NODE_ENV !== "test") {
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`Server listening on ${port}`));
}

export default app;
