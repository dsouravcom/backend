import { NextFunction, Request, Response } from "express";
import { isbot } from "isbot";
import logger from "../utils/logger";

/**
 * Middleware to detect and block bot traffic based on User-Agent header.
 * Allows Postman for API testing.
 * Allows specific bots with custom header for root endpoint only.
 * Logs bot details for monitoring.
 */
const botDetector = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Get user agent from request headers
        const userAgent = req.get("User-Agent") || "";

        // Get custom header for authorized bots
        const customBotHeader =
            req.get("X-Authorized-Bot") || req.get("x-authorized-bot");
        const expectedBotToken = process.env.AUTHORIZED_BOT_TOKEN;

        // Allow Postman for API testing
        if (userAgent.toLowerCase().includes("postman")) {
            console.log("Postman detected - Access allowed");
            logger.info("✅ Postman detected - Access allowed", {
                userAgent: userAgent,
                ip: req.ip || req.socket?.remoteAddress,
                method: req.method,
                url: req.originalUrl,
                headers: {
                    "x-forwarded-for": req.get("X-Forwarded-For"),
                    "x-real-ip": req.get("X-Real-IP"),
                },
            });
            return next();
        }

        // allow whitelisted domains to bypass bot detection
        const allowedOrigins = process.env.WHITELISTED_DOMAINS;
        const origin = req.get("Origin") || "";
        if (allowedOrigins && allowedOrigins.includes(origin)) {
            return next();
        }

        // Check if the user agent is a bot
        const isBotDetected = isbot(userAgent);

        if (isBotDetected) {
            // Check if it's an authorized bot with custom header
            if (customBotHeader === expectedBotToken) {
                // only allow if accessing the root endpoint
                if (req.path === "/") {
                    logger.info("✅ Authorized bot access granted", {
                        userAgent: userAgent,
                        ip: req.ip || req.socket?.remoteAddress,
                        method: req.method,
                        url: req.originalUrl,
                        hasCustomHeader: true,
                        headers: {
                            "x-forwarded-for": req.get("X-Forwarded-For"),
                            "x-real-ip": req.get("X-Real-IP"),
                        },
                    });
                    return next();
                }
                // Deny access for authorized bots to non-root endpoints
                logger.warn(
                    "🚫 Authorized bot attempted access to non-root endpoint",
                    {
                        userAgent: userAgent,
                        ip: req.ip || req.socket?.remoteAddress,
                        method: req.method,
                        url: req.originalUrl,
                    }
                );
            } else {
                logger.warn("🚫 Bot traffic detected and blocked", {
                    userAgent: userAgent,
                    ip: req.ip || req.socket?.remoteAddress,
                    method: req.method,
                    url: req.originalUrl,
                    hasCustomHeader: !!customBotHeader,
                    customHeaderValid: customBotHeader === expectedBotToken,
                    headers: {
                        "x-forwarded-for": req.get("X-Forwarded-For"),
                        "x-real-ip": req.get("X-Real-IP"),
                    },
                });

                // Return error response for unauthorized bots
                res.status(403).json({
                    error: "Access Denied",
                    message: "Bot traffic is not allowed",
                    code: "BOT_DETECTED",
                    timestamp: new Date().toISOString(),
                });
                return;
            }
        }

        // If not a bot, continue to next middleware
        next();
    } catch (error) {
        // Handle any errors in bot detection
        logger.error("❌ Error in bot detection middleware", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : "No stack trace",
        });

        // In case of error, allow the request to continue
        next();
    }
};

export default botDetector;
