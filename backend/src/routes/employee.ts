import express, { Response } from "express";
import { Employee } from "../models/Employee";
import { Company } from "../models/Company";
import { authenticate, AuthRequest } from "../middlewares/auth";
import { Types } from "mongoose";
import { generateEmployeeId } from "../utils/generateEmployeeId";
import { EmployeeIncident } from "../models/EmployeeIncident";
import { IncidentType } from "../models/IncidentType";
import { calculateFinalTrustScore } from "../utils/calculateTrustMetrics";
import { recalculateEmployeeTrust } from "../services/trustService";


const router = express.Router();

/**
 * Create Single Employee
 */
router.post("/", authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { name, email, department, designation, dateOfJoining } = req.body;

        if (!name || !email || !dateOfJoining) {
            return res.status(400).json({
                success: false,
                message: "Name, email and dateOfJoining are required",
            });
        }

        const employeeId = await generateEmployeeId(
            new Types.ObjectId(req.user!.companyId)
        );

        const employee = await Employee.create({
            companyId: req.user!.companyId,
            createdBy: req.user!.userId,
            employeeId,
            name: name.trim(),
            email: email.toLowerCase().trim(),
            department,
            designation,
            dateOfJoining: new Date(dateOfJoining),
        });

        return res.status(201).json({
            success: true,
            message: "Employee created successfully",
            data: employee,
        });
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message:
                    "Employee with same email or employeeId already exists",
            });
        }

        console.error("Create Employee Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

/**
 * Get All Active Employees (Company Scoped)
 */
router.get("/", authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const companyId = req.user!.companyId;

        const employees = await Employee.find({
            companyId,
            isActive: true,
        })
            .sort({ createdAt: -1 })
            .lean();

        const company = await Company.findById(companyId)
            .select("name")
            .lean();

        return res.status(200).json({
            success: true,
            count: employees.length,
            companyName: company?.name || "",
            data: employees,
        });
    } catch (error) {
        console.error("Fetch Employees Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

/**
 * Get Employee By Employee ID (Company Scoped)
 */
router.get(
    "/by-employee-id/:employeeId",
    authenticate,
    async (req: AuthRequest, res: Response) => {
        try {
            const { employeeId } = req.params;

            if (!employeeId) {
                return res.status(400).json({
                    success: false,
                    message: "Employee ID is required",
                });
            }

            const employee = await Employee.findOne({
                employeeId,
                companyId: req.user!.companyId,
                isActive: true,
            }).lean();

            if (!employee) {
                return res.status(404).json({
                    success: false,
                    message: "Employee not found",
                });
            }

            return res.status(200).json({
                success: true,
                data: employee,
            });
        } catch (error) {
            console.error("Fetch Employee Error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
);

/**
 * Update Employee (Company Scoped)
 * Trust fields are system-controlled and cannot be updated here.
 */
router.put("/:id", authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, department, designation, dateOfJoining } =
            req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is required",
            });
        }

        const updateData: any = {};

        if (name) updateData.name = name.trim();
        if (email) updateData.email = email.toLowerCase().trim();
        if (department !== undefined) updateData.department = department;
        if (designation !== undefined) updateData.designation = designation;
        if (dateOfJoining)
            updateData.dateOfJoining = new Date(dateOfJoining);

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No valid fields provided for update",
            });
        }

        const updatedEmployee = await Employee.findOneAndUpdate(
            {
                _id: id,
                companyId: req.user!.companyId,
            },
            { $set: updateData },
            { new: true }
        );

        if (!updatedEmployee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            data: updatedEmployee,
        });
    } catch (error: any) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Employee with same email already exists",
            });
        }

        console.error("Update Employee Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

router.post(
    "/:id/incidents",
    authenticate,
    async (req: AuthRequest, res: Response) => {
        try {
            const rawId = req.params.id;
            const { incidentTypeId, note } = req.body;

            if (!incidentTypeId) {
                return res.status(400).json({
                    success: false,
                    message: "incidentTypeId is required",
                });
            }

            // ✅ Fix string | string[]
            const employeeId = Array.isArray(rawId) ? rawId[0] : rawId;

            const companyId = req.user!.companyId;
            const userId = req.user!.userId;

            // Validate Employee
            const employee = await Employee.findOne({
                _id: employeeId,
                companyId,
                isActive: true,
            });

            if (!employee) {
                return res.status(404).json({
                    success: false,
                    message: "Employee not found",
                });
            }

            // Validate Incident Type
            const incidentType = await IncidentType.findOne({
                _id: incidentTypeId,
                $or: [
                    { isSystemDefault: true },
                    { companyId },
                ],
            });

            if (!incidentType) {
                return res.status(404).json({
                    success: false,
                    message: "Incident type not found",
                });
            }

            // Create Incident
            const incident = await EmployeeIncident.create({
                companyId,
                employeeId,
                incidentTypeId,
                impactSnapshot: incidentType.impact,
                note,
                createdBy: userId,
            });

            // Recalculate Trust (90-day logic inside utility)
            await recalculateEmployeeTrust(employeeId, companyId);

            const updatedEmployee = await Employee.findById(employeeId);

            return res.status(201).json({
                success: true,
                message: "Incident added and trust score updated",
                data: {
                    incident,
                    employee: updatedEmployee,
                },
            });

        } catch (error) {
            console.error("Create Employee Incident Error:", error);

            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
);

export default router;
