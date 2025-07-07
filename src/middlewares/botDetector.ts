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
        const customBotHeader = req.get("X-Authorized-Bot") || req.get("x-authorized-bot");
        const expectedBotToken = process.env.AUTHORIZED_BOT_TOKEN;

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
            // Check if it's an authorized bot with custom header
            if (customBotHeader === expectedBotToken) {
                // Allow access only to root endpoint
                if (req.originalUrl === "/" || req.path === "/") {
                    logger.info("✅ Authorized bot detected - Root access granted", {
                        userAgent: userAgent,
                        ip: req.ip || req.socket?.remoteAddress,
                        method: req.method,
                        url: req.originalUrl,
                        botHeader: "Present (hidden for security)",
                    });
                    
                    console.log("🤖 AUTHORIZED BOT - Root access granted");
                    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                    console.log(`Timestamp: ${new Date().toISOString()}`);
                    console.log(`IP Address: ${req.ip || req.socket?.remoteAddress}`);
                    console.log(`User Agent: ${userAgent}`);
                    console.log(`Method: ${req.method}`);
                    console.log(`URL: ${req.originalUrl}`);
                    console.log(`Status: AUTHORIZED - Root access only`);
                    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                    
                    return next();
                } else {
                    // Authorized bot trying to access non-root endpoint
                    logger.warn("🚫 Authorized bot blocked - Non-root endpoint access attempt", {
                        userAgent: userAgent,
                        ip: req.ip || req.socket?.remoteAddress,
                        method: req.method,
                        url: req.originalUrl,
                        attemptedEndpoint: req.originalUrl,
                    });

                    console.log("🤖 AUTHORIZED BOT BLOCKED - Non-root access attempt");
                    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
                    console.log(`Timestamp: ${new Date().toISOString()}`);
                    console.log(`IP Address: ${req.ip || req.socket?.remoteAddress}`);
                    console.log(`User Agent: ${userAgent}`);
                    console.log(`Attempted URL: ${req.originalUrl}`);
                    console.log(`Status: BLOCKED - Only root endpoint allowed`);
                    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

                    res.status(403).json({
                        error: "Access Denied",
                        message: "Authorized bots can only access the root endpoint",
                        code: "BOT_ENDPOINT_RESTRICTED",
                        allowedEndpoint: "/",
                        timestamp: new Date().toISOString(),
                    });
                    return;
                }
            }

            // Regular bot detection and blocking
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
            console.log(`Status: BLOCKED - Unauthorized bot`);
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            
            logger.warn("🚫 Bot traffic detected and blocked", {
                userAgent: botDetails.userAgent,
                ip: botDetails.ip,
                method: botDetails.method,
                url: botDetails.url,
                hasCustomHeader: !!customBotHeader,
                customHeaderValid: customBotHeader === expectedBotToken,
            });

            // Return error response for unauthorized bots
            res.status(403).json({
                error: "Access Denied",
                message: "Bot traffic is not allowed",
                code: "BOT_DETECTED",
                timestamp: botDetails.timestamp,
            });
            return;
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