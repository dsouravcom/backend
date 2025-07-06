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
    let message = err.message || "Internal Server Error";

    // Log the error
    logger.error("Error occurred", {
        error: message,
        statusCode,
        path: req.originalUrl,
        method: req.method,
        ip: req.ip,
        stack: err.stack,
    });

    // Send error response
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
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
