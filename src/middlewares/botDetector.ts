import { NextFunction, Request, Response } from "express";
import { isbot } from "isbot";
import logger from "../utils/logger";
/**
 * Middleware to detect and block bot traffic based on User-Agent header.
 * Allows Postman for API testing.
 * Logs bot details for monitoring.
 */
const botDetector = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Get user agent from request headers
        const userAgent = req.get("User-Agent") || "";

        // Allow Postman for API testing
        if (userAgent.toLowerCase().includes("postman")) {
            console.log("Postman detected - Access allowed");
            logger.info("✅ Postman detected - Access allowed", {
                userAgent: userAgent,
                ip: req.ip || req.socket?.remoteAddress,
                method: req.method,
                url: req.originalUrl,
            });
            return next();
        }

        // Check if the user agent is a bot
        const isBotDetected = isbot(userAgent);

        if (isBotDetected) {
            // Log bot details for monitoring
            const botDetails = {
                timestamp: new Date().toISOString(),
                ip: req.ip || req.socket?.remoteAddress,
                userAgent: userAgent,
                method: req.method,
                url: req.originalUrl,
                headers: req.headers,
                blocked: true,
            };

            console.log("🤖 BOT DETECTED AND BLOCKED:");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log(`Timestamp: ${botDetails.timestamp}`);
            console.log(`IP Address: ${botDetails.ip}`);
            console.log(`User Agent: ${botDetails.userAgent}`);
            console.log(`Method: ${botDetails.method}`);
            console.log(`URL: ${botDetails.url}`);
            console.log(
                `Headers:`,
                JSON.stringify(botDetails.headers, null, 2)
            );
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            logger.warn("🚫 Bot traffic detected and blocked", {
                userAgent: botDetails.userAgent,
                ip: botDetails.ip,
                method: botDetails.method,
                url: botDetails.url,
                headers: botDetails.headers,
            });

            // Return error response
            res.status(403).json({
                error: "Access Denied",
                message: "Bot traffic is not allowed",
                code: "BOT_DETECTED",
                timestamp: botDetails.timestamp,
            });
        }

        // If not a bot, continue to next middleware
        next();
    } catch (error) {
        // Handle any errors in bot detection
        console.error("❌ Error in bot detection middleware:", error);
        logger.error("❌ Error in bot detection middleware", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : "No stack trace",
        });

        // In case of error, allow the request to continue
        // You can change this behavior based on your security requirements
        next();
    }
};

export default botDetector;
