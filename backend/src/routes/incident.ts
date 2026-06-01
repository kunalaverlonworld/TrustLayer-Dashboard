import dotenv from "dotenv";
dotenv.config();
import express, { Response } from "express";
import { Types } from "mongoose";
import { authenticate, AuthRequest } from "../middlewares/auth";
import { IncidentType } from "../models/IncidentType";
import { Employee } from "../models/Employee";

const router = express.Router();


// ======================================================
// GET ALL INCIDENT TYPES (System + Company Scoped)
// ======================================================
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user!.companyId;
        console.log("IncidentType:", IncidentType);
        const incidentTypes = await IncidentType.find({
            $or: [
                { isSystemDefault: true },
                { companyId },
            ],
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: incidentTypes.length,
            data: incidentTypes,
        });
    } catch (error) {
        console.error("Fetch Incident Types Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});


// ======================================================
// CREATE CUSTOM INCIDENT TYPE
// ======================================================
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { name, impact, type } = req.body;

        if (!name || impact === undefined || !type) {
            return res.status(400).json({
                success: false,
                message: "name, impact and type are required",
            });
        }

        const incidentType = await IncidentType.create({
            companyId: req.user!.companyId,
            name: name.trim(),
            impact,
            type,
            isSystemDefault: false,
        });

        return res.status(201).json({
            success: true,
            message: "Incident type created successfully",
            data: incidentType,
        });

    } catch (error: any) {

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Incident type with same name already exists",
            });
        }

        console.error("Create Incident Type Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

router.post(
    "/system",
    authenticate,
    async (req: AuthRequest, res: Response) => {
        try {
            // Only super admin allowed
            if (req.user!.role !== "superadmin") {
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const { name, impact, type } = req.body;

            if (!name || impact === undefined || !type) {
                return res.status(400).json({
                    success: false,
                    message: "name, impact and type are required",
                });
            }

            const SYSTEM_COMPANY_ID = process.env.SYSTEM_COMPANY_ID!;

            const incidentType = await IncidentType.create({
                companyId: SYSTEM_COMPANY_ID,
                name: name.trim(),
                impact,
                type,
                isSystemDefault: true,
            });

            return res.status(201).json({
                success: true,
                message: "System incident type created successfully",
                data: incidentType,
            });

        } catch (error: any) {

            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "Incident type already exists",
                });
            }

            console.error("Create System Incident Type Error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
);

// ======================================================
// SEED DEFAULT SYSTEM INCIDENT TYPES (SUPERADMIN ONLY)
// ======================================================
router.post(
    "/seed-defaults",
    authenticate,
    async (req: AuthRequest, res: Response) => {
        try {
            // Only super admin allowed
            if (req.user!.role !== "superadmin") {
                return res.status(403).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const SYSTEM_COMPANY_ID = process.env.SYSTEM_COMPANY_ID!;

            const defaultIncidents = [
                { name: "Repeated Late Submission", impact: -8, type: "negative" },
                { name: "Missed Critical Deadline", impact: -15, type: "negative" },
                { name: "Unapproved Absence", impact: -12, type: "negative" },
                { name: "Policy Violation - Minor", impact: -10, type: "negative" },
                { name: "Client Escalation Due to Negligence", impact: -18, type: "negative" },
                { name: "Data Handling Non-Compliance", impact: -20, type: "negative" },
                { name: "Early Delivery of Critical Task", impact: 10, type: "positive" },
                { name: "Client Appreciation Received", impact: 15, type: "positive" },
                { name: "Process Improvement Contribution", impact: 8, type: "positive" },
                { name: "Exceptional Team Support", impact: 6, type: "positive" },
            ];

            let insertedCount = 0;

            for (const incident of defaultIncidents) {
                const exists = await IncidentType.findOne({
                    name: incident.name,
                    companyId: SYSTEM_COMPANY_ID,
                });

                if (!exists) {
                    await IncidentType.create({
                        companyId: SYSTEM_COMPANY_ID,
                        name: incident.name,
                        impact: incident.impact,
                        type: incident.type,
                        isSystemDefault: true,
                    });
                    insertedCount++;
                }
            }

            return res.status(200).json({
                success: true,
                message: "System default incidents seeded successfully",
                inserted: insertedCount,
            });

        } catch (error) {
            console.error("Seed System Incident Types Error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
);

export default router;
