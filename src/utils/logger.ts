import { Logtail } from "@logtail/node";
import { LogtailTransport } from "@logtail/winston";
import winston from "winston";

// Create a Logtail client
const logtail = new Logtail(process.env.LOGTAIL_API_KEY!);

// Custom format for colored console output
const coloredFormat = winston.format.combine(
    winston.format.timestamp({
        format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.colorize({
        all: true,
        colors: {
            error: "red",
            warn: "yellow",
            info: "green",
            http: "magenta",
            verbose: "cyan",
            debug: "blue",
            silly: "grey",
        },
    }),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `[${timestamp}] ${level}: ${message}`;

        // Add stack trace for errors
        if (stack) {
            log += `\n${stack}`;
        }

        // Add metadata if present
        const metaString = Object.keys(meta).length
            ? `\n${JSON.stringify(meta, null, 2)}`
            : "";
        return log + metaString;
    })
);

// Format for Logtail (structured, no colors)
const structuredFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Create transports array - conditionally add Logtail in production
const transports: winston.transport[] = [
    new winston.transports.Console({
        format: coloredFormat,
    }),
];

// Only add Logtail transport in production environment
if (process.env.NODE_ENV === "production") {
    transports.push(
        new LogtailTransport(logtail, {
            format: structuredFormat,
        })
    );
}

// Create a Winston logger
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    transports,
});

export default logger;
