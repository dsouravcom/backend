import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";

// Simple error handling middleware
const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Default to 500 server error
    let statusCode = err.statusCode || 500;

    // User-friendly message (what user sees)
    let userMessage =
        "An unexpected error occurred on our server. Please try again later, and if the problem persists, contact support.";

    // Determine user-friendly message based on status code
    switch (statusCode) {
        case 400:
            userMessage =
                "The request you sent is invalid or malformed. Please check your input data and try again.";
            break;
        case 401:
            userMessage =
                "You are not authorized to access this resource. Please log in and try again.";
            break;
        case 403:
            userMessage =
                "You do not have permission to access this resource. Please contact an administrator if you believe this is an error.";
            break;
        case 404:
            userMessage =
                "The requested resource could not be found. Please check the URL and try again.";
            break;
        case 408:
            userMessage =
                "The request took too long to process and timed out. Please try again in a moment.";
            break;
        case 429:
            userMessage =
                "You have made too many requests in a short period. Please wait a moment before trying again.";
            break;
        case 500:
        default:
            userMessage =
                "An unexpected error occurred on our server. Please try again later, and if the problem persists, contact support.";
            break;
    }

    // Log the complete error details for developers
    logger.error("Error occurred", {
        actualError: err.message || "Unknown error",
        errorCode: err.code, // Error codes like ENOTFOUND, ETIMEDOUT, etc.
        statusCode: statusCode,
        error: err,
        path: req.originalUrl,
        method: req.method,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
        stack: err.stack,
        timestamp: new Date().toISOString(),
        // Additional axios error details if available
        ...(err.response && {
            axiosStatus: err.response.status,
            axiosData: err.response.data,
            axiosHeaders: err.response.headers,
        }),
    });

    // Send user-friendly error response (no technical details)
    res.status(statusCode).json({
        success: false,
        error: userMessage,
    });
};

// 404 handler for unmatched routes
export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const error = new Error(`Route ${req.originalUrl} not found`);
    (error as any).statusCode = 404;
    next(error);
};

// Simple async wrapper for controllers
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export default errorHandler;
