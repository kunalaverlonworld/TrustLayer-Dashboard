import React, { useState } from "react";
import { API } from "../../api/api";

interface Props {
    employee: any;
    onClose: () => void;
    onUpdated: () => void;
}

const EditEmployeeModal: React.FC<Props> = ({
    employee,
    onClose,
    onUpdated,
}) => {
    const [form, setForm] = useState({
        name: employee.name || "",
        email: employee.email || "",
        department: employee.department || "",
        designation: employee.designation || "",
        dateOfJoining: employee.dateOfJoining
            ? employee.dateOfJoining.split("T")[0]
            : "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await API.updateEmployee(employee._id, form);
            onUpdated();
            onClose();
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                "Failed to update employee"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
                <h2 className="text-lg font-semibold">
                    Edit Employee
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="mt-4 space-y-4"
                >
                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full border p-2 rounded-lg"
                        placeholder="Name"
                        required
                    />

                    <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full border p-2 rounded-lg"
                        placeholder="Email"
                        required
                    />

                    <input
                        name="department"
                        value={form.department}
                        onChange={handleChange}
                        className="w-full border p-2 rounded-lg"
                        placeholder="Department"
                    />

                    <input
                        name="designation"
                        value={form.designation}
                        onChange={handleChange}
                        className="w-full border p-2 rounded-lg"
                        placeholder="Designation"
                    />

                    <input
                        type="date"
                        name="dateOfJoining"
                        value={form.dateOfJoining}
                        onChange={handleChange}
                        className="w-full border p-2 rounded-lg"
                        required
                    />

                    {error && (
                        <div className="text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-lg"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-black text-white rounded-lg"
                        >
                            {loading
                                ? "Updating..."
                                : "Update"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditEmployeeModal;
