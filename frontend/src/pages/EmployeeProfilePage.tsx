import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { API } from "../api/api";
import AddIncidentModal from "../components/employees/AddIncidentModal";

interface Employee {
    _id: string;
    employeeId: string;
    name: string;
    email: string;
    department?: string;
    designation?: string;
    currentTrustScore?: number;
    riskLevel?: string;
}

const EmployeeProfilePage: React.FC = () => {
    const { employeeId } = useParams<{ employeeId: string }>();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const res = await API.getEmployeeByEmployeeId(employeeId!);
                setEmployee(res.data.data);
            } catch (error) {
                toast.error("Failed to load employee");
            } finally {
                setLoading(false);
            }
        };

        if (employeeId) fetchEmployee();
    }, [employeeId]);


    const getRiskColor = (risk?: string) => {
        switch (risk) {
            case "Low":
                return "bg-green-100 text-green-700";
            case "Medium":
                return "bg-yellow-100 text-yellow-700";
            case "High":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    if (loading) return <div className="p-6">Loading...</div>;
    if (!employee) return <div className="p-6">Employee not found</div>;

    return (
        <div className="p-6">
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white border rounded-2xl p-6 shadow-sm"
            >
                <h1 className="text-2xl font-semibold">
                    {employee.name}
                </h1>

                <p className="text-gray-500 mt-1">
                    {employee.designation} • {employee.department}
                </p>

                <div className="mt-6 flex items-center gap-6">
                    <div>
                        <p className="text-sm text-gray-500">
                            Trust Score
                        </p>
                        <p className="text-3xl font-bold">
                            {employee.currentTrustScore ?? "—"}
                        </p>
                    </div>

                    <div>
                        <p className="text-sm text-gray-500">
                            Risk Level
                        </p>
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(
                                employee.riskLevel
                            )}`}
                        >
                            {employee.riskLevel || "N/A"}
                        </span>
                    </div>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="mt-6 px-6 py-3 bg-black text-white rounded-xl"
                >
                    + Add Incident
                </button>
            </motion.div>

            {showModal && (
                <AddIncidentModal
                    employeeId={employee._id}
                    onClose={() => setShowModal(false)}
                    onSuccess={(updatedEmployee) =>
                        setEmployee(updatedEmployee)
                    }
                />
            )}
        </div>
    );
};

export default EmployeeProfilePage;
