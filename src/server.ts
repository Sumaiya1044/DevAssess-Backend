import "dotenv/config";
import app from "./app.js";
import { connectRedis } from "./config/redis.js";

const PORT = process.env.PORT || 5000;

connectRedis()
  .then(() => {
    console.log("Redis connected");
  })
  .catch((error) => {
    console.error("Redis connection failed, continuing without Redis:", error);
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`DevAssess API running on port ${PORT}`);
    });
  });
