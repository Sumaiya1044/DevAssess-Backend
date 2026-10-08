import { createClient } from "redis";

const redis = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectStrategy: false,
  },
});

redis.on("error", (error) => {
  console.error("Redis error:", error);
});

export const connectRedis = async () => {
  if (!redis.isOpen) {
    try {
      await redis.connect();
      console.log("Redis connected");
    } catch (error) {
      console.warn("Redis unavailable. Continuing without Redis.");
    }
  }
};

export default redis;
