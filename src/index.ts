import compression from "compression";
import cors from "cors";
import "dotenv/config";
import express, { Request, Response } from "express";
import helmet from "helmet";
import botDetector from "./middlewares/botDetector";
import errorHandler, { notFoundHandler } from "./middlewares/errorHandler";
import apiLimiter from "./middlewares/rateLimiter";
import router from "./routes/index";
import type { CorsOptions } from "./types";

const app = express();
const port = process.env.PORT || 3000;

// middleware ----------------------------------------------------------------------------
// security middlewares
app.use(helmet());

// rate limit
app.use(apiLimiter);

// bot detection middleware
app.use(botDetector);

// Body parsing with higher limits for batch log ingestion
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// CORS configuration
const allowedOrigins = process.env.WHITELISTED_DOMAINS;
const corsOptions: CorsOptions = {
    origin: (
        origin: string | undefined,
        callback: (error: Error | null, allow?: boolean) => void
    ) => {
        // Check if the origin is allowed
        if (!origin || (allowedOrigins && allowedOrigins.includes(origin))) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS -> " + origin));
        }
    },
    methods: "POST,GET",
    credentials: true,
};

// Apply CORS middleware globally to all routes
app.use((req, res, next) => {
    const excludeRoutes = ["/"]; // You can include routes that don't use Whitelisted domains.
    if (excludeRoutes.includes(req.path)) {
        cors()(req, res, next);
    } else {
        cors(corsOptions)(req, res, next);
    }
});

// Compression
app.use(compression());
// -----------------------------------------------------------------------------------------------

// Declaring the routes ---------------------------------------------------------------------
app.get("/", (req: Request, res: Response) => {
    res.json({ message: "Welcome to the multiple API server!" });
});
// Routes
app.use("/api", router);

// 404 handler for unmatched routes (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last middleware)
app.use(errorHandler);
// -----------------------------------------------------------------------------------------------

// server stating point ---------------------------------------------------------------------
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
// -----------------------------------------------------------------------------------------------
