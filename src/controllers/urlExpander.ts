import axios from "axios";
import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";

/**
 * Expands a shortened URL to its original form.
 * @param req - The request object containing the URL to expand.
 * @param res - The response object to send the expanded URL.
 */

export default async function expandUrl(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { url } = req.body;
        var finalUrl;

        if (!url) {
            res.status(400).json({ error: "URL is required" });
            return;
        }

        // Validate URL format using a regex pattern
        const urlPattern = /^(https?:\/\/)?([\w.-]+)(:[0-9]+)?(\/[\w.-]*)*\/?$/;
        if (!urlPattern.test(url)) {
            res.status(400).json({ error: "Invalid URL format" });
            return;
        }
        // If the URL does not start with http or https, add it
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            finalUrl = `http://${url}`;
        } else {
            finalUrl = url;
        }

        const response = await axios.head(finalUrl!, { maxRedirects: 5 });

        // Log a message
        logger.info("One URL expanded successfully");
        // Send the expanded URL in the response
        res.json({
            message: "URL expanded successfully",
            expandedUrl: response.request.res.responseUrl,
        });
    } catch (error) {
        next(error);
    }
}
