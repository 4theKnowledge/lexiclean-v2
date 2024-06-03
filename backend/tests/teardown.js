import { disconnectDB } from "../src/db.js";
import logger from "../src/logger/index.js";

export default async function () {
  disconnectDB();
  logger.info("Disconnected from db");
}
