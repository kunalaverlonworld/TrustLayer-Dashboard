import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { API } from "../../api/api";

interface IncidentType {
    _id: string;
    name: string;
    impact: number;
    type: "positive" | "negative";
}

interface Props {
    employeeId: string;
    onClose: () => void;
    onSuccess: (updatedEmployee: any) => void;
}

const AddIncidentModal: React.FC<Props> = ({
    employeeId,
    onClose,
    onSuccess,
}) => {
    const [incidentTypes, setIncidentTypes] = useState<IncidentType[]>([]);
    const [selectedIncident, setSelectedIncident] = useState<string>("");
    const [note, setNote] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchIncidentTypes = async () => {
            try {
                const res = await API.getIncidentTypes();
                setIncidentTypes(res.data.data || []);
            } catch (error) {
                toast.error("Failed to load incident types");
            }
        };

        fetchIncidentTypes();
    }, []);

    const handleSubmit = async () => {
        if (!selectedIncident) {
            toast.error("Please select an incident type");
            return;
        }

        try {
            setLoading(true);

            const res = await API.addEmployeeIncident(employeeId, {
                incidentTypeId: selectedIncident,
                note,
            });

            const updatedEmployee = res.data.data.employee;

            toast.success("Incident added & trust updated");
            onSuccess(updatedEmployee);
            onClose();
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                "Failed to add incident"
            );
        } finally {
            setLoading(false);
        }
    };

    const selectedIncidentObj = incidentTypes.find(
        (i) => i._id === selectedIncident
    );

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                <h2 className="text-lg font-semibold mb-4">
                    Add Incident
                </h2>

                <select
                    className="w-full border p-3 rounded-lg mb-3"
                    value={selectedIncident}
                    onChange={(e) =>
                        setSelectedIncident(e.target.value)
                    }
                >
                    <option value="">Select Incident</option>
                    {incidentTypes.map((incident) => (
                        <option
                            key={incident._id}
                            value={incident._id}
                        >
                            {incident.name}
                        </option>
                    ))}
                </select>

                {selectedIncidentObj && (
                    <div className="mb-3 text-sm">
                        Impact:{" "}
                        <span
                            className={
                                selectedIncidentObj.impact > 0
                                    ? "text-green-600"
                                    : "text-red-600"
                            }
                        >
                            {selectedIncidentObj.impact}
                        </span>
                    </div>
                )}

                <textarea
                    placeholder="Optional note"
                    className="w-full border p-3 rounded-lg mb-4"
                    value={note}
                    onChange={(e) =>
                        setNote(e.target.value)
                    }
                />

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-lg"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-5 py-2 bg-black text-white rounded-lg"
                    >
                        {loading ? "Adding..." : "Add"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddIncidentModal;
