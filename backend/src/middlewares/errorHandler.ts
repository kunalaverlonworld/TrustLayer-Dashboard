import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

interface ErrorWithStatus extends Error {
    status?: number;
}

export const errorHandler = (
    err: ErrorWithStatus,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    const statusCode = err.status || 500;

    // Log full error stack internally
    logger.error(err.stack || err.message);

    // Send response
    res.status(statusCode).json({
        success: false,
        message:
            process.env.NODE_ENV === "production" && statusCode === 500
                ? "Internal Server Error"
                : err.message,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
};
