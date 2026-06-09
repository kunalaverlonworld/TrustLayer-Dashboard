import express, { Application, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import morgan from "morgan";
import dotenv from "dotenv";

import logger from "./utils/logger";
import authRoutes from "./routes/auth";
import employeeRoutes from "./routes/employee";
import userRoutes from "./routes/user";
import testRoutes from "./routes/test";
import companyRoutes from "./routes/Company";
import trustLayerRouter from "./routes/trustLayer";
import hrFeedbackRouter from "./routes/hrFeedback";
import trustScoreRouter from "./routes/trustScore";
import trustExplainRouter from "./routes/trustExplain";
import incident from "./routes/incident";
import { errorHandler } from "./middlewares/errorHandler";
import lmsProxyRoutes from "./routes/lmsProxy";
import razorpayRoutes from "./routes/razorpay";

dotenv.config();

const app: Application = express();
const NODE_ENV = process.env.NODE_ENV || "development";

/* ---------- BASIC SECURITY ---------- */
app.use(helmet());

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "https://trusted-cdn.com"],
            imgSrc: ["'self'", "data:"],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    })
);

/* ---------- CORS ---------- */
const whitelist = [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "https://trustlayer-by3p.onrender.com",
    "https://trustlayer-frontend.onrender.com"
];
app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || whitelist.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
        credentials: true,
    })
);

/* ---------- RATE LIMIT ---------- */
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000, // 15 mins
        // Dashboard polls every 30s, so 200 req/15min per IP is safe for production
        max: NODE_ENV === "production" ? 200 : 500,
        standardHeaders: true,
        legacyHeaders: false,
        message: "Too many requests, please try again later.",
        skip: (req) => {
            // Skip rate limiting for health check
            return req.path === "/" || req.path === "/health";
        },
    })
);

/* ---------- BODY PARSING ---------- */
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

/* ---------- HPP ---------- */
app.use(hpp());

/* ---------- LOGGING ---------- */
if (NODE_ENV === "development") {
    app.use(
        morgan("dev", {
            stream: {
                write: (message: string) => logger.info(message.trim()),
            },
        })
    );
} else {
    app.use(
        morgan("combined", {
            stream: {
                write: (message: string) => logger.info(message.trim()),
            },
        })
    );
}

/* ---------- ROUTES ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/test", testRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/trustlayer", trustLayerRouter);
app.use("/api/hr-feedback", hrFeedbackRouter);
app.use("/api/trustscore", trustScoreRouter);
app.use("/api/trust-explain", trustExplainRouter);
app.use("/api/incident-types", incident);
app.use("/api/lms", lmsProxyRoutes);
app.use("/api/razorpay", razorpayRoutes);

/* ---------- HEALTH CHECK ---------- */
app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({
        status: "ok",
        message: "Backend is running",
    });
});

/* ---------- ERROR HANDLER ---------- */
app.use(errorHandler);

export default app;
