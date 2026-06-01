import app from "./app";
import logger from "./utils/logger";
import connectDB from "./config/db";
import { CandidateInteraction } from "./models/CandidateInteraction";

const PORT = Number(process.env.PORT) || 4000;

/* ---------- PROCESS-LEVEL SAFETY ---------- */
process.on("uncaughtException", (error: Error) => {
    logger.error("UNCAUGHT EXCEPTION 💥", error);
    process.exit(1);
});

/* ---------- START SERVER ONLY AFTER DB CONNECTS ---------- */
const startServer = async () => {
    try {
        await connectDB();

        const server = app.listen(PORT, () => {
            logger.info(`🚀 Server started successfully`);
            logger.info(`🌐 Running on: http://localhost:${PORT}`);
            logger.info(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
            logger.info(`PORT: ${PORT}`);
        });

        process.on("unhandledRejection", (reason: unknown) => {
            logger.error("UNHANDLED PROMISE REJECTION 💥", reason);
            server.close(() => process.exit(1));
        });

    } catch (error) {
        logger.error("❌ Failed to start server", error);
        process.exit(1);
    }
};

startServer();
