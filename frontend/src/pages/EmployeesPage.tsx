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
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <h1 className="text-3xl font-semibold tracking-tight">
                    Employees
                </h1>

                {companyName && (
                    <p className="text-gray-500 mt-2">
                        Company:{" "}
                        <span className="font-medium text-gray-700">
                            {companyName}
                        </span>
                    </p>
                )}

                <p className="text-gray-500 mt-1">
                    Manage and monitor all company employees.
                </p>
            </motion.div>

            <div className="mt-8 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                    Total Employees: {filteredEmployees.length}{searchQuery.trim() ? ` (filtered from ${employees.length})` : ''}
                </div>

                <button
                    onClick={openCreateModal}
                    className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition shadow-sm"
                >
                    + Add Employee
                </button>
            </div>

            <div className="mt-6 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr>
                            <th className="px-6 py-4 text-left">Employee ID</th>
                            <th className="px-6 py-4 text-left">Name</th>
                            <th className="px-6 py-4 text-left">Email</th>
                            <th className="px-6 py-4 text-left">Department</th>
                            <th className="px-6 py-4 text-left">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4">
                                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-4 bg-gray-200 rounded w-40"></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="h-8 bg-gray-200 rounded w-16"></div>
                                    </td>
                                </tr>
                            ))
                        ) : error ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-6 text-center text-red-500">
                                    {error}
                                </td>
                            </tr>
                        ) : filteredEmployees.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                                    No employees yet
                                </td>
                            </tr>
                        ) : (
                            filteredEmployees.map((employee) => (
                                <tr key={employee._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-medium">
                                        {employee.employeeId}
                                    </td>
                                    <td className="px-6 py-4">{employee.name}</td>
                                    <td className="px-6 py-4">{employee.email}</td>
                                    <td className="px-6 py-4">
                                        {employee.department || "—"}
                                    </td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button
                                            onClick={() =>
                                                navigate(`/employees/profile/${employee.employeeId}`)
                                            }
                                            className="px-4 py-1.5 rounded-lg bg-gray-800 text-white text-xs font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                                        >
                                            View
                                        </button>

                                        <button
                                            onClick={() => openEditModal(employee)}
                                            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
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

            {/* Modal remains same except button improved */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
                        <h2 className="text-xl font-semibold mb-4">
                            {editingEmployee ? "Edit Employee" : "Add Employee"}
                        </h2>

                        <div className="space-y-4">
                            {/* inputs same as before */}
                            <input type="text" placeholder="Name" className="w-full border p-3 rounded-lg"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                            <input type="email" placeholder="Email" className="w-full border p-3 rounded-lg"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                            <input type="text" placeholder="Department" className="w-full border p-3 rounded-lg"
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            />
                            <input type="text" placeholder="Designation" className="w-full border p-3 rounded-lg"
                                value={formData.designation}
                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                            />
                            <input type="date" className="w-full border p-3 rounded-lg"
                                value={formData.dateOfJoining}
                                onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={closeModal} className="px-4 py-2 rounded-lg border">
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="px-6 py-2 rounded-lg bg-black text-white flex items-center justify-center gap-2"
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
