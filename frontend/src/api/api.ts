import { apiClient } from "./Client";
import {
    TrustLayerDashboardItem,
    TrustScoreResponse,
    TrustExplainResponse,
    InteractionResponse,
    GhostedCandidateResponse,
    HRFeedbackRequest,
    HRFeedbackResponse,
} from "../types/types";

// Helper: extract array from backend response
// Handles both: res.data = [...] and res.data = { data: [...] } or { results: [...] }
function extractArray<T>(responseData: any): T[] {
    if (Array.isArray(responseData)) return responseData as T[];
    if (responseData && Array.isArray(responseData.data)) return responseData.data as T[];
    if (responseData && Array.isArray(responseData.results)) return responseData.results as T[];
    return [];
}

// -----------------------------
// TrustLayer API Wrapper
// -----------------------------
export const API = {

    // ---------------------------------
    // Authentication
    // ---------------------------------
    login: (email: string, password: string) =>
        apiClient.post<{
            token: string;
            user: {
                id: string;
                email: string;
                role: string;
                companyId: string;
            };
        }>("/api/auth/login", { email, password }),

    // Get current authenticated user
    // Uses /api/auth/me which does NOT require a DB lookup — just verifies the JWT
    getMe: () => apiClient.get("/api/auth/me"),

    // ---------------------------------
    // Employees
    // ---------------------------------
    createEmployee: (body: {
        name: string;
        email: string;
        department?: string;
        designation?: string;
        dateOfJoining: string;
    }) =>
        apiClient.post("/api/employees", body),

    getAllEmployees: () =>
        apiClient.get("/api/employees"),

    getEmployeeById: (id: string) =>
        apiClient.get(`/api/employees/${id}`),

    getEmployeeByEmployeeId: (employeeId: string) =>
        apiClient.get(`/api/employees/by-employee-id/${employeeId}`),

    // ---------------------------------
    // Update Employee
    // ---------------------------------
    updateEmployee: (
        id: string,
        body: {
            name?: string;
            email?: string;
            department?: string;
            designation?: string;
            dateOfJoining?: string;
        }
    ) => apiClient.put(`/api/employees/${id}`, body),

    // ---------------------------------
    // Employee Profile
    // ---------------------------------
    getEmployeeProfile: (id: string) =>
        apiClient.get(`/api/employees/by-employee-id/${id}`),

    // ---------------------------------
    // Incident Types
    // ---------------------------------
    getIncidentTypes: () =>
        apiClient.get("/api/incident-types"),

    // ---------------------------------
    // Add Employee Incident
    // ---------------------------------
    addEmployeeIncident: (
        employeeId: string,
        body: {
            incidentTypeId: string;
            note?: string;
        }
    ) =>
        apiClient.post(
            `/api/employees/${employeeId}/incidents`,
            body
        ),

    // ---------------------------------
    // Dashboard — All Trust Scores
    // Returns normalized array regardless of backend response shape
    // ---------------------------------
    getAllTrackedTrustScores: async (): Promise<{ data: TrustLayerDashboardItem[] }> => {
        const res = await apiClient.get("/api/trustlayer/all");
        const items = extractArray<TrustLayerDashboardItem>(res.data);
        return { data: items };
    },

    // ---------------------------------
    // Interaction Metrics (ingestion)
    // ---------------------------------
    getInteraction: (applicationId: string) =>
        apiClient.get<InteractionResponse>(
            `/api/trustlayer/${applicationId}`
        ),

    // ---------------------------------
    // Final Trust Score
    // ---------------------------------
    getTrustScore: (applicationId: string) =>
        apiClient.get<TrustScoreResponse>(
            `/api/trustscore/${applicationId}`
        ),

    // ---------------------------------
    // Detailed Explanation
    // ---------------------------------
    getTrustExplain: (applicationId: string) =>
        apiClient.get<TrustExplainResponse>(
            `/api/trust-explain/${applicationId}`
        ),

    // ---------------------------------
    // Ghosted Candidates
    // ---------------------------------
    getGhostedCandidates: (hours = 48) =>
        apiClient.get<GhostedCandidateResponse[]>(
            `/api/trustlayer/ghosted?hours=${hours}`
        ),

    // ---------------------------------
    // HR Feedback - Fetch Single Application
    // ---------------------------------
    getHrFeedbackApplication: (applicationId: string) =>
        apiClient.get<TrustLayerDashboardItem>(
            `/api/hr-feedback/${applicationId}`
        ),
};

export const submitHRFeedback = (
    applicationId: string,
    body: HRFeedbackRequest
) =>
    apiClient.post<HRFeedbackResponse>(
        `/api/hr-feedback/${applicationId}`,
        body
    );

export const sendHrEmail = (applicationId: string, body: { hrEmail: string; hrName?: string; candidateName: string }) => {
    return apiClient.post(`/api/hr-feedback/send-email/${applicationId}`, body);
};
