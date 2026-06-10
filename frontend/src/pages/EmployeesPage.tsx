import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { API } from "../api/api";
import toast from "react-hot-toast";
import { useSearch } from "../context/SearchContext";

interface Employee {
    _id: string;
    employeeId: string;
    name: string;
    email: string;
    department?: string;
    designation?: string;
    dateOfJoining: string;
}

interface EmployeesResponse {
    success: boolean;
    data: Employee[];
    companyName?: string;
}

interface EmployeePayload {
    name: string;
    email: string;
    department?: string;
    designation?: string;
    dateOfJoining: string;
}

const EmployeesPage: React.FC = () => {
    const navigate = useNavigate();
    const { searchQuery } = useSearch();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [companyName, setCompanyName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);

    const [formData, setFormData] = useState<EmployeePayload>({
        name: "",
        email: "",
        department: "",
        designation: "",
        dateOfJoining: "",
    });

    const fetchEmployees = async (): Promise<void> => {
        try {
            setLoading(true);
            setError(null);

            const response = await API.getAllEmployees();
            const responseData: EmployeesResponse = response.data;

            if (!responseData.success || !Array.isArray(responseData.data)) {
                throw new Error("Invalid response format");
            }

            setEmployees(responseData.data);
            setCompanyName(responseData.companyName || "");
        } catch (err) {
            console.error("Employee Fetch Error:", err);
            setError("Failed to fetch employees.");
            toast.error("Failed to fetch employees");
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const filteredEmployees = useMemo(() => {
        if (!searchQuery.trim()) return employees;
        const query = searchQuery.toLowerCase();
        return employees.filter(
            (emp) =>
                emp.name?.toLowerCase().includes(query) ||
                emp.email?.toLowerCase().includes(query) ||
                emp.department?.toLowerCase().includes(query) ||
                emp.designation?.toLowerCase().includes(query)
        );
    }, [employees, searchQuery]);

    const handleSubmit = async (): Promise<void> => {
        if (!formData.name || !formData.email || !formData.dateOfJoining) {
            toast.error("Name, Email and Date of Joining are required");
            return;
        }

        try {
            setSubmitting(true);

            if (editingEmployee) {
                await API.updateEmployee(editingEmployee._id, formData);
                toast.success("Employee details updated successfully");
            } else {
                await API.createEmployee(formData);
                toast.success("Employee created successfully");
            }

            closeModal();
            await fetchEmployees();
        } catch (err: any) {
            console.error("Submit Error:", err);
            toast.error(
                err?.response?.data?.message ||
                "Operation failed."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const openCreateModal = () => {
        setEditingEmployee(null);
        setFormData({
            name: "",
            email: "",
            department: "",
            designation: "",
            dateOfJoining: "",
        });
        setShowModal(true);
    };

    const openEditModal = (employee: Employee) => {
        setEditingEmployee(employee);
        setFormData({
            name: employee.name,
            email: employee.email,
            department: employee.department || "",
            designation: employee.designation || "",
            dateOfJoining: employee.dateOfJoining.split("T")[0],
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingEmployee(null);
    };

    return (
        <div className="ml-5">
            <style>{`
                .tl-input {
                    width: 100%;
                    padding: 12px;
                    border-radius: 8px;
                    font-size: 14px;
                    color: #0a1f3d;
                    background: #ffffff;
                    border: 1px solid #e2eaf3;
                    outline: none;
                    transition: all 0.2s;
                }
                .tl-input:focus {
                    border-color: #00b8d4;
                    background: #ffffff;
                    box-shadow: 0 0 0 3px rgba(0, 184, 212, 0.15);
                }
            `}</style>

            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                    Employees
                </h1>

                {companyName && (
                    <p className="text-slate-500 mt-2 text-sm font-medium">
                        Company:{" "}
                        <span className="text-cyan-600 font-bold">
                            {companyName}
                        </span>
                    </p>
                )}

                <p className="text-slate-500 mt-1 text-sm font-medium">
                    Manage and monitor all company employees.
                </p>
            </motion.div>

            <div className="mt-8 flex justify-between items-center">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Total Employees: <span className="text-slate-800 font-black">{filteredEmployees.length}</span>{searchQuery.trim() ? ` (filtered from ${employees.length})` : ''}
                </div>

                <button
                    onClick={openCreateModal}
                    className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white transition-all duration-200 hover:-translate-y-0.5 shadow-sm"
                    style={{
                        background: "linear-gradient(135deg, #00b8d4, #1565c0)",
                        boxShadow: "0 4px 14px rgba(0, 184, 212, 0.3)",
                    }}
                >
                    + Add Employee
                </button>
            </div>

            <div
                className="mt-6 rounded-2xl overflow-hidden"
                style={{
                    background: "#ffffff",
                    border: "1px solid #e2eaf3",
                    boxShadow: "0 4px 24px rgba(10, 31, 61, 0.04)",
                }}
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                    <thead>
                        <tr
                            style={{
                                background: "#f8fafc",
                                borderBottom: "1px solid #e2eaf3",
                            }}
                        >
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.10em] text-slate-500">Employee ID</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.10em] text-slate-500">Name</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.10em] text-slate-500">Email</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.10em] text-slate-500">Department</th>
                            <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.10em] text-slate-500">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4">
                                        <div className="h-4 bg-slate-100 rounded w-20"></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-4 bg-slate-100 rounded w-32"></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-4 bg-slate-100 rounded w-40"></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-4 bg-slate-100 rounded w-24"></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-8 bg-slate-100 rounded w-16"></div>
                                    </td>
                                </tr>
                            ))
                        ) : error ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-6 text-center text-rose-500 font-semibold text-sm">
                                    {error}
                                </td>
                            </tr>
                        ) : filteredEmployees.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500 font-medium text-sm">
                                    No employees yet
                                </td>
                            </tr>
                        ) : (
                            filteredEmployees.map((employee) => (
                                <tr
                                    key={employee._id}
                                    className="transition duration-150"
                                    style={{
                                        borderBottom: "1px solid #e2eaf3",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = "rgba(0,184,212,0.04)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = "transparent";
                                    }}
                                >
                                    <td className="px-6 py-4 text-sm font-bold text-cyan-600 font-mono">
                                        {employee.employeeId}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-slate-800">{employee.name}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">{employee.email}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                                        {employee.department || "—"}
                                    </td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button
                                            onClick={() =>
                                                navigate(`/employees/profile/${employee.employeeId}`)
                                            }
                                            className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-800"
                                            style={{
                                                background: "rgba(10,31,61,0.03)",
                                                border: "1px solid #e2eaf3",
                                            }}
                                        >
                                            View
                                        </button>

                                        <button
                                            onClick={() => openEditModal(employee)}
                                            className="px-4 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 shadow-md"
                                            style={{
                                                background: "linear-gradient(135deg, #00b8d4, #1565c0)",
                                            }}
                                        >
                                            Edit
                                        </button>
                                    </td>

                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                </div>
            </div>

            {/* Modal remains same except button improved */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50">
                    <div
                        className="rounded-2xl p-8 w-full max-w-md"
                        style={{
                            background: "linear-gradient(135deg, #FFFFFF 0%, #F4F8FD 100%)",
                            border: "1px solid #e2eaf3",
                            boxShadow: "0 24px 64px rgba(10, 31, 61, 0.15)",
                        }}
                    >
                        <h2 className="text-xl font-black text-slate-800 mb-6 tracking-tight">
                            {editingEmployee ? "Edit Employee" : "Add Employee"}
                        </h2>

                        <div className="space-y-4">
                            <input type="text" placeholder="Name" className="tl-input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <input type="email" placeholder="Email" className="tl-input"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            <input type="text" placeholder="Department" className="tl-input"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            />
                            <input type="text" placeholder="Designation" className="tl-input"
                                value={formData.designation}
                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                            />
                            <input type="date" className="tl-input"
                                style={{ colorScheme: "light" }}
                                value={formData.dateOfJoining}
                                onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 rounded-lg text-sm font-bold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-800"
                                style={{
                                    background: "rgba(10, 31, 61, 0.03)",
                                    border: "1px solid #e2eaf3",
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="px-6 py-2 rounded-lg text-sm font-black uppercase tracking-wider text-white flex items-center justify-center gap-2 transition hover:opacity-90 shadow-md"
                                style={{
                                    background: "linear-gradient(135deg, #00b8d4, #1565c0)",
                                }}
                            >
                                {submitting && (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                )}
                                {editingEmployee
                                    ? submitting ? "Updating..." : "Update"
                                    : submitting ? "Creating..." : "Create"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeesPage;
