import { createClient } from "redis";
import dotenv from "dotenv"
dotenv.config()
class RedisConfig {
  public client;

  constructor() {
    console.log(process.env.REDIS_URL)
    if(!process.env.REDIS_URL){
      console.log("REDIS URL NOT FOUND")
    }
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