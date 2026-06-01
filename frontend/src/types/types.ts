// -----------------------------
// TrustLayer Frontend Type Definitions
// -----------------------------

// ---------------------------------
// Shared Candidate Info
// ---------------------------------
export interface CandidateInfo {
    name: string;
    email: string;
    jobTitle: string;
    department: string;
    location: string;
    stage: string;
}

export interface Employment {
    companyName: string;
    hrName: string;
    hrEmail: string;
    employmentStartDate: string;
    employmentEndDate?: string;
    consentToContact: boolean;
}
// --------------------------------------------
// Trust Layer - Dashboard Item
// --------------------------------------------
export interface TrustLayerDashboardItem {
    applicationId: string;
    totalInteractions: number;
    totalOpens: number;
    totalClicks: number;
    finalTrustScore: number;
    riskLevel: "Low" | "Moderate" | "High";
    hrFeedbackSubmitted: boolean;

    candidate: {
        name: string;
        email: string;
        jobTitle: string;
        department: string;
        stage: string;
        yearsOfExperience?: number;
        previousEmployments?: Employment[];
    };
}

// --------------------------------------------
// Trust Explain Response (Matches Backend)
// --------------------------------------------
export interface TrustExplainResponse {
    applicationId: string;
    totalInteractions: number;
    finalTrustScore: number;
    riskLevel: "Low" | "Moderate" | "High";

    components: {
        interaction?: {
            averageNormalizedScore: number;
            weight: number;
            weightedContribution: number;
            openCountTotal: number;
            clickCountTotal: number;
            ghostingDetected: boolean;
        };

        hrFeedback?: {
            calculatedHrScore: number;
            weight: number;
            weightedContribution: number;
            reliabilityScore: number;
            communicationScore: number;
            commitmentScore: number;
            rehireScore: number;
            offerOutcomeScore: number;
        };
    };

    explanation: string[];
}


// ---------------------------------
// Single Interaction Response
// ( /trustlayer/:applicationId )
// ---------------------------------
export interface InteractionResponse {
    applicationId: string;

    openCount: number;
    clickCount: number;

    lastOpenedAt?: string | null;
    lastClickAt?: string | null;
    sentAt?: string;

    events: any[];
}

// ---------------------------------
// Trust Score Summary
// ( /trustscore/:applicationId )
// ---------------------------------
export interface TrustScoreResponse {
    applicationId: string;
    finalTrustScore: number;
    riskLevel: "Low" | "Moderate" | "High";
}

// ---------------------------------
// Detailed Trust Explanation
// ( /trust-explain/:applicationId )
// ---------------------------------

// ---------------------------------
// Ghosted Candidates
// ( /trustlayer/ghosted )
// ---------------------------------
export interface GhostedCandidateResponse {
    applicationId: string;

    candidate: {
        name: string;
        email: string;
        stage: string;
    };

    hoursInactive: number;
    openCount: number;
    clickCount: number;
}

// ---------------------------------
// HR Feedback
// ---------------------------------
export interface HRFeedbackRequest {
    reliabilityScore: number;     // 1–5
    communicationScore: number;   // 1–5
    commitmentScore: number;      // 1–5
    rehireScore: number;          // 1–5
    offerOutcomeScore: number;    // 1–5
    comments?: string;
}

export interface HRFeedbackResponse {
    message: string;
    applicationId: string;
    hrScore: number;
}
