import { NextFunction, Request, Response } from "express";
import nodemailer from "nodemailer";
import logger from "../utils/logger";

export default async function portfolioContact(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const { name, email, message } = req.body;

        // Validate required fields
        if (!name || !email || !message) {
            res.status(400).json({
                error: "Missing required fields: name, email, and message are required",
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
            logger.error("Missing email credentials in environment variables");
            res.status(500).json({
                error: "Email service configuration error",
                message:
                    "Missing email credentials. Please contact administrator.",
            });
            return;
        }

        const mailOptions = {
            from: process.env.EMAIL,
            to: "hello@dsourav.com",
            subject: "Email from " + name + " via portfolio contact form",
            text:
                "Sender Email - " +
                email +
                "\n\n" +
                "Sender message - " +
                message,
        };

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
                logger.error("Error sending portfolio email:", error);
                if (!res.headersSent) {
                    res.status(500).json({
                        error: "An error occurred while sending the email",
                        details: error.message,
                    });
                }
            } else {
                logger.info(
                    "Portfolio email sent successfully:",
                    info.response
                );
                if (!res.headersSent) {
                    res.status(200).json({
                        message:
                            "Message sent successfully! Thank you for contacting me.",
                        messageId: info.messageId,
                    });
                }
            }
        });
    } catch (error) {
        next(error);
    }
}
