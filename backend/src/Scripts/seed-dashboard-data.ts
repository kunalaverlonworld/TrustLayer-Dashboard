import mongoose from "mongoose";
import dotenv from "dotenv";
import { TrustMetrics } from "../models/TrustMetrics";
import { HrFeedback } from "../models/HrFeedback";
import { Company } from "../models/Company";

dotenv.config();

const seedDashboardData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || "");
        console.log("✅ Connected to MongoDB");

        // Get the default company
        let company = await Company.findOne({ companyCode: "DEFAULT" });
        if (!company) {
            company = await Company.create({
                name: "Default Company",
                companyCode: "DEFAULT",
            });
            console.log("📝 Created default company");
        }

        const companyId = company._id;

        // Sample applications data with Indian names
        const sampleData = [
            {
                applicationId: "app-001",
                companyName: "Default Company",
                candidateName: "Rajesh Kumar",
                candidateEmail: "rajesh.kumar@example.com",
                jobTitle: "Senior Software Engineer",
                department: "Engineering",
                location: "Bangalore",
                yearsOfExperience: 8,
                openCount: 12,
                clickCount: 8,
                engagementScore: 88,
                isGhosting: false,
                lastOpenedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            },
            {
                applicationId: "app-002",
                companyName: "Default Company",
                candidateName: "Priya Sharma",
                candidateEmail: "priya.sharma@example.com",
                jobTitle: "Product Manager",
                department: "Product",
                location: "Mumbai",
                yearsOfExperience: 6,
                openCount: 3,
                clickCount: 1,
                engagementScore: 45,
                isGhosting: true,
                lastOpenedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
                sentAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
            },
            {
                applicationId: "app-003",
                companyName: "Default Company",
                candidateName: "Ananya Patel",
                candidateEmail: "ananya.patel@example.com",
                jobTitle: "UX/UI Designer",
                department: "Design",
                location: "Pune",
                yearsOfExperience: 5,
                openCount: 15,
                clickCount: 11,
                engagementScore: 95,
                isGhosting: false,
                lastOpenedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            },
            {
                applicationId: "app-004",
                companyName: "Default Company",
                candidateName: "Vikram Singh",
                candidateEmail: "vikram.singh@example.com",
                jobTitle: "Data Scientist",
                department: "Analytics",
                location: "Delhi",
                yearsOfExperience: 7,
                openCount: 9,
                clickCount: 5,
                engagementScore: 78,
                isGhosting: false,
                lastOpenedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
                sentAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            },
            {
                applicationId: "app-005",
                companyName: "Default Company",
                candidateName: "Neha Gupta",
                candidateEmail: "neha.gupta@example.com",
                jobTitle: "Marketing Manager",
                department: "Marketing",
                location: "Hyderabad",
                yearsOfExperience: 4,
                openCount: 2,
                clickCount: 0,
                engagementScore: 25,
                isGhosting: true,
                lastOpenedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
                sentAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            },
            {
                applicationId: "app-006",
                companyName: "Default Company",
                candidateName: "Arjun Mehta",
                candidateEmail: "arjun.mehta@example.com",
                jobTitle: "Full Stack Developer",
                department: "Engineering",
                location: "Bangalore",
                yearsOfExperience: 9,
                openCount: 18,
                clickCount: 14,
                engagementScore: 92,
                isGhosting: false,
                lastOpenedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
                sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            },
            {
                applicationId: "app-007",
                companyName: "Default Company",
                candidateName: "Divya Reddy",
                candidateEmail: "divya.reddy@example.com",
                jobTitle: "HR Manager",
                department: "Human Resources",
                location: "Bangalore",
                yearsOfExperience: 6,
                openCount: 7,
                clickCount: 4,
                engagementScore: 68,
                isGhosting: false,
                lastOpenedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            },
            {
                applicationId: "app-008",
                companyName: "Default Company",
                candidateName: "Sanjay Nair",
                candidateEmail: "sanjay.nair@example.com",
                jobTitle: "DevOps Engineer",
                department: "Engineering",
                location: "Kochi",
                yearsOfExperience: 7,
                openCount: 11,
                clickCount: 9,
                engagementScore: 85,
                isGhosting: false,
                lastOpenedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                sentAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
            },
            {
                applicationId: "app-009",
                companyName: "Default Company",
                candidateName: "Kavya Iyer",
                candidateEmail: "kavya.iyer@example.com",
                jobTitle: "Business Analyst",
                department: "Product",
                location: "Chennai",
                yearsOfExperience: 5,
                openCount: 4,
                clickCount: 2,
                engagementScore: 55,
                isGhosting: false,
                lastOpenedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
                sentAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
            },
            {
                applicationId: "app-010",
                companyName: "Default Company",
                candidateName: "Rohan Desai",
                candidateEmail: "rohan.desai@example.com",
                jobTitle: "QA Engineer",
                department: "Quality Assurance",
                location: "Pune",
                yearsOfExperience: 4,
                openCount: 8,
                clickCount: 6,
                engagementScore: 82,
                isGhosting: false,
                lastOpenedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
                sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            },
        ];

        // Seed TrustMetrics
        for (const data of sampleData) {
            await TrustMetrics.findOneAndUpdate(
                {
                    applicationId: data.applicationId,
                    companyId,
                },
                {
                    companyId,
                    applicationId: data.applicationId,
                    companyName: data.companyName,
                    candidateName: data.candidateName,
                    candidateEmail: data.candidateEmail,
                    jobTitle: data.jobTitle,
                    department: data.department,
                    location: data.location,
                    yearsOfExperience: data.yearsOfExperience,
                    openCount: data.openCount,
                    clickCount: data.clickCount,
                    engagementScore: data.engagementScore,
                    isGhosting: data.isGhosting,
                    lastOpenedAt: data.lastOpenedAt,
                    sentAt: data.sentAt,
                    hrFeedbackSubmitted: Math.random() > 0.6, // 40% submitted
                    hrFeedbackEmailSent: false,
                    updatedAt: new Date(),
                },
                { upsert: true, new: true }
            );
        }

        // Also store candidate details separately for reference
        console.log("\n📋 Sample Data Added:");
        sampleData.forEach((candidate) => {
            console.log(`  • ${candidate.candidateName} (${candidate.jobTitle}) - ${candidate.location}`);
            console.log(`    Email: ${candidate.candidateEmail}`);
            console.log(`    Opens: ${candidate.openCount} | Clicks: ${candidate.clickCount} | Trust: ${candidate.engagementScore}%`);
        });
        console.log("🎉 Dashboard data seeding completed!");

    } catch (error) {
        console.error("❌ Error seeding dashboard data:", error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
};

seedDashboardData();
