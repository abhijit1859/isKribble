import { createClient } from "redis";

class RedisConfig {
  public client;

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL!,
    });

    this.connect();
  }

  async connect() {
    this.client.on("error", (err) => {
      console.log("Redis Error:", err);
    });

    await this.client.connect();

    console.log("Redis Connected");
  }
}

export const redisConfig = new RedisConfig();
export const redis = redisConfig.client;