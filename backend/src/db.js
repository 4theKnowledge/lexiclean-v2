import mongoose from "mongoose";
import logger from "./logger/index.js";

const connectDB = async () => {
  const DB_URI = process.env.DB_URI;
  logger.info(`DB_URI: ${DB_URI}`);

  try {
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info("[server] Connected to db");
  } catch (err) {
    logger.error(err);
  }
};

const disconnectDB = async () => {
  await mongoose.connection.close();
};

export { connectDB, disconnectDB };
