import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";
import winston from "winston";

const logtailClient = new Logtail(process.env.LOGTAIL_API_KEY!, {
    endpoint: process.env.LOGTAIL_INGESTING_URL,
});

// Colored console format
const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.colorize({ all: true }),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `[${timestamp}] ${level}: ${message}`;
        if (stack) log += `\n${stack}`;
        if (Object.keys(meta).length)
            log += `\n${JSON.stringify(meta, null, 2)}`;
        return log;
    })
);

// Build transports
const transports: winston.transport[] = [
    new winston.transports.Console({ format: consoleFormat }),
];

// Add Logtail in production
if (process.env.NODE_ENV === "production" && process.env.LOGTAIL_API_KEY) {
    transports.push(
        new LogtailTransport(logtailClient, {
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.errors({ stack: true }),
                winston.format.json()
            ),
        })
    );
}

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    transports,
});

export default logger;