import { Router } from "express";
import { redis } from "../config/redis.js";

const router = Router();

router.get("/flush", async (_, res) => {
  await redis.flushAll();

  res.send("Redis flushed!");
});

export default router;