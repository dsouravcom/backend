import { NextFunction, Request, Response } from "express";
import fs from "fs";
import nodemailer from "nodemailer";
import path from "path";
import logger from "../utils/logger";

export default async function mailSenderBot(
    req: Request & { file?: any },
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { subject, email, description } = req.body;

        // Validate required fields
        if (!subject || !email || !description) {
            res.status(400).json({
                error: "Missing required fields: subject, email, and description are required",
            });
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({
                error: "Invalid email format",
            });
            return;
        }

        // Validate email credentials
        if (!process.env.EMAIL || !process.env.PASSWORD) {
            logger.error("Missing mailsenderbot email credentials in environment variables");
            res.status(500).json({
                error: "Email service configuration error",
                message: "Missing email credentials. Please contact administrator."
            });
            return;
        }

        const mailOptions: any = {
            from: "Mail sender Bot",
            to: email,
            subject: subject,
            text: description,
        };

        if (req.file) {
            const { originalname, filename } = req.file;
            mailOptions.attachments = [
                {
                    filename: originalname,
                    path: path.join("uploads", filename),
                },
            ];
        }

        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // use false for STARTTLS; true for SSL on port 465
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });

        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                logger.error("Error sending mailsenderbot email:", error);
                if (!res.headersSent) {
                    res.status(500).json({
                        error: "Error sending email",
                        details: error.message,
                    });
                }
            } else {
                logger.info("Mailsenderbot email sent successfully:", info.response);
                if (!res.headersSent) {
                    res.status(200).json({
                        message: "Email sent successfully",
                        messageId: info.messageId,
                    });
                }
            }

            // Clean up uploaded file
            if (req.file) {
                const filePath = path.join("uploads", req.file.filename);
                try {
                    await fs.promises.unlink(filePath);
                    logger.info("Mailsenderbot file deleted:", filePath);
                } catch (deleteError) {
                    logger.error("Error deleting mailsenderbot file:", deleteError);
                }
            }
        });
    } catch (error) {
        logger.error("Error in mailSenderBot:", error);
        next(error);
    }
}
