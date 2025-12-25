import axios from "axios";
import { load } from "cheerio";
import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";

export default async function instaCaptionExtractor(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { url, token } = req.body;

        if (!url) {
            res.status(400).json({ error: "URL is required" });
            return;
        }

        // Verify Cloudflare Turnstile token
        if (!token) {
            res.status(400).json({ error: "Turnstile token is required" });
            return;
        }

        if (!process.env.TURNSTILE_SECRET_KEY) {
            logger.error(
                "Missing Turnstile secret key in environment variables"
            );
            res.status(500).json({
                error: "Service configuration error",
            });
            return;
        }

        try {
            const turnstileResponse = await axios.post(
                "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                {
                    secret: process.env.TURNSTILE_SECRET_KEY,
                    response: token,
                }
            );

            if (!turnstileResponse.data.success) {
                res.status(403).json({
                    error: "Turnstile verification failed. Please try again.",
                });
                return;
            }
        } catch (turnstileError) {
            logger.error("Turnstile verification error:", turnstileError);
            res.status(500).json({
                error: "Failed to verify captcha. Please try again.",
            });
            return;
        }

        // Validate the URL format like a normal url then check if the url contain instagram.com
        const urlPattern = /^(https?:\/\/)?(www\.)?instagram\.com\/.+/;
        if (!urlPattern.test(url)) {
            res.status(400).json({ error: "Invalid Instagram URL format" });
            return;
        }

        // Make a GET request to the URL
        const response = await axios.get(url);

        // Load HTML content into Cheerio
        const $ = load(response.data);

        // Extract metadata (example: title and description)
        // const title = $('head title').text();
        const description = $('meta[property="og:title"]').attr("content");

        // split it to get original caption
        const str = description?.split(":").slice(1);
        const result = str?.join(":");

        // log a message
        logger.info("Caption extracted successfully");

        // Send the extracted metadata as JSON response
        res.status(200).json({
            message: "Caption extracted successfully",
            caption: result,
        });
        return;
    } catch (error: any) {
        // Handle specific axios errors with user-friendly messages
        if (error.code === "ENOTFOUND") {
            res.status(400).json({
                error: "Invalid Instagram URL. Please check the URL and try again.",
            });
            return;
        }

        if (error.code === "ECONNREFUSED") {
            res.status(503).json({
                error: "Unable to connect to Instagram. Please try again later.",
            });
            return;
        }

        if (error.code === "ETIMEDOUT") {
            res.status(408).json({
                error: "Request timeout. Instagram is taking too long to respond.",
            });
            return;
        }

        if (error.response?.status === 404) {
            res.status(404).json({
                error: "Instagram post not found. Please check if the URL is correct and the post is public.",
            });
            return;
        }

        if (error.response?.status === 403) {
            res.status(403).json({
                error: "Access denied. This Instagram post might be private or restricted.",
            });
            return;
        }

        // Log the actual error for debugging
        logger.error("Instagram caption extraction error:", error);

        // For truly unknown errors, let the error middleware handle it
        next(error);
    }
}
