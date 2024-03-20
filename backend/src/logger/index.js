import { format, createLogger, transports } from "winston";
import path from "path";
const { timestamp, combine, errors, json } = format;

// Initialize the transports array with the console transport
const loggerTransports = [new transports.Console()];

// Only add the file transport in development environment
if (process.env.NODE_ENV === "development") {
  loggerTransports.push(
    new transports.File({ filename: path.join(__dirname, "logs.json") })
  );
}

const logger = createLogger({
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    json()
  ),
  transports: loggerTransports,
});

export default logger;
