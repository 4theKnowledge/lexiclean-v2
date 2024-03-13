import { format, createLogger, transports } from "winston";
const { timestamp, combine, errors, json } = format;

const logger = createLogger({
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    json()
  ),
  // defaultMeta: { service: 'user-service' },
  transports: [
    new transports.Console(),
    new transports.File({ filename: "./logger/logs.json" }),
  ],
});

export default logger;
