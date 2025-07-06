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
        const { url } = req.body;

        if (!url) {
            res.status(400).json({ error: "URL is required" });
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
    } catch (error) {
        next(error);
    }
}
